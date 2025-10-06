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

export async function leadRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};


	switch (operation) {
		case 'create':
			requestMethod = 'POST';
			endpoint = '/import/leads';
			body = {
				lifeCycle: this.getNodeParameter('lifeCycle', index),
				fullname: this.getNodeParameter('fullname', index),
				email: this.getNodeParameter('email', index),
				phones: addPhones(this.getNodeParameter('phoneCollection', index) as object),
				gender: this.getNodeParameter('gender', index),
				birthDate: this.getNodeParameter('birthDate', index),
				work: this.getNodeParameter('work', index),
				maritalStatus: this.getNodeParameter('maritalStatus', index),
				doc: this.getNodeParameter('doc', index),
				type: this.getNodeParameter('type', index),
				state: this.getNodeParameter('state', index),
				city: this.getNodeParameter('city', index),
				address: this.getNodeParameter('address', index),
				addressNumber: this.getNodeParameter('addressNumber', index),
				complement: this.getNodeParameter('complement', index),
				neighborhood: this.getNodeParameter('neighborhood', index),
				cep: this.getNodeParameter('cep', index),
				owners: [this.getNodeParameter('owners', index)],
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index) as object),
				source: this.getNodeParameter('source', index),
			};

			break;
		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/leads/${this.getNodeParameter('leadId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/leads/${this.getNodeParameter('leadId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/leads';
			qs = {};
			const pageGetAll = this.getNodeParameter('page', index, undefined) as number | undefined;
			const limitGetAll = this.getNodeParameter('limit', index, undefined) as number | undefined;
			if (typeof pageGetAll === 'number' && pageGetAll > 0) qs.page = pageGetAll;
			if (typeof limitGetAll === 'number' && limitGetAll > 0) qs.limit = limitGetAll;
			break;
		case 'update':
			requestMethod = 'PUT';
			const leadId = this.getNodeParameter('leadId', index) as string;
			endpoint = `/leads/${leadId}`;
			body = {}; // Start with empty body for partial update

			// Helper function to add parameter to body if it exists
			const addParam = (paramName: string, bodyKey?: string) => {
				const value = this.getNodeParameter(paramName, index);
				if (value !== undefined && value !== null && value !== '') {
					body[bodyKey ?? paramName] = value;
				}
			};

			// Add fields to body only if provided by the user
			addParam('lifeCycle');
			addParam('fullname');
			addParam('email');
			addParam('gender');
			addParam('birthDate');
			addParam('work');
			addParam('maritalStatus');
			addParam('doc');
			addParam('type');
			addParam('state');
			addParam('city');
			addParam('address');
			addParam('addressNumber');
			addParam('complement');
			addParam('neighborhood');
			addParam('cep');
			addParam('source');

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
			endpoint = '/leads';
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

	// Ajuste para Delete
	if (operation === 'delete') {
		await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return { success: true };
	}

	if (['GET'].includes(String(requestMethod))) return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);

	// Ajuste para Update retornar o objeto contact
	if (operation === 'update') {
		const { contact } = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return contact;
	}

	const {contact} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return contact;
}

