/**
 * n8n REST API client for E2E tests.
 *
 * Uses internal REST API (cookie-based auth) for full access.
 * The public API has too many scope restrictions in n8n 2.x.
 *
 * Execution strategy: Webhook node with httpMethod POST + responseMode "lastNode".
 * POST to webhook URL → n8n executes workflow → returns output in HTTP response.
 */
import { getConfig } from './config';

interface WorkflowConfig {
  resource: string;
  operation: string;
  params: Record<string, any>;
  credentialId: string;
}

interface ExecutionResult {
  status: 'success' | 'error';
  output: Record<string, any>[];
  error?: string;
}

// ------------------------------------------------------------------ auth

import * as fs from 'fs';
import * as path from 'path';

const COOKIE_FILE = path.resolve(__dirname, '../config/.n8n-session-cookie');

/** Persist cookie to disk so it survives across Jest worker processes */
function loadCachedCookie(): string | null {
  try {
    if (fs.existsSync(COOKIE_FILE)) {
      return fs.readFileSync(COOKIE_FILE, 'utf-8').trim() || null;
    }
  } catch {}
  return null;
}

let sessionCookie: string | null = loadCachedCookie();

async function ensureSession(): Promise<string> {
  if (sessionCookie) return sessionCookie;

  const config = getConfig();
  const res = await fetch(`${config.n8n.url}/rest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrLdapLoginId: 'e2e@magnetcustomer.com',
      password: '<E2E_PASSWORD>',
    }),
  });

  if (!res.ok) {
    throw new Error(`n8n login failed: ${res.status} ${await res.text()}`);
  }

  const cookies = (res.headers as any).getSetCookie?.() || [];
  const cookie = (cookies[0] || res.headers.get('set-cookie') || '').split(';')[0];
  if (!cookie) throw new Error('No session cookie from n8n login');

  sessionCookie = cookie;
  // Persist so other Jest worker processes can reuse
  try { fs.writeFileSync(COOKIE_FILE, cookie); } catch {}
  return cookie;
}

// ------------------------------------------------------------------ fetch

async function n8nFetch(path: string, options: RequestInit = {}): Promise<any> {
  const config = getConfig();
  const cookie = await ensureSession();
  const url = `${config.n8n.url}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`n8n API ${res.status} ${path}: ${body}`);
  }

  const text = await res.text();
  if (!text) return null;

  const parsed = JSON.parse(text);
  // Internal REST wraps response in { data: ... }
  return parsed.data !== undefined ? parsed.data : parsed;
}

// ------------------------------------------------------------------ workflow builders

function buildWorkflowJson(wfConfig: WorkflowConfig): object {
  const { resource, operation, params, credentialId } = wfConfig;
  const webhookPath = `e2e-${resource}-${operation}-${Date.now()}`;

  return {
    name: `e2e-${resource}-${operation}-${Date.now()}`,
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPath,
          responseMode: 'lastNode',
          options: {},
        },
        id: 'webhook-1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [0, 0],
        webhookId: webhookPath,
      },
      {
        parameters: {
          authentication: 'apiToken',
          resource,
          operation,
          ...params,
        },
        id: 'mc-1',
        name: 'MagnetCustomer',
        type: '@magnetcustomer/n8n-nodes-magnetcustomer.magnetCustomer',
        typeVersion: 1,
        position: [220, 0],
        credentials: {
          magnetCustomerApi: {
            id: credentialId,
            name: 'MagnetCustomer E2E',
          },
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'MagnetCustomer', type: 'main', index: 0 }]],
      },
    },
    settings: { executionOrder: 'v1' },
  };
}

