// e2e/helpers/globalSetup.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';
import * as mcClient from './mcClient';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

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

  // 3. Test MC API connectivity
  const mcHealthy = await mcClient.healthCheck();
  if (!mcHealthy) {
    throw new Error(`MagnetCustomer API not reachable at ${config.magnetCustomer.apiUrl}`);
  }
  console.log('  MC API: healthy');

  // 4. Fetch base data
  const context: Record<string, string> = {};

  // Pipeline (use first available)
  try {
    const pipelines = await mcClient.get('/pipelines');
    const list = Array.isArray(pipelines) ? pipelines : pipelines?.data || [];
    if (list.length > 0) {
      context.pipelineId = list[0]._id;
      console.log(`  Pipeline: ${list[0].title || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  Pipeline: not available');
  }

  // Role (use first available)
  try {
    const roles = await mcClient.get('/roles');
    const list = Array.isArray(roles) ? roles : roles?.data || [];
    if (list.length > 0) {
      context.roleId = list[0]._id;
      console.log(`  Role: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  Role: not available');
  }

  // TreatmentType (use first available)
  try {
    const types = await mcClient.get('/treatments/types');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.treatmentTypeId = list[0]._id;
      console.log(`  TreatmentType: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  TreatmentType: not available');
  }

  // CustomFieldType (use first available)
  try {
    const types = await mcClient.get('/customfieldtypes');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.customFieldTypeId = list[0]._id;
      console.log(`  CustomFieldType: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  CustomFieldType: not available');
  }

  // n8n credential ID — try public API first, fallback to internal REST
  try {
    let list: any[] = [];

    // Try public API
    const pubRes = await fetch(`${config.n8n.url}/api/v1/credentials`, {
      headers: { 'X-N8N-API-KEY': config.n8n.apiKey },
    });
    if (pubRes.ok) {
      const pubData = await pubRes.json();
      list = pubData.data || pubData || [];
    }

    // Fallback: login + internal REST (public API may lack credential:read scope)
    if (list.length === 0) {
      const loginRes = await fetch(`${config.n8n.url}/rest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrLdapLoginId: 'e2e@magnetcustomer.com', password: '<E2E_PASSWORD>' }),
      });
      // Node.js fetch: use getSetCookie() or raw header
      const cookies = (loginRes.headers as any).getSetCookie?.() || [];
      const cookie = (cookies[0] || loginRes.headers.get('set-cookie') || '').split(';')[0];
      if (cookie) {
        const intRes = await fetch(`${config.n8n.url}/rest/credentials`, {
          headers: { 'Cookie': cookie },
        });
        if (intRes.ok) {
          const intData = await intRes.json();
          list = intData.data || intData || [];
        }
      }
    }

    const mcCred = list.find((c: any) => c.type === 'magnetCustomerApi');
    if (mcCred) {
      context.credentialId = mcCred.id;
      console.log(`  n8n Credential: ${mcCred.name} (${mcCred.id})`);
    } else {
      console.warn('  n8n Credential: not found (create via setup.sh or n8n UI)');
    }
  } catch (e) {
    console.warn('  n8n Credential: error fetching');
  }

  // 5. Save context
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  console.log('[E2E Global Setup] Done.\n');
}
