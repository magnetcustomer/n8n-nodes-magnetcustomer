/**
 * Integration tests for MagnetCustomer node.
 *
 * These tests call the REAL execute() method with only the HTTP layer mocked.
 * returnJsonArray and constructExecutionMetaData run with real n8n logic,
 * so the tests catch exactly the same bugs users would hit.
 *
 * The flow being tested:
 *   execute() → *Request() → magnetCustomerApiRequest() → mock HTTP
 *        ↓
 *   returnJsonArray(responseData)   ← undefined becomes [] here
 *        ↓
 *   constructExecutionMetaData()
 *        ↓
 *   output items (what the user sees in n8n)
 */

import { MagnetCustomer } from '../nodes/MagnetCustomer/MagnetCustomer.node';
import {
	createExecuteContext,
	getOutputItems,
	getHttpRequestOptions,
	contactCreateParams,
	dealCreateParams,
} from './helpers/mockN8n';

const node = new MagnetCustomer();

// ============================================================
// BUG REGRESSION: response must not be destructured
// ============================================================
describe('BUG REGRESSION — response comes through as actual data, not []', () => {
	it('Prospect create returns the created prospect (not [])', async () => {
		const apiResponse = { _id: 'p1', fullname: 'John Doe', email: 'john@test.com', lifeCycle: 'prospect' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create' }),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0]._id).toBe('p1');
		expect(output[0].fullname).toBe('John Doe');
		expect(output[0].email).toBe('john@test.com');
	});

	it('Customer create returns the created customer (not [])', async () => {
		const apiResponse = { _id: 'c1', fullname: 'Jane Smith', lifeCycle: 'customer' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'customer', operation: 'create' }),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0]._id).toBe('c1');
		expect(output[0].fullname).toBe('Jane Smith');
	});

	it('Lead create returns the created lead (not [])', async () => {
		const apiResponse = { _id: 'l1', fullname: 'Bob Lead', lifeCycle: 'lead' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'lead', operation: 'create' }),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0]._id).toBe('l1');
		expect(output[0].fullname).toBe('Bob Lead');
	});

	it('Prospect update returns the updated prospect (not [])', async () => {
		const apiResponse = { _id: 'p1', fullname: 'Updated Name' };
		const ctx = createExecuteContext(
			contactCreateParams({
				resource: 'prospect', operation: 'update',
				prospectId: 'p1', fullname: 'Updated Name',
			}),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0].fullname).toBe('Updated Name');
	});

	it('Customer update returns the updated customer (not [])', async () => {
		const apiResponse = { _id: 'c1', fullname: 'Updated Customer' };
		const ctx = createExecuteContext(
			contactCreateParams({
				resource: 'customer', operation: 'update',
				customerId: 'c1', fullname: 'Updated Customer',
			}),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0].fullname).toBe('Updated Customer');
	});

	it('Lead update returns the updated lead (not [])', async () => {
		const apiResponse = { _id: 'l1', fullname: 'Updated Lead' };
		const ctx = createExecuteContext(
			contactCreateParams({
				resource: 'lead', operation: 'update',
				leadId: 'l1', fullname: 'Updated Lead',
			}),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0].fullname).toBe('Updated Lead');
	});
});

// ============================================================
// PROSPECT — full CRUD through execute()
// ============================================================
describe('Prospect — full CRUD via execute()', () => {
	it('create sends POST /prospects with correct body', async () => {
		const apiResponse = { _id: 'p1', fullname: 'John Doe' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create' }),
			apiResponse,
		);

		await node.execute.call(ctx as any);

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('POST');
		expect(req!.uri).toContain('/api/prospects');
		expect(req!.body!.fullname).toBe('John Doe');
		expect(req!.body!.source).toBe('n8n');
	});

	it('get sends GET /prospects/:id', async () => {
		const apiResponse = { _id: 'p1', fullname: 'John' };
		const ctx = createExecuteContext(
			{ authentication: 'apiToken', resource: 'prospect', operation: 'get', prospectId: 'p1', resolveCustomFields: false },
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('GET');
		expect(req!.uri).toContain('/prospects/p1');
		expect(output[0]._id).toBe('p1');
	});

	it('getAll sends GET /prospects with pagination', async () => {
		const apiResponse = { docs: [{ _id: 'p1' }, { _id: 'p2' }], totalDocs: 2 };
		const ctx = createExecuteContext(
			{ authentication: 'apiToken', resource: 'prospect', operation: 'getAll', page: 1, limit: 25, resolveCustomFields: false },
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('GET');
		expect(req!.qs).toEqual({ page: 1, limit: 25 });
		// getAll returns the paginated response object with docs array
		expect(output[0]).toHaveProperty('docs');
	});

	it('delete sends DELETE /prospects/:id', async () => {
		const ctx = createExecuteContext(
			{ authentication: 'apiToken', resource: 'prospect', operation: 'delete', prospectId: 'p1' },
			{},
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('DELETE');
		expect(req!.uri).toContain('/prospects/p1');
		expect(output[0].success).toBe(true);
	});

	it('search sends GET /prospects with search query', async () => {
		const apiResponse = { docs: [{ _id: 'p1', fullname: 'John' }] };
		const ctx = createExecuteContext(
			{ authentication: 'apiToken', resource: 'prospect', operation: 'search', search: 'John', page: 1, limit: 25, resolveCustomFields: false },
			apiResponse,
		);

		await node.execute.call(ctx as any);

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('GET');
		expect(req!.qs!.search).toBe('John');
	});
});

// ============================================================
// DEAL — full CRUD through execute()
// ============================================================
describe('Deal — full CRUD via execute()', () => {
	it('create sends POST /deals and returns the created deal', async () => {
		const apiResponse = { _id: 'd1', title: 'New Deal', amount: 10000 };
		const ctx = createExecuteContext(dealCreateParams(), apiResponse);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0]._id).toBe('d1');
		expect(output[0].title).toBe('New Deal');

		const req = getHttpRequestOptions(ctx);
		expect(req!.method).toBe('POST');
		expect(req!.uri).toContain('/api/deals');
		expect(req!.body!.title).toBe('Test Deal');
		expect(req!.body!.contact).toBe('contact-id');
	});

	it('get returns deal data', async () => {
		const apiResponse = { _id: 'd1', title: 'My Deal', amount: 5000 };
		const ctx = createExecuteContext(
			{ authentication: 'apiToken', resource: 'deal', operation: 'get', dealId: 'd1', resolveCustomFields: false },
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output[0]._id).toBe('d1');
		expect(output[0].title).toBe('My Deal');
	});
});

// ============================================================
// ORGANIZATION — through execute()
// ============================================================
describe('Organization — via execute()', () => {
	it('create returns the created organization', async () => {
		const apiResponse = { _id: 'o1', fullname: 'Acme Corp' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'organization', operation: 'create', fullname: 'Acme Corp' }),
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0].fullname).toBe('Acme Corp');
	});
});

