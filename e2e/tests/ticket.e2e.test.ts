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

describe('Ticket E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.ticketCreate());
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    if (!recordId) return;
    const result = await run(wb.getById('ticket', 'ticketId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('ticket'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    const result = await run(wb.search('ticket', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    if (!recordId) return;
    const result = await run({
      resource: 'ticket',
      operation: 'update',
      params: {
        ticketId: recordId,
        subject: `${getConfig().options.cleanupPrefix}Updated`,
        description: '',
        priority: 'high',
        workspaceReceiver: '',
        contact: '',
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    if (!recordId) return;
    const result = await run(wb.deleteById('ticket', 'ticketId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
