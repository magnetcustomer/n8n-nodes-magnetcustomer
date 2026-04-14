// e2e/helpers/n8nClient.ts
import { getConfig } from './config';

interface WorkflowConfig {
  resource: string;
  operation: string;
  params: Record<string, any>;
  credentialId: string;
}

interface ExecutionResult {
  status: 'success' | 'error' | 'waiting';
  output: Record<string, any>[];
  error?: string;
}

async function n8nFetch(path: string, options: RequestInit = {}): Promise<any> {
  const config = getConfig();
  const url = `${config.n8n.url}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': config.n8n.apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`n8n API ${res.status} ${path}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function buildWorkflowJson(wfConfig: WorkflowConfig): object {
  const { resource, operation, params, credentialId } = wfConfig;

  const nodeParams: Record<string, any> = {
    authentication: 'apiToken',
    resource,
    operation,
    ...params,
  };

  return {
    name: `e2e-${resource}-${operation}-${Date.now()}`,
    nodes: [
      {
        parameters: {},
        id: 'trigger-1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [0, 0],
      },
      {
        parameters: nodeParams,
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
      'Manual Trigger': {
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
        webhookId: `e2e-${Date.now()}`,
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

export async function createWorkflow(config: WorkflowConfig): Promise<{ id: string }> {
  const body = buildWorkflowJson(config);
  const result = await n8nFetch('/api/v1/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return { id: result.id };
}

export async function createTriggerWorkflow(
  resource: string,
  action: string,
  credentialId: string,
): Promise<{ id: string; webhookPath: string }> {
  const body = buildTriggerWorkflowJson(resource, action, credentialId);
  const result = await n8nFetch('/api/v1/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const webhookNode = result.nodes?.find((n: any) => n.type?.includes('Trigger'));
  const webhookPath = webhookNode?.webhookId || result.id;

  return { id: result.id, webhookPath };
}

export async function executeAndWait(workflowId: string): Promise<ExecutionResult> {
  const config = getConfig();
  const timeout = config.options.timeoutMs;

  const execResponse = await n8nFetch(`/api/v1/workflows/${workflowId}/run`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  const executionId = execResponse.data?.executionId || execResponse.executionId;
  if (!executionId) {
    throw new Error(`No executionId returned for workflow ${workflowId}`);
  }

  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exec = await n8nFetch(`/api/v1/executions/${executionId}`);

    if (exec.finished || exec.status === 'success' || exec.status === 'error') {
      const lastNode = exec.data?.resultData?.runData?.['MagnetCustomer'];
      const output = lastNode?.[0]?.data?.main?.[0]?.map((item: any) => item.json) || [];

      return {
        status: exec.status === 'error' ? 'error' : 'success',
        output,
        error: exec.data?.resultData?.error?.message,
      };
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`Execution ${executionId} timed out after ${timeout}ms`);
}

export async function activateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}/activate`, { method: 'POST' });
}

export async function deactivateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}/deactivate`, { method: 'POST' });
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}`, { method: 'DELETE' });
}

export async function getWebhookUrl(webhookPath: string): Promise<string> {
  const config = getConfig();
  return `${config.n8n.url}/webhook/${webhookPath}`;
}

/** Track workflow IDs for cleanup */
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
      await deleteWorkflow(id);
      deleted++;
    } catch { /* workflow may already be deleted */ }
  }
  createdWorkflowIds.length = 0;
  return deleted;
}

/** Get credential ID by name */
export async function getCredentialId(name: string): Promise<string> {
  const result = await n8nFetch('/api/v1/credentials');
  const cred = result.data?.find((c: any) => c.name === name);
  if (!cred) throw new Error(`Credential "${name}" not found in n8n`);
  return cred.id;
}
