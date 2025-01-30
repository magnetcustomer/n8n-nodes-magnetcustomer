import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function taskRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};


	switch (operation) {
		case 'create':
			requestMethod = 'POST';
			endpoint = '/import/tasks';
			body = {
				title: this.getNodeParameter('title', index),
				observation: this.getNodeParameter('observation', index),
				type: this.getNodeParameter('type', index),
				dateOfExpires: this.getNodeParameter('dateOfExpires', index),
				source: this.getNodeParameter('source', index),
			};

			if (this.getNodeParameter('associateWith', index) === 'deal') {
				body.deal = this.getNodeParameter('deal', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'contact') {
				body.contact = this.getNodeParameter('contact', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'organization') {
				body.organization = this.getNodeParameter('organization', index) as string;
			}
			if (this.getNodeParameter('owner', index)) {
				body.owner = this.getNodeParameter('owner', index);
			}
			if (this.getNodeParameter('dateFinished', index)) {
				body.dateFinished = this.getNodeParameter('dateFinished', index);
			}
			if (this.getNodeParameter('status', index)) {
				body.status = this.getNodeParameter('status', index);
			}

			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/tasks/${this.getNodeParameter('taskId', index)}`;
			break;

		case 'get':
			requestMethod = 'GET';
			endpoint = `/tasks/${this.getNodeParameter('taskId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/tasks';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			endpoint = `/tasks/${this.getNodeParameter('taskId', index)}`;
			body = {
				title: this.getNodeParameter('title', index),
				observation: this.getNodeParameter('observation', index),
				type: this.getNodeParameter('type', index),
				dateOfExpires: this.getNodeParameter('dateOfExpires', index),
				source: this.getNodeParameter('source', index),
			};

			if (this.getNodeParameter('associateWith', index) === 'deal') {
				body.deal = this.getNodeParameter('deal', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'contact') {
				body.contact = this.getNodeParameter('contact', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'organization') {
				body.organization = this.getNodeParameter('organization', index) as string;
			}
			if (this.getNodeParameter('owner', index)) {
				body.owner = this.getNodeParameter('owner', index);
			}
			if (this.getNodeParameter('dateFinished', index)) {
				body.dateFinished = this.getNodeParameter('dateFinished', index);
			}
			if (this.getNodeParameter('status', index)) {
				body.status = this.getNodeParameter('status', index);
			}

			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/tasks';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
				search: this.getNodeParameter('search', index) as string,
			};
			break;

		default:
			break;
	}

	if (['GET'].includes(String(requestMethod))) return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);

	const {task} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return task;
}

