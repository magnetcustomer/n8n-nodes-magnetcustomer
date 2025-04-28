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

export async function prospectRequest(
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
			endpoint = '/import/prospects';
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
			endpoint = `/prospects/${this.getNodeParameter('prospectId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/prospects/${this.getNodeParameter('prospectId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/prospects';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
			};
			break;
		case 'update':
			requestMethod = 'PUT';
			const prospectId = this.getNodeParameter('prospectId', index) as string;
			endpoint = `/prospects/${prospectId}`;
			body = {}; // Start with empty body for partial update

			// Helper function to add parameter to body if it exists
			const addParam = (paramName: string, bodyKey?: string) => {
				const value = this.getNodeParameter(paramName, index);
				if (value !== undefined && value !== null && value !== '') {
					body[bodyKey ?? paramName] = value;
				}
			};

			// Add fields to body only if provided by the user
			addParam('lifeCycle'); // Assuming lifecycle can be updated
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
			endpoint = '/prospects';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
				search: this.getNodeParameter('search', index) as string,
			};
			break;
		default:
			break;
	}

	// Ajuste para Delete
	if (operation === 'delete') {
		await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return { success: true };
	}

	// Ajuste para Update retornar o objeto contact
	if (operation === 'update') {
		const { contact } = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return contact;
	}

	if (['GET'].includes(String(requestMethod))) return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);

	const {contact} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return contact;
}