function buildTriggerWorkflowJson(
  resource: string,
  action: string,
  credentialId: string,
): object {
  return {
    name: `e2e-trigger-${resource}-${action}-${Date.now()}`,
    nodes: [
      {
        parameters: {
          authentication: 'apiToken',
          resource,
          action,
          incomingAuthentication: 'none',
        },
        id: 'trigger-1',
        name: 'MagnetCustomer Trigger',
        type: '@magnetcustomer/n8n-nodes-magnetcustomer.magnetCustomerTrigger',
        typeVersion: 1,
        position: [0, 0],
        webhookId: `e2e-trigger-${Date.now()}`,
        credentials: {
          magnetCustomerApi: {
            id: credentialId,
            name: 'MagnetCustomer E2E',
          },
        },
      },
    ],
    connections: {},
    settings: { executionOrder: 'v1' },
  };
}

// ------------------------------------------------------------------ workflow CRUD

export async function createWorkflow(config: WorkflowConfig): Promise<{ id: string; webhookPath: string }> {
  const body = buildWorkflowJson(config);
  const result = await n8nFetch('/rest/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const webhookNode = result.nodes?.find((n: any) => n.type === 'n8n-nodes-base.webhook');
  const webhookPath = webhookNode?.parameters?.path || webhookNode?.webhookId || result.id;

  return { id: result.id, webhookPath };
}

export async function createTriggerWorkflow(
  resource: string,
  action: string,
  credentialId: string,
): Promise<{ id: string; webhookPath: string }> {
  const body = buildTriggerWorkflowJson(resource, action, credentialId);
  const result = await n8nFetch('/rest/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const triggerNode = result.nodes?.find((n: any) => n.type?.includes('Trigger'));
  const webhookPath = triggerNode?.webhookId || result.id;

  return { id: result.id, webhookPath };
}

// ------------------------------------------------------------------ execution

export async function executeAndWait(workflowId: string, webhookPath: string): Promise<ExecutionResult> {
  const config = getConfig();

  // Activate the workflow (webhooks only work when active)
  await activateWorkflow(workflowId);

  // Small delay for n8n to register the webhook
  await new Promise((r) => setTimeout(r, 500));

  // POST to the webhook URL — triggers execution, returns output directly
  const webhookUrl = `${config.n8n.url}/webhook/${webhookPath}`;
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger: true }),
  });

  // Deactivate after execution
  try { await deactivateWorkflow(workflowId); } catch {}

  if (!res.ok) {
    const body = await res.text();
    return { status: 'error', output: [], error: `Webhook ${res.status}: ${body}` };
  }

  const responseBody = await res.text();
  if (!responseBody) return { status: 'success', output: [] };

  const data = JSON.parse(responseBody);
  const output = Array.isArray(data) ? data : [data];

  return { status: 'success', output };
}

// ------------------------------------------------------------------ lifecycle

export async function activateWorkflow(workflowId: string): Promise<void> {
  // n8n 2.x internal REST requires versionId for activate
  const wf = await n8nFetch(`/rest/workflows/${workflowId}`);
  await n8nFetch(`/rest/workflows/${workflowId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ versionId: wf.versionId }),
  });
}

export async function deactivateWorkflow(workflowId: string): Promise<void> {
  const wf = await n8nFetch(`/rest/workflows/${workflowId}`);
  await n8nFetch(`/rest/workflows/${workflowId}/deactivate`, {
    method: 'POST',
    body: JSON.stringify({ versionId: wf.versionId }),
  });
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/rest/workflows/${workflowId}`, { method: 'DELETE' });
}

export async function getWebhookUrl(webhookPath: string): Promise<string> {
  const config = getConfig();
  return `${config.n8n.url}/webhook/${webhookPath}`;
}

// ------------------------------------------------------------------ tracking

const createdWorkflowIds: string[] = [];

export function trackWorkflow(id: string): void {
  createdWorkflowIds.push(id);
}

export function getTrackedWorkflows(): string[] {
  return [...createdWorkflowIds];
}

export async function deleteAllTrackedWorkflows(): Promise<number> {
  let deleted = 0;
  for (const id of createdWorkflowIds) {
    try {
      try { await deactivateWorkflow(id); } catch {}
      await deleteWorkflow(id);
      deleted++;
    } catch {}
  }
  createdWorkflowIds.length = 0;
  return deleted;
}
