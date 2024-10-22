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


export async function organizationRequest(
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
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index) as object),
				source: this.getNodeParameter('source', index),
			};
			break;
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
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/organizations/${this.getNodeParameter('organizationId', index)}`;
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
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index) as object),
				source: this.getNodeParameter('source', index),
			};
			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/organizations';
			qs.search = this.getNodeParameter('search', index) as string;
			break;
		default:
			break;
	}


	if (operation === 'getAll') return magnetCustomerApiRequestAllItems.call(this, requestMethod, endpoint, body, qs,);

	const {organization} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return organization;}

