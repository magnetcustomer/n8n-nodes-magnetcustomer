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
			break;

		case 'delete':
			requestMethod = 'DELETE';
			// endpoint already set
			break;

		case 'get':
			requestMethod = 'GET';
			// endpoint already set
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/customfields';
			qs = {
				limit: this.getNodeParameter('limit', index, 50) as number,
				// TODO: Add pagination if API supports it (page? offset?)
				page: this.getNodeParameter('page', index, 1) as number,
				search: this.getNodeParameter('search', index, '') as string,
			};
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

	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Return the object directly for create/update/get
	if (['create', 'update', 'get'].includes(operation)) {
		return responseData;
	}
	// For getAll, the response might be paginated or nested (e.g., response.data)
	// Assuming magnetCustomerApiRequest handles potential nesting or pagination might be needed
	else if (operation === 'getAll') {
		// Check response structure if necessary
		return responseData;
	}
	// Delete usually returns 204 No Content or similar, maybe return success status
	else if (operation === 'delete') {
		return { success: true }; // Or check actual API response status/body
	}

	return responseData; // Fallback
} 