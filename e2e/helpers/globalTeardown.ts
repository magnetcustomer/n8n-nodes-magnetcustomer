// e2e/helpers/globalTeardown.ts
import { loadConfig } from './config';
import * as cleanup from './cleanup';
import { deleteAllTrackedWorkflows } from './n8nClient';

export default async function globalTeardown() {
  console.log('\n[E2E Global Teardown] Starting...');

  try {
    loadConfig();
  } catch {
    console.log('  Config not available, skipping cleanup');
    return;
  }

  // 1. Sweep all n8n-e2e-* records
  try {
    const results = await cleanup.sweepAll();
    for (const r of results) {
      console.log(`  Cleaned ${r.deleted} ${r.resource}`);
    }
    if (results.length === 0) {
      console.log('  No test records to clean');
    }
  } catch (e: any) {
    console.warn(`  Cleanup sweep failed: ${e.message}`);
  }

  // 2. Delete tracked workflows
  try {
    const deleted = await deleteAllTrackedWorkflows();
    if (deleted > 0) {
      console.log(`  Deleted ${deleted} workflows from n8n`);
    }
  } catch (e: any) {
    console.warn(`  Workflow cleanup failed: ${e.message}`);
  }

  console.log('[E2E Global Teardown] Done.\n');
}
