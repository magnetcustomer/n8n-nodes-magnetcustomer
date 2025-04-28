import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function customFieldTypeRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	const requestMethod = 'GET'; // Only GET operations available
	const endpoint = '/customfieldtypes';
	const body: IDataObject = {};
	let qs: IDataObject = {};

	if (operation === 'getAll' || operation === 'search') {
		qs = {
			page: this.getNodeParameter('page', index, 1) as number,
			limit: this.getNodeParameter('limit', index, 15) as number,
			search: operation === 'search' ? this.getNodeParameter('search', index, '') : '',
		};

		// Add optional filters
		const filters = this.getNodeParameter('filters', index, {}) as {
			emailsEmpty?: boolean;
			phonesEmpty?: boolean;
			interactionsEmpty?: boolean;
		};
		if (filters.emailsEmpty !== undefined) qs.emailsEmpty = filters.emailsEmpty;
		if (filters.phonesEmpty !== undefined) qs.phonesEmpty = filters.phonesEmpty;
		if (filters.interactionsEmpty !== undefined) qs.interactionsEmpty = filters.interactionsEmpty;

		// Add optional sorting
		const sort = this.getNodeParameter('sort', index, {}) as {
			sortBy?: string;
			sortType?: string;
		};
		if (sort.sortBy) qs.sortBy = sort.sortBy;
		if (sort.sortType) qs.sortType = sort.sortType;

	} else {
		throw new Error(`Operation '${operation}' not supported for Custom Field Type resource.`);
	}

	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Assuming the response for getAll/search is directly usable or needs pagination handling
	return responseData;
} 