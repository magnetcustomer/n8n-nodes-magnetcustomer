import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import { getCredentialId, getE2EContext } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
let customFieldTypeId: string;
const workflowIds: string[] = [];

beforeAll(() => {
  credentialId = getCredentialId();
  const ctx = getE2EContext();
  customFieldTypeId = ctx.customFieldTypeId || '';
});

afterAll(async () => {
  for (const id of workflowIds) {
    try { await n8nClient.deleteWorkflow(id); } catch {}
  }
});

async function run(config: { resource: string; operation: string; params: Record<string, any> }) {
  const wf = await n8nClient.createWorkflow({ ...config, credentialId });
  workflowIds.push(wf.id);
  n8nClient.trackWorkflow(wf.id);
  return n8nClient.executeAndWait(wf.id);
}

describe('CustomField E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.customFieldCreate(customFieldTypeId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    const result = await run(wb.getById('customField', 'customFieldId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('customField'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    const result = await run(wb.search('customField', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    const result = await run({
      resource: 'customField',
      operation: 'update',
      params: {
        customFieldId: recordId,
        name: `${getConfig().options.cleanupPrefix}Updated`,
        feature: 'deal',
        fieldType: customFieldTypeId,
        order: 99,
        values: [],
        subFieldSettings: '{}',
        settings: {},
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    const result = await run(wb.deleteById('customField', 'customFieldId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
