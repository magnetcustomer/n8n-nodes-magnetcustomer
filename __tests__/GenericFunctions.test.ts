import { addPhones, addCustomFields, magnetCustomerApiRequest } from '../nodes/MagnetCustomer/GenericFunctions';
import { createExecuteContext } from './helpers/mockN8n';

// ============================================================
// addPhones
// ============================================================
describe('addPhones', () => {
	it('returns empty array when collection is undefined', () => {
		expect(addPhones(undefined as any)).toEqual([]);
	});

	it('returns empty array when phones is undefined', () => {
		expect(addPhones({} as any)).toEqual([]);
	});

	it('returns empty array when phones is empty', () => {
		expect(addPhones({ phones: [] as any })).toEqual([]);
	});

	it('maps phones with typePhone = business', () => {
		const result = addPhones({
			phones: [
				{ number: '+5511999990000' },
				{ number: '+5521888880000' },
			],
		});
		expect(result).toEqual([
			{ typePhone: 'business', number: '+5511999990000' },
			{ typePhone: 'business', number: '+5521888880000' },
		]);
	});

	it('handles single phone', () => {
		const result = addPhones({ phones: [{ number: '1234' }] });
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({ typePhone: 'business', number: '1234' });
	});
});

// ============================================================
// addCustomFields
// ============================================================
describe('addCustomFields', () => {
	it('returns empty array when collection is undefined', () => {
		expect(addCustomFields(undefined as any)).toEqual([]);
	});

	it('returns empty array when customFields is undefined', () => {
		expect(addCustomFields({} as any)).toEqual([]);
	});

	it('returns empty array when customFields is empty', () => {
		expect(addCustomFields({ customFields: [] as any })).toEqual([]);
	});

	it('maps customFields with customField key and v value', () => {
		const result = addCustomFields({
			customFields: [
				{ _id: 'abc123', v: 'Hello' },
				{ _id: 'def456', v: '42' },
			],
		});
		expect(result).toEqual([
			{ customField: 'abc123', v: 'Hello' },
			{ customField: 'def456', v: '42' },
		]);
	});

	it('strips customField_ prefix from legacy IDs', () => {
		const result = addCustomFields({
			customFields: [{ _id: 'customField_abc123', v: 'test' }],
		});
		expect(result).toEqual([{ customField: 'abc123', v: 'test' }]);
	});

	it('skips entries with missing ID', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		const result = addCustomFields({
			customFields: [
				{ _id: '', v: 'test' },
				{ _id: 'valid-id', v: 'ok' },
			],
		});
		expect(result).toEqual([{ customField: 'valid-id', v: 'ok' }]);
		consoleSpy.mockRestore();
	});

	it('skips entries with undefined value', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		const result = addCustomFields({
			customFields: [{ _id: 'id1', v: undefined as any }],
		});
		expect(result).toEqual([]);
		consoleSpy.mockRestore();
	});
});

// ============================================================
// magnetCustomerApiRequest
// ============================================================
describe('magnetCustomerApiRequest', () => {
	it('builds correct URL with subDomainAccount from apiToken credentials', async () => {
		const ctx = createExecuteContext({ authentication: 'apiToken' });
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'acme' });

		await magnetCustomerApiRequest.call(
			ctx as any,
			'GET',
			'/contacts',
			{},
			{},
		);

		const call = ctx._mockHttp.mock.calls[0];
		expect(call[0]).toBe('magnetCustomerApi');
		expect(call[1].uri).toBe(
			'https://acme.platform-api.magnetcustomer.com/api/contacts',
		);
		expect(call[1].method).toBe('GET');
		expect(call[1].json).toBe(true);
	});

	it('uses oAuth2 credential type when authentication is oAuth2', async () => {
		const ctx = createExecuteContext({ authentication: 'oAuth2' });
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'demo' });

		await magnetCustomerApiRequest.call(
			ctx as any,
			'POST',
			'/deals',
			{ title: 'Test' },
		);

		const call = ctx._mockHttp.mock.calls[0];
		expect(call[0]).toBe('magnetCustomerOAuth2Api');
		expect(call[1].uri).toContain('demo.platform-api.magnetcustomer.com');
	});

	it('sends body for POST requests', async () => {
		const ctx = createExecuteContext({ authentication: 'apiToken' });
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'test' });

		const body = { fullname: 'John', email: 'john@test.com' };
		await magnetCustomerApiRequest.call(
			ctx as any,
			'POST',
			'/prospects',
			body,
		);

		const call = ctx._mockHttp.mock.calls[0];
		expect(call[1].body).toEqual(body);
	});

	it('removes body when empty', async () => {
		const ctx = createExecuteContext({ authentication: 'apiToken' });
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'test' });

		await magnetCustomerApiRequest.call(
			ctx as any,
			'GET',
			'/contacts/123',
			{},
		);

		const call = ctx._mockHttp.mock.calls[0];
		expect(call[1].body).toBeUndefined();
	});

	it('passes query string parameters', async () => {
		const ctx = createExecuteContext({ authentication: 'apiToken' });
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'test' });

		await magnetCustomerApiRequest.call(
			ctx as any,
			'GET',
			'/contacts',
			{},
			{ page: 2, limit: 10 },
		);

		const call = ctx._mockHttp.mock.calls[0];
		expect(call[1].qs).toEqual({ page: 2, limit: 10 });
	});

	it('returns the API response', async () => {
		const mockResponse = { _id: '123', fullname: 'Jane' };
		const ctx = createExecuteContext({ authentication: 'apiToken' }, mockResponse);
		ctx.getCredentials.mockResolvedValue({ subDomainAccount: 'test' });

		const result = await magnetCustomerApiRequest.call(
			ctx as any,
			'GET',
			'/contacts/123',
			{},
		);

		expect(result).toEqual(mockResponse);
	});
});
