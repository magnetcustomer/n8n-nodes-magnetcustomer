// e2e/helpers/testContext.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

interface E2EContext {
  pipelineId?: string;
  stageId?: string;
  roleId?: string;
  treatmentTypeId?: string;
  customFieldTypeId?: string;
  credentialId?: string;
  requiredCustomFields_prospect?: string; // JSON-stringified array
  requiredCustomFields_customer?: string; // JSON-stringified array
  requiredCustomFields_lead?: string; // JSON-stringified array
}

let ctx: E2EContext | null = null;

export function getE2EContext(): E2EContext {
  if (ctx) return ctx;

  loadConfig();

  if (!fs.existsSync(CONTEXT_FILE)) {
    throw new Error('E2E context not found. Run globalSetup first.');
  }

  ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
  return ctx!;
}

export function getCredentialId(): string {
  const c = getE2EContext();
  if (!c.credentialId) throw new Error('No credential ID in E2E context');
  return c.credentialId;
}

/**
 * Get required custom fields discovered by globalSetup for a specific lifecycle.
 * Returns array of { _id, v } matching the n8n customFieldCollection format.
 * The node's addCustomFields() converts _id → customField before sending to API.
 */
export function getRequiredCustomFields(lifecycle: 'prospect' | 'customer' | 'lead'): Array<{ _id: string; v: string }> {
  const c = getE2EContext();
  const key = `requiredCustomFields_${lifecycle}` as keyof E2EContext;
  const raw = c[key];
  if (!raw) return [];
  try {
    const fields = JSON.parse(raw);
    return fields.map((f: any) => ({ _id: f.customField, v: f.v }));
  } catch {
    return [];
  }
}
