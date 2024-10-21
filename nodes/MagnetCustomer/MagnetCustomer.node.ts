import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {NodeConnectionType} from 'n8n-workflow';

import type {ICustomField} from './GenericFunctions';
import {
	magnetCustomerApiRequest,
	magnetCustomerApiRequestAllItems,
	magnetCustomerEncodeCustomProperties,
	magnetCustomerGetCustomFields,
	magnetCustomerResolveCustomFields,
	sortOptionParameters,
} from './GenericFunctions';

import {contactFields, contactOperations} from './ContactDescription';
import {dealFields, dealOperations} from './DealDescription';
import {organizationFields, organizationOperations} from './OrganizationDescription';

interface CustomProperty {
	name: string;
	value: string;
}

/**
 * Add the additional fields to the body
 *
 * @param {IDataObject} body The body object to add fields to
 * @param {IDataObject} additionalFields The fields to add
 */
function addAdditionalFields(body: IDataObject, additionalFields: IDataObject) {
	for (const key of Object.keys(additionalFields)) {
		if (
			key === 'customFieldList' &&
			(additionalFields.customFieldList as IDataObject).property !== undefined
		) {
			for (const customProperty of (additionalFields.customFieldList as IDataObject)
				.property! as CustomProperty[]) {
				body[customProperty.name] = customProperty.value;
			}
		} else {
			body[key] = additionalFields[key];
		}
	}
}

