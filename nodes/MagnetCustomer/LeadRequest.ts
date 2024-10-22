import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	LoggerProxy as Logger
} from "n8n-workflow";
import {magnetCustomerApiRequest, magnetCustomerApiRequestAllItems} from "./GenericFunctions";

function addPhones(collection: any) {
	const phones: Array<{ typePhone: string; number: any; }> = [];

	if (!collection) return phones;

	for (const phone of collection.phones) {
		phones.push({typePhone: 'business', number: phone});
	}

	return phones;
}

function addCustomFields(collection: any) {
	const customFields: Array<{ customField: any; k: any; v: any; }> = [];

	if (!collection) return customFields;

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
				phones: addPhones(this.getNodeParameter('phoneCollection', index)),
				type: this.getNodeParameter('type', index),
				owners: [this.getNodeParameter('owners', index)],
				address: this.getNodeParameter('address', index),
				neighborhood: this.getNodeParameter('neighborhood', index),
				cep: this.getNodeParameter('cep', index),
				doc: this.getNodeParameter('doc', index),
				state: this.getNodeParameter('state', index),
				city: this.getNodeParameter('city', index),
				gender: this.getNodeParameter('gender', index),
				birthDate: this.getNodeParameter('birthDate', index),
				age: this.getNodeParameter('age', index),
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index)),
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
			body.customFields = addCustomFields(this.getNodeParameter('customFieldCollection', index));
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

