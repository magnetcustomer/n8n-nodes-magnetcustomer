// e2e/helpers/testContext.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

interface E2EContext {
  pipelineId?: string;
  stageId?: string;
  roleId?: string;
  staffId?: string;
  taskTypeId?: string;
  treatmentTypeId?: string;
  customFieldTypeId?: string;
  credentialId?: string;
  // Dynamic required fields per feature/lifecycle (JSON-stringified DiscoveredField[])
  [key: string]: string | undefined;
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
 * Get required custom fields for a feature (and optional lifecycle).
 * Returns array of { _id, v } matching the n8n customFieldCollection format.
 *
 * Key resolution:
 *  - contact + lifecycle → requiredFields_{lifecycle}  (e.g. requiredFields_prospect)
 *  - deal (no lifecycle) → requiredFields_deal
 */
export function getRequiredFieldsForFeature(
  feature: string,
  lifecycle?: string,
): Array<{ _id: string; v: string }> {
  const c = getE2EContext();
  const key = lifecycle
    ? `requiredFields_${lifecycle}`
    : `requiredFields_${feature}`;
  const raw = c[key];
  if (!raw) return [];
  try {
    const fields = JSON.parse(raw);
    return fields.map((f: any) => ({ _id: f._id, v: f.value }));
  } catch {
    return [];
  }
}

/**
 * Backward compat: Get required custom fields discovered by globalSetup for a specific lifecycle.
 * Returns array of { _id, v } matching the n8n customFieldCollection format.
 */
export function getRequiredCustomFields(lifecycle: 'prospect' | 'customer' | 'lead'): Array<{ _id: string; v: string }> {
  return getRequiredFieldsForFeature('contact', lifecycle);
}

/** Get first active staff ID from context (needed for deal/pipeline creation) */
export function getStaffId(): string {
  const c = getE2EContext();
  return c.staffId || '';
}

/** Get first active task type ID from context */
export function getTaskTypeId(): string {
  const c = getE2EContext();
  return c.taskTypeId || '';
}

/** Get first stage ID from context (for deal creation) */
export function getStageId(): string {
  const c = getE2EContext();
  return c.stageId || '';
}

/** Get role ID from context (for staff creation) */
export function getRoleId(): string {
  const c = getE2EContext();
  return c.roleId || '';
}
