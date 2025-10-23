import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function treatmentTypeRequest(
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
			endpoint = `/treatments/types/${this.getNodeParameter('treatmentTypeId', index)}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/treatments/types';
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
			endpoint = '/treatments/types';
			body = {
				name: this.getNodeParameter('name', index),
			};
			break;

		case 'update':
			requestMethod = 'PUT';
			{
				const id = this.getNodeParameter('treatmentTypeId', index) as string;
				endpoint = `/treatments/types/${id}`;
				const name = this.getNodeParameter('name', index);
				if (name !== undefined && name !== null && name !== '') body.name = name as string;
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/treatments/types/${this.getNodeParameter('treatmentTypeId', index)}`;
			break;

		case 'search':
			requestMethod = 'GET';
			endpoint = '/treatments/types';
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


