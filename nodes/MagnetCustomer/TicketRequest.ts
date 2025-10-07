import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function ticketRequest(
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
			endpoint = `/tickets/${this.getNodeParameter('ticketId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/tickets';
			{
				const page = this.getNodeParameter('page', index, undefined) as number | undefined;
				const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
				if (typeof page === 'number' && page > 0) qs.page = page;
				if (typeof limit === 'number' && limit > 0) qs.limit = limit;
			}
			break;

		case 'create':
			requestMethod = 'POST';
			endpoint = '/tickets';
			body = {
				subject: this.getNodeParameter('subject', index),
				description: this.getNodeParameter('description', index),
				priority: this.getNodeParameter('priority', index),
				workspaceReceiver: this.getNodeParameter('workspaceReceiver', index),
				contact: this.getNodeParameter('contact', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			{
				const ticketId = this.getNodeParameter('ticketId', index) as string;
				endpoint = `/tickets/${ticketId}`;
				const add = (param: string) => {
					const v = this.getNodeParameter(param, index);
					if (v !== undefined && v !== null && v !== '') body[param] = v;
				};
				add('subject');
				add('description');
				add('priority');
				add('workspaceReceiver');
				add('contact');
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/tickets/${this.getNodeParameter('ticketId', index)}`;
			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/tickets';
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


