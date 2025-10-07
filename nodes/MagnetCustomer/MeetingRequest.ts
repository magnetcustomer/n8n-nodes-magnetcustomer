import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function meetingRequest(
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
			endpoint = `/meetings/${this.getNodeParameter('meetingId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/meetings';
			{
				const page = this.getNodeParameter('page', index, undefined) as number | undefined;
				const limit = this.getNodeParameter('limit', index, undefined) as number | undefined;
				if (typeof page === 'number' && page > 0) qs.page = page;
				if (typeof limit === 'number' && limit > 0) qs.limit = limit;
			}
			break;

		case 'create':
			requestMethod = 'POST';
			endpoint = '/meetings';
			body = {
				title: this.getNodeParameter('title', index),
				start: this.getNodeParameter('start', index),
				end: this.getNodeParameter('end', index),
				calendar: this.getNodeParameter('calendar', index),
				workspace: this.getNodeParameter('workspace', index),
				participants: this.getNodeParameter('participants', index, []),
				staff: this.getNodeParameter('staff', index),
				type: this.getNodeParameter('type', index),
				room: this.getNodeParameter('room', index),
				contact: this.getNodeParameter('contact', index),
				branch: this.getNodeParameter('branch', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			{
				const meetingId = this.getNodeParameter('meetingId', index) as string;
				endpoint = `/meetings/${meetingId}`;
				const add = (param: string) => {
					const v = this.getNodeParameter(param, index);
					if (v !== undefined && v !== null && v !== '') body[param] = v;
				};
				add('title');
				add('start');
				add('end');
				add('calendar');
				add('workspace');
				add('participants');
				add('staff');
				add('type');
				add('room');
				add('contact');
				add('branch');
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/meetings/${this.getNodeParameter('meetingId', index)}`;
			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/meetings';
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


