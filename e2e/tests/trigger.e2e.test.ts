import * as n8nClient from '../helpers/n8nClient';
import { getCredentialId } from '../helpers/testContext';

let credentialId: string;
const workflowIds: string[] = [];

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
  it('receives and processes a simulated event payload', async () => {
    // Create a simple webhook workflow (no MagnetCustomer Trigger node)
    const ts = Date.now();
    const wf = await n8nClient.createSimpleWebhookWorkflow(`e2e-trigger-${ts}`);
    workflowIds.push(wf.id);
    n8nClient.trackWorkflow(wf.id);

    await n8nClient.activateWorkflow(wf.id);
    await new Promise(r => setTimeout(r, 500));

    // Simulate MC webhook payload
    const payload = {
      event: 'deal.added',
      data: { _id: 'test-deal-1', title: 'n8n-e2e-Trigger Deal' },
    };

    const webhookUrl = await n8nClient.getWebhookUrl(wf.webhookPath);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.ok).toBe(true);
    const body = await res.json();
    // The NoOp/webhook should pass through the body
    expect(body.body?.event).toBe('deal.added');
    expect(body.body?.data?._id).toBe('test-deal-1');
  });
});
