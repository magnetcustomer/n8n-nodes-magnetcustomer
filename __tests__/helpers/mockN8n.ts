/**
 * Mock helpers that simulate the REAL n8n execution context.
 *
 * Key principle: we mock ONLY the HTTP layer (requestWithAuthentication).
 * Everything else — returnJsonArray, constructExecutionMetaData, the full
 * execute() chain — runs with real n8n behavior so tests catch the same
 * bugs users would hit.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

export interface MockContextParams {
	[key: string]: any;
}

/**
 * Real implementation of returnJsonArray — same logic n8n uses internally.
 * When responseData is undefined/null, returns []. This is exactly what
 * causes the bug: if a Request function returns undefined (e.g. from
 * destructuring a missing property), the user sees empty output.
 */
function returnJsonArray(jsonData: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (jsonData === undefined || jsonData === null) {
		return [];
	}

	if (!Array.isArray(jsonData)) {
		return [{ json: jsonData }];
	}

	return jsonData.map((item) => ({ json: item }));
}

/**
 * Real implementation of constructExecutionMetaData — adds pairedItem
 * tracking so n8n can trace which input item produced which output.
 */
function constructExecutionMetaData(
	inputData: INodeExecutionData[],
	metaData: { itemData: { item: number } },
): INodeExecutionData[] {
	return inputData.map((item) => ({
		...item,
		pairedItem: metaData.itemData,
	}));
}

// ------------------------------------------------------------------ factory

/**
 * Build a mock n8n execution context for calling execute() on a node.
 *
 * Only the HTTP call is mocked. All n8n internal processing (returnJsonArray,
 * constructExecutionMetaData) uses REAL implementations so that tests
 * reflect what users actually see.
 *
 * @param params     Map of node parameter names → values
 * @param httpResponse  What the MagnetCustomer API returns (raw HTTP)
 * @param options    Additional options (inputItems count, continueOnFail)
 */
export function createExecuteContext(
	params: MockContextParams = {},
	httpResponse: any = {},
	options: { inputItems?: number; continueOnFail?: boolean } = {},
) {
	const inputItems = Array.from(
		{ length: options.inputItems ?? 1 },
		(_, i) => ({ json: {}, pairedItem: { item: i } }),
	);

	const mockRequestWithAuth = jest.fn().mockResolvedValue(httpResponse);

	const ctx = {
		getInputData: jest.fn().mockReturnValue(inputItems),

		getNodeParameter: jest.fn(
			(name: string, _index?: number, fallback?: any) => {
				if (name in params) return params[name];
				return fallback;
			},
		),

		getCredentials: jest.fn().mockResolvedValue({
			subDomainAccount: 'test-account',
		}),

		getNode: jest.fn().mockReturnValue({
			name: 'MagnetCustomer',
			type: 'magnetCustomer',
		}),

		continueOnFail: jest.fn().mockReturnValue(options.continueOnFail ?? false),

		helpers: {
			// REAL implementations — not mocked
			returnJsonArray,
			constructExecutionMetaData,
			// Only the HTTP layer is mocked
			requestWithAuthentication: mockRequestWithAuth,
		},

		/** Shortcut to access the mocked HTTP call for assertions */
		_mockHttp: mockRequestWithAuth,
	};

	return ctx;
}

/**
 * Helper to extract the n8n output from execute() result.
 * execute() returns INodeExecutionData[][] — we typically want the
 * first (and only) output's json data.
 */
export function getOutputItems(result: INodeExecutionData[][]): IDataObject[] {
	return (result[0] ?? []).map((item) => item.json);
}

/**
 * Helper to extract the HTTP request body that was sent to the API.
 */
export function getHttpRequestBody(ctx: { _mockHttp: jest.Mock }): IDataObject | undefined {
	if (ctx._mockHttp.mock.calls.length === 0) return undefined;
	const lastCall = ctx._mockHttp.mock.calls[ctx._mockHttp.mock.calls.length - 1];
	// requestWithAuthentication(credentialType, options)
	return lastCall[1]?.body;
}

/**
 * Helper to extract the full HTTP request options sent to the API.
 */
export function getHttpRequestOptions(ctx: { _mockHttp: jest.Mock }) {
	if (ctx._mockHttp.mock.calls.length === 0) return undefined;
	return ctx._mockHttp.mock.calls[ctx._mockHttp.mock.calls.length - 1][1] as {
		method: string;
		uri: string;
		body?: IDataObject;
		qs?: IDataObject;
	};
}

// ------------------------------------------------------------------ presets

/** Standard params for creating a contact-like resource */
export function contactCreateParams(overrides: MockContextParams = {}): MockContextParams {
	return {
		authentication: 'apiToken',
		resource: 'prospect',
		operation: 'create',
		fullname: 'John Doe',
		email: 'john@example.com',
		phoneCollection: { phones: [{ number: '+5511999990000' }] },
		gender: 'male',
		birthDate: '1990-01-15',
		work: 'Engineer',
		maritalStatus: 'single',
		doc: '12345678900',
		type: 'pf',
		state: 'SP',
		city: 'Sao Paulo',
		address: 'Rua Teste',
		addressNumber: '123',
		complement: 'Apto 1',
		neighborhood: 'Centro',
		cep: '01000-000',
		owners: 'staff-id-123',
		customFieldCollection: {
			customFields: [{ _id: 'cf-abc', v: 'valor1' }],
		},
		resolveCustomFields: false,
		...overrides,
	};
}

/** Standard params for creating a deal */
export function dealCreateParams(overrides: MockContextParams = {}): MockContextParams {
	return {
		authentication: 'apiToken',
		resource: 'deal',
		operation: 'create',
		title: 'Test Deal',
		description: 'A deal description',
		amount: 10000,
		expectedCloseDate: '2026-12-31',
		pipeline: 'pipeline-id',
		stage: 'stage-id',
		staff: 'staff-id',
		associateWith: 'contact',
		contact: 'contact-id',
		organization: '',
		customFieldCollection: {
			customFields: [{ _id: 'cf-deal-1', v: '500' }],
		},
		resolveCustomFields: false,
		...overrides,
	};
}