export class MagnetCustomer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MagnetCustomer',
		name: 'magnetCustomer',
		icon: 'file:magnetcustomer.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume MagnetCustomer API',
		defaults: {
			name: 'MagnetCustomer',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'magnetCustomerApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiToken'],
					},
				},
			},
			{
				name: 'magnetCustomerOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Token',
						value: 'apiToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Organization',
						value: 'organization',
					},
				],
				default: 'contact',
			},

			...contactOperations,
			...contactFields,
			...dealOperations,
			...dealFields,
			...organizationOperations,
			...organizationFields,

			// ----------------------------------
			//         activity / deal / note / organization / person / product
			// ----------------------------------
			{
				displayName: 'Resolve Properties',
				name: 'resolveProperties',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['activity', 'deal', 'organization', 'person', 'product'],
						operation: ['get', 'getAll'],
					},
				},
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description:
					'By default do custom properties get returned only as ID instead of their actual name. Also option fields contain only the ID instead of their actual value. If this option gets set they get automatically resolved.',
			},
			{
				displayName: 'Encode Properties',
				name: 'encodeProperties',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['activity', 'deal', 'organization', 'person', 'product'],
						operation: ['update'],
					},
				},
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description:
					'By default do custom properties have to be set as ID instead of their actual name. Also option fields have to be set as ID instead of their actual value. If this option gets set they get automatically encoded.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				default: 100,
				description: 'Max number of results to return',
			},
		],
	};

	methods = {
		loadOptions: {
			// Get all Organizations to display them to user so that they can
			// select them easily
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const {data} = (await magnetCustomerApiRequest.call(this, 'GET', '/organizations', {})) as {
					data: Array<{ _id: string; fullname: string }>;
				};

				return sortOptionParameters(data.map(({_id, fullname}) => ({value: _id, name: fullname})));
			},
			// Get all Deals to display them to user so that they can
			// select them easily
			async getDeals(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const {data} = (await magnetCustomerApiRequest.call(this, 'GET', '/deals', {})) as {
					data: Array<{ _id: string; title: string }>;
				};
				return sortOptionParameters(data.map(({_id, title}) => ({value: _id, name: title})));
			},
			// Get all Contacts to display them to user so that they can
			// select them easily
			async getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const {data} = (await magnetCustomerApiRequest.call(this, 'GET', '/contacts', {})) as {
					data: Array<{ _id: string; fullname: string }>;
				};

				return sortOptionParameters(data.map(({_id, fullname}) => ({value: _id, name: fullname})));
			},

			// Get all Users to display them to user so that they can
			// select them easily
			async getStaffIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/staffs', {});
				for (const user of data) {
					if (user.active === true) {
						returnData.push({
							name: user.fullname,
							value: user._id,
						});
					}
				}

				return sortOptionParameters(returnData);
			},

			// Get all Pipelines to display them to user so that they can
			// select them easily
			// Get all the contact to display them to user so that they
			// can select them easily
			async getPipelineIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/pipelines', {});
				for (const pipeline of data) {
					returnData.push({
						name: `${pipeline.title}`,
						value: pipeline._id,
					});
				}

				return sortOptionParameters(returnData);
			},
			// Get all Stages to display them to user so that they can
			// select them easily
			async getStageIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/stages', {});
				for (const stage of data) {
					returnData.push({
						name: `${(stage.pipeline || {}).title} > ${stage.name}`,
						value: stage._id,
					});
				}

				return sortOptionParameters(returnData);
			},

			// Get all the Organization Custom Fields to display them to user so that they can
			// select them easily
			async getOrganizationCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {
					"creatable": true,
					"feature": 'organization',
					"subFieldSettings.active": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},
			// Get all the Deal Custom Fields to display them to user so that they can
			// select them easily
			async getDealCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {
					"creatable": true,
					"feature": 'deal',
					"subFieldSettings.active": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},
			// Get all the Person Custom Fields to display them to user so that they can
			// select them easily
			async getContactCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const {data} = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {
					"creatable": true,
					"feature": 'contact',
					"subFieldSettings.active": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let body: IDataObject;
		let qs: IDataObject;

		let requestMethod: IHttpRequestMethods;
		let endpoint: string;
		let returnAll = false;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		let customFieldList: ICustomField | undefined;
		if (['get', 'getAll', 'update'].includes(operation) && ['deal', 'organization', 'contact'].includes(resource)) {
			let getCustomFields = false;
			if (['update'].includes(operation)) {
				getCustomFields = this.getNodeParameter('encodeProperties', 0, false) as boolean;
			} else {
				getCustomFields = this.getNodeParameter('resolveProperties', 0, false) as boolean;
			}

			if (getCustomFields) {
				customFieldList = await magnetCustomerGetCustomFields.call(this, resource);
			}
		}

		for (let i = 0; i < items.length; i++) {
			requestMethod = 'GET';
			endpoint = '';
			body = {};
			qs = {};
			try {
				if (resource === 'deal') {
					if (operation === 'create') {
						// ----------------------------------
						//         deal:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/deals';

						body.title = this.getNodeParameter('title', i) as string;

						const associateWith = this.getNodeParameter('associateWith', i) as
							| 'organization'
							| 'person';

						if (associateWith === 'organization') {
							body.org_id = this.getNodeParameter('org_id', i) as string;
						} else {
							body.person_id = this.getNodeParameter('person_id', i) as string;
						}

						const additionalFields = this.getNodeParameter('additionalFields', i);
						addAdditionalFields(body, additionalFields);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         deal:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const dealId = this.getNodeParameter('dealId', i) as number;
						endpoint = `/deals/${dealId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         deal:get
						// ----------------------------------

						requestMethod = 'GET';

						const dealId = this.getNodeParameter('dealId', i) as number;
						endpoint = `/deals/${dealId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         deal:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}
						const filters = this.getNodeParameter('filters', i);
						addAdditionalFields(qs, filters);

						endpoint = '/deals';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         deal:update
						// ----------------------------------

						requestMethod = 'PUT';

						const dealId = this.getNodeParameter('dealId', i) as number;
						endpoint = `/deals/${dealId}`;

						const updateFields = this.getNodeParameter('updateFields', i);
						addAdditionalFields(body, updateFields);

						if (body.label === 'null') {
							body.label = null;
						}
					}
					if (operation === 'search') {
						// ----------------------------------
						//         deal:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.term = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						qs.exact_match = this.getNodeParameter('exactMatch', i) as boolean;
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						const additionalFields = this.getNodeParameter('additionalFields', i);

						if (additionalFields.fields) {
							qs.fields = (additionalFields.fields as string[]).join(',');
						}

						if (additionalFields.organizationId) {
							qs.organization_id = parseInt(additionalFields.organizationId as string, 10);
						}

						if (additionalFields.includeFields) {
							qs.include_fields = additionalFields.includeFields as string;
						}

						if (additionalFields.personId) {
							qs.person_id = parseInt(additionalFields.personId as string, 10);
						}
						if (additionalFields.status) {
							qs.status = additionalFields.status as string;
						}

						endpoint = '/deals/search';
					}
				}
				if (resource === 'organization') {
					if (operation === 'create') {
						// ----------------------------------
						//         organization:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/organizations';

						body.name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);
						addAdditionalFields(body, additionalFields);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         organization:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const organizationId = this.getNodeParameter('organizationId', i) as number;
						endpoint = `/organizations/${organizationId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         organization:get
						// ----------------------------------

						requestMethod = 'GET';

						const organizationId = this.getNodeParameter('organizationId', i) as number;
						endpoint = `/organizations/${organizationId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         organization:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						const filters = this.getNodeParameter('filters', i);

						if (filters.filterId) {
							qs.filter_id = filters.filterId as string;
						}

						if (filters.firstChar) {
							qs.first_char = filters.firstChar as string;
							qs.first_char = qs.first_char.substring(0, 1);
						}

						endpoint = '/organizations';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         organization:update
						// ----------------------------------

						const id = this.getNodeParameter('organizationId', i) as string;

						requestMethod = 'PUT';
						endpoint = `/organizations/${id}`;

						const updateFields = this.getNodeParameter('updateFields', i);
						addAdditionalFields(body, updateFields);

						if (body.label === 'null') {
							body.label = null;
						}
					}
					if (operation === 'search') {
						// ----------------------------------
						//         organization:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.term = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject & {
							fields?: string[];
						};

						if (additionalFields?.fields?.length) {
							qs.fields = additionalFields.fields.join(',');
						}

						if (additionalFields.exactMatch) {
							qs.exact_match = additionalFields.exactMatch as boolean;
						}

						endpoint = '/organizations/search';
					}
				}
				if (resource === 'contact') {
					if (operation === 'create') {
						// ----------------------------------
						//         person:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/persons';

						body.name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i);
						addAdditionalFields(body, additionalFields);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         person:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const personId = this.getNodeParameter('personId', i) as number;
						endpoint = `/persons/${personId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         person:get
						// ----------------------------------

						requestMethod = 'GET';

						const personId = this.getNodeParameter('personId', i) as number;
						endpoint = `/persons/${personId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         person:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						const additionalFields = this.getNodeParameter('additionalFields', i);

						if (additionalFields.filterId) {
							qs.filter_id = additionalFields.filterId as string;
						}

						if (additionalFields.firstChar) {
							qs.first_char = additionalFields.firstChar as string;
						}

						if (additionalFields.sort) {
							qs.sort = additionalFields.sort as string;
						}

						endpoint = '/persons';
					}
					if (operation === 'search') {
						// ----------------------------------
						//         persons:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.term = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						const additionalFields = this.getNodeParameter('additionalFields', i);

						if (additionalFields.fields) {
							qs.fields = additionalFields.fields as string;
						}

						if (additionalFields.exactMatch) {
							qs.exact_match = additionalFields.exactMatch as boolean;
						}

						if (additionalFields.organizationId) {
							qs.organization_id = parseInt(additionalFields.organizationId as string, 10);
						}

						if (additionalFields.includeFields) {
							qs.include_fields = additionalFields.includeFields as string;
						}

						endpoint = '/persons/search';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         person:update
						// ----------------------------------

						requestMethod = 'PUT';

						const personId = this.getNodeParameter('personId', i) as number;
						endpoint = `/persons/${personId}`;

						const updateFields = this.getNodeParameter('updateFields', i);
						addAdditionalFields(body, updateFields);

						if (body.label === 'null') {
							body.label = null;
						}
					}
				}

				let responseData;
				if (returnAll) {
					responseData = await magnetCustomerApiRequestAllItems.call(
						this,
						requestMethod,
						endpoint,
						body,
						qs,
					);
				} else {
					if (customFieldList !== undefined) magnetCustomerEncodeCustomProperties(customFieldList, body);

					responseData = await magnetCustomerApiRequest.call(
						this,
						requestMethod,
						endpoint,
						body,
						qs,
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{itemData: {item: i}},
				);
				returnData.push(...executionData);

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({json: {error: error.message}, pairedItem: {item: i}});
					continue;
				}
				throw error;
			}
		}

		if (customFieldList !== undefined) {
			for (const item of returnData) {
				magnetCustomerResolveCustomFields(customFieldList, item);
			}
		}

		return [returnData];
	}
}
