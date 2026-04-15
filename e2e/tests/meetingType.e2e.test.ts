import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import { getCredentialId } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
const workflowIds: string[] = [];

beforeAll(() => {
  credentialId = getCredentialId();
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
  return n8nClient.executeAndWait(wf.id, wf.webhookPath);
}

describe('MeetingType E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.meetingTypeCreate());
    expect(result.status).toBe('success');

    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    if (!recordId) return;
    const result = await run(wb.getById('meetingType', 'meetingTypeId', recordId));
    expect(result.status).toBe('success');

    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('meetingType'));
    expect(result.status).toBe('success');

  });

  it('search', async () => {
    const result = await run(wb.search('meetingType', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');

  });

  it('update', async () => {
    if (!recordId) return;
    const result = await run({
      resource: 'meetingType',
      operation: 'update',
      params: {
        meetingTypeId: recordId,
        name: `${getConfig().options.cleanupPrefix}Updated`,
      },
    });
    expect(result.status).toBe('success');

  });

  it('delete', async () => {
    if (!recordId) return;
    const result = await run(wb.deleteById('meetingType', 'meetingTypeId', recordId));
    expect(result.status).toBe('success');

  });
});
