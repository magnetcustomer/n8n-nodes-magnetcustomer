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


export async function dealRequest(
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
			endpoint = '/import/deals';

			const associateWith = this.getNodeParameter('associateWith', index) as | 'organization' | 'contact';
			if (associateWith === 'organization') {
				body.organization = this.getNodeParameter('organization', index) as string;
			} else {
				body.contact = this.getNodeParameter('contact', index) as string;
			}
			body.customFields = addAdditionalFields(this.getNodeParameter('customFieldCollection', index));
			break;
		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/deals/${this.getNodeParameter('dealId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/deals/${this.getNodeParameter('dealId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/deals';
			break;
		case 'update':
			requestMethod = 'PUT';
			endpoint = `/deals/${this.getNodeParameter('dealId', index)}`;
			body.customFields = addAdditionalFields(this.getNodeParameter('customFieldCollection', index));
			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/deals';
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

