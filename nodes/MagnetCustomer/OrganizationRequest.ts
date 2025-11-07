import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	addCustomFields,
	addPhones,
	magnetCustomerApiRequest
} from "./GenericFunctions";


export async function organizationRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};


	switch (operation) {
		case 'create':
				if (!this.getNodeParameter('fullname', index)) {
					throw new Error('Parameter "fullname" is required for create operation');
				}
			requestMethod = 'POST';
			endpoint = '/import/organizations';
			body = {
				fullname: this.getNodeParameter('fullname', index),
				email: this.getNodeParameter('email', index),
				phones: addPhones(this.getNodeParameter('phoneCollection', index) as object),
				birthDate: this.getNodeParameter('birthDate', index),
				doc: this.getNodeParameter('doc', index),
				state: this.getNodeParameter('state', index),
				city: this.getNodeParameter('city', index),
				address: this.getNodeParameter('address', index),
				addressNumber: this.getNodeParameter('addressNumber', index),
				complement: this.getNodeParameter('complement', index),
				neighborhood: this.getNodeParameter('neighborhood', index),
				cep: this.getNodeParameter('cep', index),
				owners: [this.getNodeParameter('owners', index)],
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index) as object)
			};
			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Debug optional
			if (process.env.N8N_DEBUG_MCJ === '1') {
				console.log('Raw API Response (Create Organization):', JSON.stringify(response, null, 2));
			}
			return response; // Return the full response for create

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/organizations/${this.getNodeParameter('organizationId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/organizations/${this.getNodeParameter('organizationId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/organizations';
			qs = {};
			const pageGetAll = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitGetAll = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageGetAll === 'number' && pageGetAll > 0) qs.page = pageGetAll;
			if (typeof limitGetAll === 'number' && limitGetAll > 0) qs.limit = limitGetAll;
			break;
		case 'update':
			requestMethod = 'PUT';
			const organizationId = this.getNodeParameter('organizationId', index) as string;
			endpoint = `/organizations/${organizationId}`;
			body = {}; // Start with empty body for partial update

			// Helper function to add parameter to body if it exists
			const addParam = (paramName: string, bodyKey?: string) => {
				const value = this.getNodeParameter(paramName, index);
				if (value !== undefined && value !== null && value !== '') { // Check for non-empty/null values
					body[bodyKey ?? paramName] = value;
				}
			};

			// Add fields to body only if provided by the user
			addParam('fullname');
			addParam('email');
			addParam('birthDate');
			addParam('doc');
			addParam('state');
			addParam('city');
			addParam('address');
			addParam('addressNumber');
			addParam('complement');
			addParam('neighborhood');
			addParam('cep');

			// Handle collections/arrays
			const phones = this.getNodeParameter('phoneCollection', index) as any;
			if (phones?.phones && phones.phones.length > 0) {
				body.phones = addPhones(phones);
			}

			const owners = this.getNodeParameter('owners', index);
			if (owners && owners !== '') { // Assuming owners is a single ID string for now
				body.owners = [owners];
			}

			const customFields = this.getNodeParameter('customFieldCollection', index) as any;
			if (customFields?.customFields && customFields.customFields.length > 0) {
				body.customFields = addCustomFields(customFields);
			}

			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/organizations';
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

