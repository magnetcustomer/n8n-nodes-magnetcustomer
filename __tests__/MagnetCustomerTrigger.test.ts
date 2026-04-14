/**
 * Tests for MagnetCustomerTrigger — webhook lifecycle (checkExists, create, delete)
 * and incoming webhook handler.
 */

jest.mock('../nodes/MagnetCustomer/GenericFunctions', () => {
	const actual = jest.requireActual('../nodes/MagnetCustomer/GenericFunctions');
	return { ...actual, magnetCustomerApiRequest: jest.fn() };
});

import { magnetCustomerApiRequest } from '../nodes/MagnetCustomer/GenericFunctions';
import { MagnetCustomerTrigger } from '../nodes/MagnetCustomer/MagnetCustomerTrigger.node';

const mockApi = magnetCustomerApiRequest as jest.MockedFunction<typeof magnetCustomerApiRequest>;

beforeEach(() => mockApi.mockReset());

function createHookContext(params: Record<string, any> = {}, staticData: Record<string, any> = {}) {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
		getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.example.com/webhook/abc'),
		getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
		getCredentials: jest.fn().mockResolvedValue({ subDomainAccount: 'test' }),
		getNode: jest.fn().mockReturnValue({ name: 'Trigger', type: 'magnetCustomerTrigger' }),
		helpers: {
			requestWithAuthentication: jest.fn(),
		},
	};
}

function createWebhookContext(params: Record<string, any> = {}, body: any = {}, credentials?: any) {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
		getRequestObject: jest.fn().mockReturnValue({ body, headers: {} }),
		getResponseObject: jest.fn().mockReturnValue({
			writeHead: jest.fn(),
			end: jest.fn(),
		}),
		getCredentials: jest.fn().mockResolvedValue(credentials),
		helpers: {
			returnJsonArray: jest.fn((data: any) => {
				if (Array.isArray(data)) return data.map((d: any) => ({ json: d }));
				return [{ json: data }];
			}),
		},
	};
}

const trigger = new MagnetCustomerTrigger();
const webhookMethods = trigger.webhookMethods.default;

// ============================================================
// checkExists
// ============================================================
describe('Trigger — checkExists', () => {
	it('returns true when matching webhook exists', async () => {
		const staticData: Record<string, any> = {};
		const ctx = createHookContext(
			{ action: 'added', resource: 'deal' },
			staticData,
		);
		mockApi.mockResolvedValue({
			data: [{
				subscriptionUrl: 'https://n8n.example.com/webhook/abc',
				eventAction: 'added',
				eventResource: 'deal',
				id: 'wh-123',
			}],
		});

		const result = await webhookMethods.checkExists.call(ctx as any);

		expect(result).toBe(true);
		expect(staticData.webhookId).toBe('wh-123');
	});

	it('returns false when no matching webhook exists', async () => {
		const ctx = createHookContext({ action: 'added', resource: 'deal' }, {});
		mockApi.mockResolvedValue({
			data: [{
				subscriptionUrl: 'https://other.com/webhook',
				eventAction: 'added',
				eventResource: 'deal',
				id: 'wh-other',
			}],
		});

		const result = await webhookMethods.checkExists.call(ctx as any);
		expect(result).toBe(false);
	});

	it('returns false when data is undefined', async () => {
		const ctx = createHookContext({ action: 'added', resource: 'deal' }, {});
		mockApi.mockResolvedValue({});

		const result = await webhookMethods.checkExists.call(ctx as any);
		expect(result).toBe(false);
	});
});

