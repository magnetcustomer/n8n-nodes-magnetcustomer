import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	LoggerProxy as Logger
} from "n8n-workflow";
import {magnetCustomerApiRequest, magnetCustomerApiRequestAllItems} from "./GenericFunctions";

function addPhones(collection: { phones?: [{ number: string }] }) {
	const phones: Array<{ typePhone: string; number: any; }> = [];

	if (!collection?.phones) return phones;

	for (const phone of collection.phones) {
		phones.push({typePhone: 'business', number: phone.number});
	}

	return phones;
}

function addCustomFields(collection: { customFields?: [{ name: string, v: string }] }) {
	const customFields: Array<{ customField: any; k: any; v: any; }> = [];

	if (!collection?.customFields) return customFields;

	for (const customField of collection.customFields) {

		const id = (customField.name.split("customField_"))[1];
		customFields.push({
			"customField": id,
			"k": id,
			"v": customField.v,
		});

	}

	return customFields;
}

export async function leadRequest(
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
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/leads/${this.getNodeParameter('leadId', index)}`;
			body.customFields = addCustomFields(this.getNodeParameter('customFieldCollection', index) as object);
			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/leads';
			qs.search = this.getNodeParameter('search', index) as string;
			break;
		default:
			break;
	}

	Logger.debug(`requestMethod:: ${requestMethod}`);
	Logger.debug(`endpoint:: ${endpoint}`);
	Logger.debug(`body:: ${JSON.stringify(body)}`);
	Logger.debug(`qs:: ${JSON.stringify(qs)}`);

	if (operation === 'getAll') return magnetCustomerApiRequestAllItems.call(this, requestMethod, endpoint, body, qs,);

	return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
}

