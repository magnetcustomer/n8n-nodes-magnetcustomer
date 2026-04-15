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
				position: this.getNodeParameter('position', index) as number,
				isExpanded: this.getNodeParameter('isExpanded', index, true) as boolean,
				summaryDisplay: this.getNodeParameter('summaryDisplay', index, true) as boolean,
			};
			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Debug optional
			if (process.env.N8N_DEBUG_MCJ === '1') {
				console.log('Raw API Response (Create CustomFieldBlock):', JSON.stringify(response, null, 2));
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
			requestMethod = 'GET';
			endpoint = '/customfields/blocks';
			qs = {};
			const pageGetAll = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitGetAll = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageGetAll === 'number' && pageGetAll > 0) qs.page = pageGetAll;
			if (typeof limitGetAll === 'number' && limitGetAll > 0) qs.limit = limitGetAll;
			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/customfields/blocks';
			qs = {};
			const pageSearch = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitSearch = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageSearch === 'number' && pageSearch > 0) qs.page = pageSearch;
			if (typeof limitSearch === 'number' && limitSearch > 0) qs.limit = limitSearch;
			qs.search = this.getNodeParameter('search', index) as string;
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