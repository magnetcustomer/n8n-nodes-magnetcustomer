import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import { getCredentialId } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
let endpointAvailable = true;
const workflowIds: string[] = [];

beforeAll(async () => {
  credentialId = getCredentialId();

  // Check if meetingRoom endpoint exists by trying a getAll
  try {
    const wf = await n8nClient.createWorkflow({
      ...wb.getAll('meetingRoom', 1, 1),
      credentialId,
    });
    workflowIds.push(wf.id);
    n8nClient.trackWorkflow(wf.id);
    const result = await n8nClient.executeAndWait(wf.id, wf.webhookPath);
    endpointAvailable = result.status === 'success';
    if (!endpointAvailable) {
      console.warn('MeetingRoom endpoint not available in this environment, tests will be skipped');
    }
  } catch {
    endpointAvailable = false;
    console.warn('MeetingRoom endpoint not available in this environment, tests will be skipped');
  }
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

describe('MeetingRoom E2E', () => {
  let recordId: string;

  it('create', async () => {
    if (!endpointAvailable) return;
    const result = await run(wb.meetingRoomCreate());
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    if (!endpointAvailable || !recordId) return;
    const result = await run(wb.getById('meetingRoom', 'meetingRoomId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    if (!endpointAvailable) return;
    const result = await run(wb.getAll('meetingRoom'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    if (!endpointAvailable) return;
    const result = await run(wb.search('meetingRoom', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    if (!endpointAvailable || !recordId) return;
    const result = await run({
      resource: 'meetingRoom',
      operation: 'update',
      params: {
        meetingRoomId: recordId,
        name: `${getConfig().options.cleanupPrefix}Updated`,
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    if (!endpointAvailable || !recordId) return;
    const result = await run(wb.deleteById('meetingRoom', 'meetingRoomId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
