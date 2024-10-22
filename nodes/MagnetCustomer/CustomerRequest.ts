import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	LoggerProxy as Logger
} from "n8n-workflow";
import {magnetCustomerApiRequest, magnetCustomerApiRequestAllItems} from "./GenericFunctions";

function addAdditionalFields(customFieldCollection: any) {
	const customFields = [];

	for (const customField of customFieldCollection.customFields) {
		customFields.push({
			customField: customField.name,
			k: customField.name,
			v: customField.v,
		});
	}

	return customFields;
}


export async function customerRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	const body: IDataObject = {};
	const qs: IDataObject = {};


	switch (operation) {
		case 'create':
			requestMethod = 'POST';
			endpoint = '/import/contacts';
			body.customFields = addAdditionalFields(this.getNodeParameter('customFieldCollection', index));
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
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/contacts/${this.getNodeParameter('customerId', index)}`;
			body.customFields = addAdditionalFields(this.getNodeParameter('customFieldCollection', index));
			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/contacts';
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

