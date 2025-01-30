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

export async function customerRequest(
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
			endpoint = '/import/contacts';
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
			endpoint = `/contacts/${this.getNodeParameter('customerId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/contacts/${this.getNodeParameter('customerId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/contacts';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
			};
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/contacts/${this.getNodeParameter('customerId', index)}`;
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
		case 'search':
			requestMethod = 'GET';
			endpoint = '/contacts';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
				search: this.getNodeParameter('search', index) as string,
			};
			break;
		default:
			break;
	}

	if (['GET'].includes(String(requestMethod))) return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);

	const {contact} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return contact;
}

