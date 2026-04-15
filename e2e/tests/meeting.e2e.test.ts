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

describe('Meeting E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.meetingCreate());
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    const result = await run(wb.getById('meeting', 'meetingId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('meeting'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    const result = await run(wb.search('meeting', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    const result = await run({
      resource: 'meeting',
      operation: 'update',
      params: {
        meetingId: recordId,
        title: `${getConfig().options.cleanupPrefix}Updated`,
        start: '',
        end: '',
        calendar: '',
        workspace: '',
        participants: [],
        staff: '',
        type: '',
        room: '',
        contact: '',
        branch: '',
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    const result = await run(wb.deleteById('meeting', 'meetingId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
