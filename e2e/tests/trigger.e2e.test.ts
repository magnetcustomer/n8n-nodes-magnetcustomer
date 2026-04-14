import * as n8nClient from '../helpers/n8nClient';
import * as mcClient from '../helpers/mcClient';
import { getCredentialId } from '../helpers/testContext';
import { loadConfig, getConfig } from '../helpers/config';

let credentialId: string;
const workflowIds: string[] = [];

// Load config at module scope so triggerMode can be evaluated before tests run
const config = loadConfig();
const isRealTrigger = config.options.triggerMode === 'real';

beforeAll(() => {
  credentialId = getCredentialId();
});

afterAll(async () => {
  for (const id of workflowIds) {
    try {
      await n8nClient.deactivateWorkflow(id).catch(() => {});
      await n8nClient.deleteWorkflow(id);
    } catch {}
  }
});

describe('Trigger — simulated webhook', () => {
  it('receives webhook POST and responds ok', async () => {
    const trigger = await n8nClient.createTriggerWorkflow('prospect', 'created', credentialId);
    workflowIds.push(trigger.id);
    n8nClient.trackWorkflow(trigger.id);

    await n8nClient.activateWorkflow(trigger.id);

    const webhookUrl = await n8nClient.getWebhookUrl(trigger.webhookPath);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'prospect.created',
        data: { _id: 'simulated-123', fullname: 'Test Prospect' },
      }),
    });

    expect(res.ok).toBe(true);

    await n8nClient.deactivateWorkflow(trigger.id);
  });
});

(isRealTrigger ? describe : describe.skip)('Trigger — real webhook', () => {
  it('fires on real prospect creation', async () => {
    const trigger = await n8nClient.createTriggerWorkflow('prospect', 'created', credentialId);
    workflowIds.push(trigger.id);
    n8nClient.trackWorkflow(trigger.id);

    await n8nClient.activateWorkflow(trigger.id);

    // Create a real prospect to trigger the webhook
    const prefix = getConfig().options.cleanupPrefix;
    const prospect = await mcClient.post('/prospects', {
      fullname: `${prefix}TriggerTest ${Date.now()}`,
      email: `${prefix}trigger-${Date.now()}@test.com`,
      type: 'pf',
    });
    const prospectId = prospect._id || prospect.data?._id;

    // Poll for execution (webhook should have fired)
    const timeout = getConfig().options.timeoutMs;
    const start = Date.now();
    let found = false;

    while (Date.now() - start < timeout) {
      try {
        const executions = await fetch(
          `${getConfig().n8n.url}/api/v1/executions?workflowId=${trigger.id}&limit=5`,
          { headers: { 'X-N8N-API-KEY': getConfig().n8n.apiKey } },
        );
        const data = await executions.json();
        const list = data.data || [];
        if (list.some((e: any) => e.finished || e.status === 'success')) {
          found = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Cleanup prospect
    if (prospectId) {
      try { await mcClient.del(`/prospects/${prospectId}`); } catch {}
    }

    await n8nClient.deactivateWorkflow(trigger.id);

    expect(found).toBe(true);
  });
});
