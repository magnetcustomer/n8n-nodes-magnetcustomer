import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function meetingRoomRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
const qs: IDataObject = {};

	switch (operation) {
		case 'get':
			requestMethod = 'GET';
			endpoint = `/meetings/rooms/${this.getNodeParameter('meetingRoomId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/meetings/rooms';
			{
				const page = this.getNodeParameter('page', index, undefined) as number | undefined;
				const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
				if (typeof page === 'number' && page > 0) qs.page = page;
				if (typeof limit === 'number' && limit > 0) qs.limit = limit;
			}
			break;

		case 'create':
			if (!this.getNodeParameter('name', index)) {
				throw new Error('Parameter "name" is required for create operation');
			}
			requestMethod = 'POST';
			endpoint = '/meetings/rooms';
			body = {
				name: this.getNodeParameter('name', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			{
				const id = this.getNodeParameter('meetingRoomId', index) as string;
				endpoint = `/meetings/rooms/${id}`;
				const name = this.getNodeParameter('name', index);
				if (name !== undefined && name !== null && name !== '') body.name = name as string;
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/meetings/rooms/${this.getNodeParameter('meetingRoomId', index)}`;
			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/meetings/rooms';
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


