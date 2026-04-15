import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import { getCredentialId, getRoleId } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
let roleId: string;
const workflowIds: string[] = [];

beforeAll(() => {
  credentialId = getCredentialId();
  roleId = getRoleId();
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

describe('Staff E2E', () => {
  let recordId: string;

  it('create', async () => {
    const result = await run(wb.staffCreate(roleId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    recordId = result.output[0]._id;
  });

  it('get', async () => {
    const result = await run(wb.getById('staff', 'staffId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(recordId);
  });

  it('getAll', async () => {
    const result = await run(wb.getAll('staff'));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('search', async () => {
    const result = await run(wb.search('staff', getConfig().options.cleanupPrefix));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update', async () => {
    const result = await run({
      resource: 'staff',
      operation: 'update',
      params: {
        staffId: recordId,
        fullname: `${getConfig().options.cleanupPrefix}Updated`,
        email: '',
        role: roleId,
        workspaces: [],
        phone: '',
        whatsAppPhone: '',
        customFieldCollection: {},
      },
    });
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete', async () => {
    const result = await run(wb.deleteById('staff', 'staffId', recordId));
    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
