import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function customFieldRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};
	let customFieldId: string | undefined;

	if (['get', 'update', 'delete'].includes(operation)) {
		customFieldId = this.getNodeParameter('customFieldId', index) as string;
		endpoint = `/customfields/${customFieldId}`;
	}

	switch (operation) {
		case 'create':
				if (!this.getNodeParameter('name', index)) {
					throw new Error('Parameter "name" is required for create operation');
				}
				if (!this.getNodeParameter('feature', index)) {
					throw new Error('Parameter "feature" is required for create operation');
				}
				if (!this.getNodeParameter('fieldType', index)) {
					throw new Error('Parameter "fieldType" is required for create operation');
				}
			requestMethod = 'POST';
			endpoint = '/customfields';
			body = {
				name: this.getNodeParameter('name', index) as string,
				feature: this.getNodeParameter('feature', index) as string,
				fieldType: this.getNodeParameter('fieldType', index) as string,
				order: this.getNodeParameter('order', index) as number,
				// TODO: Add other optional fields (active, required, values, fieldRef)
				values: (this.getNodeParameter('values', index, []) as string[]).map(val => ({ value: val })),
				subFieldSettings: JSON.parse(this.getNodeParameter('subFieldSettings', index, '{}') as string),
				settings: this.getNodeParameter('settings', index, {}) as object,
			};
			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Debug optional
			if (process.env.N8N_DEBUG_MCJ === '1') {
				console.log('Raw API Response (Create CustomField):', JSON.stringify(response, null, 2));
			}
			return response; // Return the full response for create

		case 'delete':
			requestMethod = 'DELETE';
			// endpoint already set
			break;

		case 'get':
			requestMethod = 'GET';
			// endpoint already set
			break;

		case 'getAll':
		case 'search':
			requestMethod = 'GET';
			endpoint = '/customfields';
			qs = {};
			const page = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof page === 'number' && page > 0) qs.page = page;
			if (typeof limit === 'number' && limit > 0) qs.limit = limit;
			const search = this.getNodeParameter('search', index, '') as string;
			if (search) qs.search = search;
			const filters = this.getNodeParameter('filters', index, {}) as {
				feature?: string;
				creatableWhen?: string;
				emailsEmpty?: boolean;
				phonesEmpty?: boolean;
				interactionsEmpty?: boolean;
			};
			if (filters.feature) qs.feature = filters.feature;
			if (filters.creatableWhen) qs.creatableWhen = filters.creatableWhen;
			if (filters.emailsEmpty !== undefined) qs.emailsEmpty = filters.emailsEmpty;
			if (filters.phonesEmpty !== undefined) qs.phonesEmpty = filters.phonesEmpty;
			if (filters.interactionsEmpty !== undefined) qs.interactionsEmpty = filters.interactionsEmpty;

			// Add optional sorting
			const sort = this.getNodeParameter('sort', index, {}) as {
				sortBy?: string;
				sortType?: string;
			};
			if (sort.sortBy) qs.sortBy = sort.sortBy;
			if (sort.sortType) qs.sortType = sort.sortType;

			// TODO: Add other filters
			break;

		case 'update':
			requestMethod = 'PUT';
			// endpoint already set
			body = {}; // Partial update
			if (this.getNodeParameter('name', index)) {
				body.name = this.getNodeParameter('name', index) as string;
			}
			if (this.getNodeParameter('feature', index)) {
				body.feature = this.getNodeParameter('feature', index) as string;
			}
			if (this.getNodeParameter('fieldType', index)) {
				body.fieldType = this.getNodeParameter('fieldType', index) as string;
			}
			if (this.getNodeParameter('order', index) !== undefined) { // Check for !== undefined for number type
				body.order = this.getNodeParameter('order', index) as number;
			}
			// TODO: Add other optional fields
			const valuesUpdate = this.getNodeParameter('values', index, []) as string[];
			if (valuesUpdate.length > 0) { // Só envia se não for vazio
				body.values = valuesUpdate.map(val => ({ value: val }));
			}
			const subFieldSettingsUpdate = this.getNodeParameter('subFieldSettings', index, '{}') as string;
			if (subFieldSettingsUpdate !== '{}') { // Só envia se não for objeto vazio
				try {
					body.subFieldSettings = JSON.parse(subFieldSettingsUpdate);
				} catch (e) { console.error("Invalid JSON for subFieldSettings", e); }
			}
			const settingsUpdate = this.getNodeParameter('settings', index, {}) as object;
			if (Object.keys(settingsUpdate).length > 0) { // Só envia se não for objeto vazio
				body.settings = settingsUpdate;
			}
			break;

		default:
			throw new Error(`Operation '${operation}' not supported for Custom Field resource.`);
	}

	// Only GET, PUT, DELETE operations should reach here now
	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Process response for non-create operations
	if (['update', 'get', 'getAll'].includes(operation)) { // Added 'search' if applicable, assuming getAll handles it
		return responseData;
	}
	// Delete usually returns 204 No Content or similar, maybe return success status
	else if (operation === 'delete') {
		return { success: true }; // Or check actual API response status/body
	}

	return responseData; // Fallback
} 