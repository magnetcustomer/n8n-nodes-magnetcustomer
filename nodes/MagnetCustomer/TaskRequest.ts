import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function taskRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};


	switch (operation) {
		case 'create':
				if (!this.getNodeParameter('title', index)) {
					throw new Error('Parameter "title" is required for create operation');
				}
			requestMethod = 'POST';
			endpoint = '/import/tasks';
			body = {
				title: this.getNodeParameter('title', index),
				observation: this.getNodeParameter('observation', index),
				type: this.getNodeParameter('type', index),
				dateOfExpires: this.getNodeParameter('dateOfExpires', index),
				source: this.getNodeParameter('source', index),
			};

			if (this.getNodeParameter('associateWith', index) === 'deal') {
				body.deal = this.getNodeParameter('deal', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'contact') {
				body.contact = this.getNodeParameter('contact', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'organization') {
				body.organization = this.getNodeParameter('organization', index) as string;
			}
			if (this.getNodeParameter('owner', index)) {
				body.owner = this.getNodeParameter('owner', index);
			}
			if (this.getNodeParameter('dateFinished', index)) {
				body.dateFinished = this.getNodeParameter('dateFinished', index);
			}
			if (this.getNodeParameter('status', index)) {
				body.status = this.getNodeParameter('status', index);
			}

			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Debug optional
			if (process.env.N8N_DEBUG_MCJ === '1') {
				console.log('Raw API Response (Create Task):', JSON.stringify(response, null, 2));
			}
			return response; // Return the full response for create

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/tasks/${this.getNodeParameter('taskId', index)}`;
			break;

		case 'get':
			requestMethod = 'GET';
			endpoint = `/tasks/${this.getNodeParameter('taskId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/tasks';
			qs = {};
			const pageGetAll = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitGetAll = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageGetAll === 'number' && pageGetAll > 0) qs.page = pageGetAll;
			if (typeof limitGetAll === 'number' && limitGetAll > 0) qs.limit = limitGetAll;
			break;

		case 'update':
			requestMethod = 'PUT';
			const taskId = this.getNodeParameter('taskId', index) as string;
			endpoint = `/tasks/${taskId}`;
			body = {}; // Start with empty body for partial update

			// Helper function to add parameter to body if it exists
			const addParam = (paramName: string, bodyKey?: string) => {
				const value = this.getNodeParameter(paramName, index);
				if (value !== undefined && value !== null && value !== '') {
					body[bodyKey ?? paramName] = value;
				}
			};

			// Add fields to body only if provided
			addParam('title');
			addParam('observation');
			addParam('type');
			addParam('dateOfExpires');
			addParam('owner');
			addParam('status');
			addParam('dateFinished');
			addParam('source'); // Assuming source might be updatable

			// Handle association
			const associateWith = this.getNodeParameter('associateWith', index);
			if (associateWith === 'deal') {
				addParam('deal');
				// body.contact = null; body.organization = null;
			} else if (associateWith === 'contact') {
				addParam('contact');
				// body.deal = null; body.organization = null;
			} else if (associateWith === 'organization') {
				addParam('organization');
				// body.deal = null; body.contact = null;
			}

			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/tasks';
			qs = {};
			const pageSearch = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitSearch = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageSearch === 'number' && pageSearch > 0) qs.page = pageSearch;
			if (typeof limitSearch === 'number' && limitSearch > 0) qs.limit = limitSearch;
			qs.search = this.getNodeParameter('search', index) as string;
			break;

		default:
			break;
	}

	// Handle GET requests
	if (['GET'].includes(String(requestMethod))) {
		return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
	}

	// Handle PUT (Update) and DELETE requests
	if (operation === 'update') {
		// Return the full response directly for update
		return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
	} else if (operation === 'delete') {
		// Keep existing delete behavior
		await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
		return { success: true };
	}

	// Fallback/Default case (should ideally not be reached if all operations are handled)
	return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
}

