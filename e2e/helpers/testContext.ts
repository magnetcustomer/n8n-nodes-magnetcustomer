// e2e/helpers/testContext.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

interface E2EContext {
  pipelineId?: string;
  roleId?: string;
  treatmentTypeId?: string;
  customFieldTypeId?: string;
  credentialId?: string;
  requiredCustomFields?: string; // JSON-stringified array
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
 * Get required custom fields discovered by globalSetup.
 * Returns array of { _id, v } matching the n8n customFieldCollection format.
 * The node's addCustomFields() converts _id → customField before sending to API.
 */
export function getRequiredCustomFields(): Array<{ _id: string; v: string }> {
  const c = getE2EContext();
  if (!c.requiredCustomFields) return [];
  try {
    const fields = JSON.parse(c.requiredCustomFields);
    return fields.map((f: any) => ({ _id: f.customField, v: f.v }));
  } catch {
    return [];
  }
}
