// e2e/helpers/globalSetup.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, getApiToken } from './config';
import * as mcClient from './mcClient';

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

  // 5. Login to n8n
  const cookie = await n8nLogin(config.n8n.url);
  if (!cookie) {
    throw new Error('Failed to login to n8n');
  }

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
  // Use the fresh token for mcClient auth
  // (mcClient uses config.magnetCustomer.clientSecret which is the Keycloak secret,
  //  but we need a bearer token. Let's use direct fetch with the API token.)

  const mcFetch = async (endpoint: string) => {
    const res = await fetch(`${config.magnetCustomer.apiUrl}/api${endpoint}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` },
    });
    return res.ok ? res.json() : null;
  };

  try {
    const pipelines = await mcFetch('/pipelines');
    const list = Array.isArray(pipelines) ? pipelines : pipelines?.docs || pipelines?.data || [];
    if (list.length > 0) {
      context.pipelineId = list[0]._id;
      console.log(`  Pipeline: ${list[0].title || list[0]._id}`);
    }
  } catch { console.warn('  Pipeline: not available'); }

  try {
    const roles = await mcFetch('/roles');
    const list = Array.isArray(roles) ? roles : roles?.data || [];
    if (list.length > 0) {
      context.roleId = list[0]._id;
      console.log(`  Role: ${list[0].name || list[0]._id}`);
    }
  } catch { console.warn('  Role: not available'); }

  try {
    const types = await mcFetch('/treatments/types');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.treatmentTypeId = list[0]._id;
      console.log(`  TreatmentType: ${list[0].name || list[0]._id}`);
    }
  } catch { console.warn('  TreatmentType: not available'); }

  try {
    const types = await mcFetch('/customfieldtypes');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.customFieldTypeId = list[0]._id;
      console.log(`  CustomFieldType: ${list[0].name || list[0]._id}`);
    }
  } catch { console.warn('  CustomFieldType: not available'); }

  // 8. Save context
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  console.log('[E2E Global Setup] Done.\n');
}