// ============================================================
// TASK — through execute()
// ============================================================
describe('Task — via execute()', () => {
	it('create returns the created task', async () => {
		const apiResponse = { _id: 't1', title: 'Follow up call', source: 'n8n' };
		const ctx = createExecuteContext(
			{
				authentication: 'apiToken', resource: 'task', operation: 'create',
				title: 'Follow up call', observation: '', type: 'type-1',
				dateOfExpires: '2026-12-31', associateWith: 'deal', deal: 'deal-1',
				contact: '', organization: '', owner: 'staff-1', dateFinished: '', status: 'open',
			},
			apiResponse,
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output).toHaveLength(1);
		expect(output[0].title).toBe('Follow up call');
	});
});

// ============================================================
// ERROR HANDLING — continueOnFail
// ============================================================
describe('Error handling', () => {
	it('propagates error when continueOnFail is false', async () => {
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create', fullname: '' }),
			{},
			{ continueOnFail: false },
		);

		await expect(node.execute.call(ctx as any)).rejects.toThrow('fullname');
	});

	it('returns error object when continueOnFail is true', async () => {
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create', fullname: '' }),
			{},
			{ continueOnFail: true },
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		expect(output[0]).toHaveProperty('error');
		expect(output[0].error).toContain('fullname');
	});
});

// ============================================================
// MULTIPLE INPUT ITEMS
// ============================================================
describe('Batch execution — multiple input items', () => {
	it('processes multiple items and returns results for each', async () => {
		const apiResponse = { _id: 'p1', fullname: 'John' };
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create' }),
			apiResponse,
			{ inputItems: 3 },
		);

		const result = await node.execute.call(ctx as any);
		const output = getOutputItems(result);

		// Each input item produces one output item
		expect(output).toHaveLength(3);
		expect(output[0]._id).toBe('p1');
		expect(output[1]._id).toBe('p1');
		expect(output[2]._id).toBe('p1');
	});
});

// ============================================================
// HTTP REQUEST VALIDATION
// ============================================================
describe('HTTP request construction', () => {
	it('uses correct URL with subDomainAccount', async () => {
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create' }),
			{ _id: 'p1' },
		);

		await node.execute.call(ctx as any);

		const req = getHttpRequestOptions(ctx);
		expect(req!.uri).toBe('https://test-account.platform-api.magnetcustomer.com/api/prospects');
	});

	it('uses OAuth2 credential type when configured', async () => {
		const ctx = createExecuteContext(
			contactCreateParams({ authentication: 'oAuth2', resource: 'prospect', operation: 'create' }),
			{ _id: 'p1' },
		);
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'demo' });

		await node.execute.call(ctx as any);

		const credType = ctx._mockHttp.mock.calls[0][0];
		expect(credType).toBe('magnetCustomerOAuth2Api');
	});

	it('sends JSON body for POST requests', async () => {
		const ctx = createExecuteContext(
			contactCreateParams({ resource: 'prospect', operation: 'create' }),
			{ _id: 'p1' },
		);

		await node.execute.call(ctx as any);

		const req = getHttpRequestOptions(ctx);
		expect(req!.body!.fullname).toBe('John Doe');
		expect(req!.body!.email).toBe('john@example.com');
		expect(req!.body!.source).toBe('n8n');
		expect(req!.body!.phones).toEqual([{ typePhone: 'business', number: '+5511999990000' }]);
	});
});