// ============================================================
// create
// ============================================================
describe('Trigger — create', () => {
	it('creates webhook and stores ID in static data', async () => {
		const staticData: Record<string, any> = {};
		const ctx = createHookContext(
			{ action: 'updated', resource: 'prospect', incomingAuthentication: 'none' },
			staticData,
		);
		mockApi.mockResolvedValue({ data: { id: 'wh-new-1' } });

		const result = await webhookMethods.create.call(ctx as any);

		expect(result).toBe(true);
		expect(staticData.webhookId).toBe('wh-new-1');

		const [method, endpoint, body] = mockApi.mock.calls[0];
		expect(method).toBe('POST');
		expect(endpoint).toBe('/webhooks');
		expect(body.eventAction).toBe('updated');
		expect(body.eventResource).toBe('prospect');
		expect(body.subscriptionUrl).toBe('https://n8n.example.com/webhook/abc');
	});

	it('returns false when API response has no data', async () => {
		const ctx = createHookContext(
			{ action: 'added', resource: 'deal', incomingAuthentication: 'none' },
			{},
		);
		mockApi.mockResolvedValue({});

		const result = await webhookMethods.create.call(ctx as any);
		expect(result).toBe(false);
	});

	it('includes basicAuth credentials when configured', async () => {
		const ctx = createHookContext(
			{ action: 'added', resource: 'deal', incomingAuthentication: 'basicAuth' },
			{},
		);
		ctx.getCredentials.mockImplementation(async (name: string) => {
			if (name === 'httpBasicAuth') return { user: 'admin', password: 'secret' };
			return { subDomainAccount: 'test' };
		});
		mockApi.mockResolvedValue({ data: { id: 'wh-auth' } });

		await webhookMethods.create.call(ctx as any);

		const body = mockApi.mock.calls[0][2];
		expect(body.httpAuthUser).toBe('admin');
		expect(body.httpAuthPassword).toBe('secret');
	});
});

// ============================================================
// delete
// ============================================================
describe('Trigger — delete', () => {
	it('deletes webhook and clears static data', async () => {
		const staticData: Record<string, any> = { webhookId: 'wh-123', webhookEvents: ['added'] };
		const ctx = createHookContext({}, staticData);
		mockApi.mockResolvedValue({});

		const result = await webhookMethods.delete.call(ctx as any);

		expect(result).toBe(true);
		expect(staticData.webhookId).toBeUndefined();
		expect(staticData.webhookEvents).toBeUndefined();

		const [method, endpoint] = mockApi.mock.calls[0];
		expect(method).toBe('DELETE');
		expect(endpoint).toBe('/webhooks/wh-123');
	});

	it('returns true when no webhook was registered', async () => {
		const ctx = createHookContext({}, {});

		const result = await webhookMethods.delete.call(ctx as any);

		expect(result).toBe(true);
		expect(mockApi).not.toHaveBeenCalled();
	});

	it('returns false when API delete fails', async () => {
		const staticData: Record<string, any> = { webhookId: 'wh-fail' };
		const ctx = createHookContext({}, staticData);
		mockApi.mockRejectedValue(new Error('API error'));

		const result = await webhookMethods.delete.call(ctx as any);

		expect(result).toBe(false);
	});
});

// ============================================================
// webhook handler
// ============================================================
describe('Trigger — webhook handler', () => {
	it('returns request body as workflow data (no auth)', async () => {
		const eventBody = { event: 'deal.added', data: { _id: 'd1', title: 'New Deal' } };
		const ctx = createWebhookContext(
			{ incomingAuthentication: 'none' },
			eventBody,
		);

		const result = await trigger.webhook.call(ctx as any);

		expect(result.workflowData).toBeDefined();
		expect(ctx.helpers.returnJsonArray).toHaveBeenCalledWith(eventBody);
	});

	it('rejects with 401 when basicAuth credentials are missing in request', async () => {
		const ctx = createWebhookContext(
			{ incomingAuthentication: 'basicAuth' },
			{},
			{ user: 'admin', password: 'secret' },
		);
		// basicAuth(req) returns undefined when no Authorization header
		const resp = ctx.getResponseObject();

		const result = await trigger.webhook.call(ctx as any);

		expect(result.noWebhookResponse).toBe(true);
	});
});
