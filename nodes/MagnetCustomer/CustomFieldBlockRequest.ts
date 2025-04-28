import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function customFieldBlockRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};
	let blockId: string | undefined;

	if (['get', 'update', 'delete'].includes(operation)) {
		blockId = this.getNodeParameter('blockId', index) as string;
		endpoint = `/customfields/blocks/${blockId}`;
	}

	switch (operation) {
		case 'create':
			requestMethod = 'POST';
			endpoint = '/customfields/blocks';
			body = {
				name: this.getNodeParameter('name', index) as string,
				feature: this.getNodeParameter('feature', index) as string,
				order: this.getNodeParameter('order', index) as number,
				position: this.getNodeParameter('position', index) as number,
				isExpanded: this.getNodeParameter('isExpanded', index, true) as boolean,
				summaryDisplay: this.getNodeParameter('summaryDisplay', index, true) as boolean,
			};
			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Log the raw response for create
			console.log('Raw API Response (Create CustomFieldBlock):', JSON.stringify(response, null, 2));
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
			endpoint = '/customfields/blocks';
			qs = {
				page: this.getNodeParameter('page', index, 1) as number,
				limit: this.getNodeParameter('limit', index, 15) as number,
				search: operation === 'search' ? this.getNodeParameter('search', index, '') : '',
			};
			const featureFilter = this.getNodeParameter('feature', index) as string | undefined;
			if (featureFilter) {
				qs.feature = featureFilter;
			}
			// TODO: Add pagination if API supports it (page? limit?)
			// Add optional filters
			const filters = this.getNodeParameter('filters', index, {}) as {
				feature?: string;
				emailsEmpty?: boolean;
				phonesEmpty?: boolean;
				interactionsEmpty?: boolean;
			};
			if (filters.feature) qs.feature = filters.feature;
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
			if (this.getNodeParameter('order', index) !== undefined) {
				body.order = this.getNodeParameter('order', index) as number;
			}
			if (this.getNodeParameter('position', index) !== undefined) {
				body.position = this.getNodeParameter('position', index) as number;
			}
			if (this.getNodeParameter('isExpanded', index) !== undefined) {
				body.isExpanded = this.getNodeParameter('isExpanded', index) as boolean;
			}
			if (this.getNodeParameter('summaryDisplay', index) !== undefined) {
				body.summaryDisplay = this.getNodeParameter('summaryDisplay', index) as boolean;
			}
			break;

		default:
			throw new Error(`Operation '${operation}' not supported for Custom Field Block resource.`);
	}

	// Only GET, PUT, DELETE operations should reach here now
	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Process response for non-create operations
	if (['update', 'get', 'getAll', 'search'].includes(operation)) {
		return responseData;
	}
	else if (operation === 'delete') {
		// Keep existing delete behavior (assuming API confirms deletion)
		// If the API returns something else on delete, adjust here.
		// For now, assuming it doesn't return the deleted object itself.
		return { success: true }; // Or return responseData if API returns useful info
	}

	return responseData; // Fallback
} 