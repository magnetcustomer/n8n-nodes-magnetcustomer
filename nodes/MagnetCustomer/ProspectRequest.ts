import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	addCustomFields,
	addPhones,
	magnetCustomerApiRequest,
	magnetCustomerApiRequestAllItems
} from "./GenericFunctions";

export async function prospectRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	const qs: IDataObject = {};


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
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/prospects/${this.getNodeParameter('prospectId', index)}`;
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
			endpoint = '/prospects';
			qs.search = this.getNodeParameter('search', index) as string;
			break;
		default:
			break;
	}

	if (operation === 'getAll') return magnetCustomerApiRequestAllItems.call(this, requestMethod, endpoint, body, qs,);

	const {contact} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return contact;
}

