import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import {NodeApiError} from 'n8n-workflow';

export interface ICustomFieldInterface {
	_id: string;
	system: boolean;
	feature: string;
	name: string;
	slug: string;
	fieldType: { fieldType: string };
	fieldRef?: string;
	values?: Array<{
		_id: string;
		value: string;
	}>;
	position?: number;
	active: boolean;
}

export interface ICustomField {
	[key: string]: ICustomFieldInterface;
}


/**
 * Make an API request to MagnetCustomer
 *
 */
export async function magnetCustomerApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject,
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<any> {
	const authenticationMethod = this.getNodeParameter('authentication', 0);
	let credentials;

	if (authenticationMethod === 'apiToken') {
		credentials = await this.getCredentials<{ subDomainAccount: string }>('magnetCustomerApi');
	} else {
		credentials = await this.getCredentials<{ subDomainAccount: string }>('magnetCustomerOAuth2Api');
	}

	let options: IRequestOptions = {
		method,
		qs,
		body,
		uri: uri ?? `https://${credentials.subDomainAccount}.platform-api.magnetcustomer.com/api${resource}`,
		json: true,
		headers: {
			api: 'n8n',
		},
		qsStringifyOptions: {
			arrayFormat: 'repeat',
		},
	};

	options = Object.assign({}, options, option);
	if (Object.keys(options.body as IDataObject).length === 0) {
		delete options.body;
	}
	if (Object.keys(body).length !== 0) {
		options.body = body;
	}

	try {
		const credentialType = authenticationMethod === 'apiToken' ? 'magnetCustomerApi' : 'magnetCustomerOAuth2Api';
		return this.helpers.requestWithAuthentication.call(this, credentialType, options,);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request to paginated MagnetCustomer endpoint
 * and return all results
 *
 * @param method
 * @param resource
 * @param body
 * @param query
 */
export async function magnetCustomerApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject,
	query?: IDataObject,
): Promise<any> {
	if (query === undefined) {
		query = {};
	}

	query.page = 1;
	query.limit = 15;

	const returnData: IDataObject[] = [];
	let responseData;

	do {
		responseData = await magnetCustomerApiRequest.call(this, method, resource, body, query);
		returnData.push.apply(returnData, responseData.docs as IDataObject[]);

		query.page = responseData.nextPage;
	} while (responseData.hasNextPage === true);

	return {
		data: returnData,
	};
}

/**
 * Gets the custom properties from MagnetCustomer
 *
 * @param resource
 * @param creatableWhen
 */
export async function magnetCustomerGetCustomFields(
	this: IHookFunctions | IExecuteFunctions,
	resource: string,
): Promise<ICustomField[]> {

	const requestMethod = 'GET';
	const body = {};
	const qs = {
		"creatable": true,
		"feature": resource,
		"subFieldSettings.active": false,
	};
	const endpoint = '/customfields';

	// Get the custom properties and their values
	const responseData = await magnetCustomerApiRequest.call(
		this,
		requestMethod,
		endpoint,
		body,
		qs,
	);

	return responseData;
}

/**
 * Converts names and values of custom properties from their actual values to the
 * MagnetCustomer internal ones
 *
 */
export function magnetCustomerEncodeCustomProperties(
	customFieldList: ICustomField,
	item: IDataObject,
): void {
	let customFieldData;

	for (const key of Object.keys(item)) {
		customFieldData = Object.values(customFieldList).find((propertyData) => propertyData.name === key);

		if (customFieldData !== undefined) {
			if (item[key] !== null && item[key] !== undefined && customFieldData.values !== undefined && Array.isArray(customFieldData.values)) {
				const propertyOption = customFieldData.values.find((option) => option.value.toString() === item[key]?.toString());
				if (propertyOption !== undefined) {
					item[`customField_${customFieldData._id}`] = propertyOption._id;
					delete item[key];
				}
			}
			else {
				item[`customField_${customFieldData._id}`] = item[key];
				delete item[key];
			}
		}
	}
}

/**
 * Converts names and values of custom properties to their actual values
 *
 */
export function magnetCustomerResolveCustomFields(
	customFieldList: ICustomField,
	item: IDataObject,
): void {
	let customFieldData;

	const json = item.json as IDataObject;
	for (const [key, value] of Object.entries(json)) {
		if (customFieldList[key] !== undefined) {
			customFieldData = customFieldList[key];

			if (value === null) {
				json[customFieldData.name] = value;
				delete json[key];
				continue;
			}

			if (['varchar', 'text', 'phone', 'link', 'date', 'time', 'enum', 'monetary', 'double',].includes(customFieldData.fieldType.fieldType)) {
				json[customFieldData.name] = value;
				delete json[key];
			}
			else if (['enum'].includes(customFieldData.fieldType.fieldType) && customFieldData.values) {
				const propertyOption = customFieldData.values.find((option) => option._id.toString() === value?.toString());
				if (propertyOption !== undefined) {
					json[customFieldData.name] = propertyOption.value;
					delete json[key];
				}
			}
			else if (['set'].includes(customFieldData.fieldType.fieldType) && customFieldData.values && typeof value === 'string') {
				const selectedIds = value.split(',');
				const selectedLabels = customFieldData.values
					.filter((option) => selectedIds.includes(option._id.toString()))
					.map((option) => option.value);

				json[customFieldData.name] = selectedLabels;
				delete json[key];
			}
		}
	}
	item.json = json;
}

export function sortOptionParameters(
	optionParameters: INodePropertyOptions[],
): INodePropertyOptions[] {
	optionParameters.sort((a, b) => {
		const aName = a.name.toLowerCase();
		const bName = b.name.toLowerCase();
		if (aName < bName) {
			return -1;
		}
		if (aName > bName) {
			return 1;
		}
		return 0;
	});

	return optionParameters;
}


export function addPhones(collection: { phones?: [{ number: string }] }) {
	const phones: Array<{ typePhone: string; number: any; }> = [];

	if (!collection?.phones) return phones;

	for (const phone of collection.phones) {
		phones.push({typePhone: 'business', number: phone.number});
	}

	return phones;
}

export function addCustomFields(collection: { customFields?: [{ _id: string, v: string }] }) {
	const customFields: Array<{ customField: string; v: string; }> = [];

	if (!collection?.customFields) return customFields;

	for (const customField of collection.customFields) {
		const id = customField._id;

		if (id && customField.v !== undefined) {
		customFields.push({
			"customField": id,
			"v": customField.v,
		});
		} else {
			console.warn('Skipping custom field entry due to missing ID or value:', customField);
		}
	}

	return customFields;
}
