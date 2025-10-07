import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function treatmentRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};

	switch (operation) {
		case 'get':
			requestMethod = 'GET';
			endpoint = `/treatments/${this.getNodeParameter('treatmentId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/treatments';
			{
				const page = this.getNodeParameter('page', index, undefined) as number | undefined;
				const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
				if (typeof page === 'number' && page > 0) qs.page = page;
				if (typeof limit === 'number' && limit > 0) qs.limit = limit;
			}
			break;

		case 'create':
			requestMethod = 'POST';
			endpoint = '/treatments';
			body = {
				type: this.getNodeParameter('type', index),
				contact: this.getNodeParameter('contact', index),
				subject: this.getNodeParameter('subject', index),
				nameType: this.getNodeParameter('nameType', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			{
				const treatmentId = this.getNodeParameter('treatmentId', index) as string;
				endpoint = `/treatments/${treatmentId}`;
				const add = (param: string) => {
					const v = this.getNodeParameter(param, index);
					if (v !== undefined && v !== null && v !== '') body[param] = v;
				};
				add('type');
				add('contact');
				add('subject');
				add('nameType');
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/treatments/${this.getNodeParameter('treatmentId', index)}`;
			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/treatments';
			{
				const page = this.getNodeParameter('page', index, undefined) as number | undefined;
				const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
				if (typeof page === 'number' && page > 0) qs.page = page;
				if (typeof limit === 'number' && limit > 0) qs.limit = limit;
				const search = this.getNodeParameter('search', index, '') as string;
				if (search) qs.search = search;
			}
			break;

		default:
			break;
	}

	return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
}


