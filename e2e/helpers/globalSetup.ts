// e2e/helpers/globalSetup.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, getApiToken } from './config';
import { discoverRequiredFields } from './fieldDiscovery';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

/** Login to n8n internal REST and return session cookie */
async function n8nLogin(baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/rest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrLdapLoginId: 'e2e@magnetcustomer.com', password: '<E2E_PASSWORD>' }),
  });
  const cookies = (res.headers as any).getSetCookie?.() || [];
  return (cookies[0] || res.headers.get('set-cookie') || '').split(';')[0];
}

export default async function globalSetup() {
  console.log('\n[E2E Global Setup] Starting...');

  // 1. Load and validate config
  const config = loadConfig();
  console.log(`  n8n: ${config.n8n.url}`);
  console.log(`  MC API: ${config.magnetCustomer.apiUrl}`);

  // 2. Test n8n connectivity
  const n8nHealth = await fetch(`${config.n8n.url}/healthz`).catch(() => null);
  if (!n8nHealth?.ok) {
    throw new Error(`n8n not reachable at ${config.n8n.url}. Run: npm run e2e:infra:start`);
  }
  console.log('  n8n: healthy');

  // 3. Get fresh API token via Keycloak client credentials
  console.log('  Keycloak: obtaining token...');
  const apiToken = await getApiToken();
  console.log(`  Keycloak: token obtained (${apiToken.length} chars, valid 1h)`);

  // 4. Test MC API connectivity with the fresh token
  const mcRes = await fetch(`${config.magnetCustomer.apiUrl}/health`).catch(() => null);
  if (!mcRes?.ok) {
    throw new Error(`MagnetCustomer API not reachable at ${config.magnetCustomer.apiUrl}`);
  }
  console.log('  MC API: healthy');

  // 5. Login to n8n and persist cookie for test workers
  const cookie = await n8nLogin(config.n8n.url);
  if (!cookie) {
    throw new Error('Failed to login to n8n');
  }
  // Save cookie so n8nClient in test workers doesn't need to login again (avoids rate limiting)
  const cookieFile = path.resolve(__dirname, '../config/.n8n-session-cookie');
  fs.writeFileSync(cookieFile, cookie);

  // 6. Find or create n8n credential with fresh token
  const context: Record<string, string> = {};

  const credsRes = await fetch(`${config.n8n.url}/rest/credentials`, {
    headers: { 'Cookie': cookie },
  });
  const credsList = (await credsRes.json()).data || [];
  let mcCred = credsList.find((c: any) => c.type === 'magnetCustomerApi');

  if (mcCred) {
    // Update existing credential with fresh token
    await fetch(`${config.n8n.url}/rest/credentials/${mcCred.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({
        name: mcCred.name,
        type: 'magnetCustomerApi',
        data: { subDomainAccount: config.magnetCustomer.subDomainAccount, email: '', apiToken },
      }),
    });
    context.credentialId = mcCred.id;
    console.log(`  n8n Credential: updated token (${mcCred.id})`);
  } else {
    // Create new credential
    const createRes = await fetch(`${config.n8n.url}/rest/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({
        name: 'MagnetCustomer E2E',
        type: 'magnetCustomerApi',
        data: { subDomainAccount: config.magnetCustomer.subDomainAccount, email: '', apiToken },
      }),
    });
    const newCred = (await createRes.json()).data;
    context.credentialId = newCred?.id || '';
    console.log(`  n8n Credential: created (${context.credentialId})`);
  }

  // 7. Fetch base data for dependent test suites
  const mcFetch = async (endpoint: string) => {
    const res = await fetch(`${config.magnetCustomer.apiUrl}/api${endpoint}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` },
    });
    return res.ok ? res.json() : null;
  };

  // Pipeline
  try {
    const pipelines = await mcFetch('/pipelines');
    const list = Array.isArray(pipelines) ? pipelines : pipelines?.docs || pipelines?.data || [];
    if (list.length > 0) {
      context.pipelineId = list[0]._id;
      console.log(`  Pipeline: ${list[0].title || list[0]._id}`);
    }
  } catch { console.warn('  Pipeline: not available'); }

  // Role — filter by name not empty to get a valid role
  try {
    const roles = await mcFetch('/roles');
    const list = Array.isArray(roles) ? roles : roles?.data || [];
    const validRole = list.find((r: any) => r.name && r.name.trim() !== '');
    if (validRole) {
      context.roleId = validRole._id;
      console.log(`  Role: ${validRole.name} (${validRole._id})`);
    } else if (list.length > 0) {
      context.roleId = list[0]._id;
      console.log(`  Role: ${list[0]._id} (fallback — no named role found)`);
    }
  } catch { console.warn('  Role: not available'); }

  // TreatmentType
  try {
    const types = await mcFetch('/treatments/types');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.treatmentTypeId = list[0]._id;
      console.log(`  TreatmentType: ${list[0].name || list[0]._id}`);
    }
  } catch { console.warn('  TreatmentType: not available'); }

  // CustomFieldType
  try {
    const types = await mcFetch('/customfieldtypes');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.customFieldTypeId = list[0]._id;
      console.log(`  CustomFieldType: ${list[0].name || list[0]._id}`);
    }
  } catch { console.warn('  CustomFieldType: not available'); }

  // Stage (for deal creation)
  if (context.pipelineId) {
    try {
      const stages = await mcFetch(`/pipelines/${context.pipelineId}/stages`);
      const stageList = Array.isArray(stages) ? stages : stages?.docs || stages?.data || [];
      if (stageList.length > 0) {
        context.stageId = stageList[0]._id;
        console.log(`  Stage: ${stageList[0].title || stageList[0].name || stageList[0]._id}`);
      }
    } catch { console.warn('  Stage: not available'); }
  }

  // TaskType — first active task type for task creation
  try {
    const types = await mcFetch('/tasks/types');
    const list = Array.isArray(types) ? types : types?.docs || types?.data || [];
    const activeType = list.find((t: any) => t.active !== false) || list[0];
    if (activeType) {
      context.taskTypeId = activeType._id;
      console.log(`  TaskType: ${activeType.name || activeType._id}`);
    }
  } catch { console.warn('  TaskType: not available'); }

  // StaffId — first active staff (needed for deal/pipeline creation)
  try {
    const staffs = await mcFetch('/staffs?limit=5');
    const list = Array.isArray(staffs) ? staffs : staffs?.docs || staffs?.data || [];
    const activeStaff = list.find((s: any) => s.active !== false) || list[0];
    if (activeStaff) {
      context.staffId = activeStaff._id;
      console.log(`  Staff: ${activeStaff.fullname || activeStaff._id}`);
    }
  } catch { console.warn('  Staff: not available'); }

  // 8. Discover required custom fields per feature/lifecycle using fieldDiscovery engine
  const featureConfigs = [
    { feature: 'contact', lifecycle: 'prospect', key: 'requiredFields_prospect' },
    { feature: 'contact', lifecycle: 'customer', key: 'requiredFields_customer' },
    { feature: 'contact', lifecycle: 'lead', key: 'requiredFields_lead' },
    { feature: 'deal', key: 'requiredFields_deal' },
    { feature: 'organization', key: 'requiredFields_organization' },
    { feature: 'staff', key: 'requiredFields_staff' },
    { feature: 'meeting', key: 'requiredFields_meeting' },
    { feature: 'task', key: 'requiredFields_task' },
    { feature: 'ticket', key: 'requiredFields_ticket' },
  ];

  for (const cfg of featureConfigs) {
    try {
      const fields = await discoverRequiredFields(
        config.magnetCustomer.apiUrl, apiToken, cfg.feature, cfg.lifecycle,
      );
      if (fields.length > 0) {
        context[cfg.key] = JSON.stringify(fields);
        console.log(`  Required fields (${cfg.key}): ${fields.map(f => `${f.name}[${f.fieldType}]`).join(', ')}`);
      }
    } catch (e: any) {
      console.warn(`  Required fields (${cfg.key}): ${e.message || 'discovery failed'}`);
    }
  }

  // 9. Save context
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  console.log('[E2E Global Setup] Done.\n');
}
