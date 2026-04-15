import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import * as mcClient from '../helpers/mcClient';
import { getCredentialId, getE2EContext, getRequiredFieldsForFeature } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
let treatmentTypeId: string;
let contactId: string;
const workflowIds: string[] = [];

beforeAll(async () => {
  credentialId = getCredentialId();
  const ctx = getE2EContext();
  treatmentTypeId = ctx.treatmentTypeId || '';

  // Create a contact with required custom fields for prospect lifecycle
  const prefix = getConfig().options.cleanupPrefix;
  const reqFields = getRequiredFieldsForFeature('contact', 'prospect');
  const customFields = reqFields.map(f => ({ customField: f._id, v: f.v }));

  const contact = await mcClient.post('/prospects', {
    fullname: `${prefix}TreatmentContact ${Date.now()}`,
    email: `${prefix}treatment-contact-${Date.now()}@test.com`,
    phones: [{ typePhone: 'business', number: '+5511999990000' }],
    type: 'pf',
    customFields,
    source: 'n8n',
  });
  contactId = contact._id || contact.data?._id;
});

afterAll(async () => {
  // Cleanup contact
  if (contactId) {
    try { await mcClient.del(`/prospects/${contactId}`); } catch {}
  }
  for (const id of workflowIds) {
    try { await n8nClient.deleteWorkflow(id); } catch {}
  }
});

async function run(config: { resource: string; operation: string; params: Record<string, any> }) {
  const wf = await n8nClient.createWorkflow({ ...config, credentialId });
  workflowIds.push(wf.id);
  n8nClient.trackWorkflow(wf.id);
  return n8nClient.executeAndWait(wf.id, wf.webhookPath);
}

describe('Treatment E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.treatmentCreate(treatmentTypeId, contactId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    if (!recordId) return;
    const result = await run(wb.getById('treatment', 'treatmentId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('treatment'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    const result = await run(wb.search('treatment', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    if (!recordId) return;
    const result = await run({
      resource: 'treatment',
      operation: 'update',
      params: {
        treatmentId: recordId,
        type: treatmentTypeId,
        contact: contactId,
        subject: `${getConfig().options.cleanupPrefix}Updated`,
        nameType: '',
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    if (!recordId) return;
    const result = await run(wb.deleteById('treatment', 'treatmentId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
