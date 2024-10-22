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
import {LoggerProxy as Logger, NodeConnectionType} from 'n8n-workflow';

import {
	magnetCustomerApiRequest,
	magnetCustomerApiRequestAllItems,
	sortOptionParameters,
} from './GenericFunctions';

import {customerFields, customerOperations} from './CustomerDescription';
import {leadFields, leadOperations} from './LeadDescription';
import {prospectFields, prospectOperations} from './ProspectDescription';
import {dealFields, dealOperations} from './DealDescription';
import {organizationFields, organizationOperations} from './OrganizationDescription';

/**
 * Add the additional fields to the body
 *
 * @param {IDataObject} body The body object to add fields to
 * @param customFieldCollection
 */
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

export class MagnetCustomer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Magnet Customer',
		name: 'magnetCustomer',
		icon: 'file:magnetcustomer.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Magnet Customer API',
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
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Organization',
						value: 'organization',
					},
					{
						name: 'Prospect',
						value: 'prospect',
					},
				],
				default: 'deal',
			},

			...customerOperations,
			...customerFields,

			...leadOperations,
			...leadFields,

			...prospectOperations,
			...prospectFields,

			...dealOperations,
			...dealFields,

			...organizationOperations,
			...organizationFields,

			// ----------------------------------
			//         deal / organization / contact
			// ----------------------------------
			{
				displayName: 'Resolve Custom Fields',
				name: 'resolveCustomFields',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['customer', 'deal', 'organization', 'prospect', 'lead'],
						operation: ['get', 'getAll'],
					},
				},
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description:
					'By default do custom fields get returned only as ID instead of their actual name. Also option fields contain only the ID instead of their actual value. If this option gets set they get automatically resolved.',
			},
			{
				displayName: 'Encode Custom Fields',
				name: 'encodeCustomFields',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['customer', 'deal', 'organization', 'prospect', 'lead'],
						operation: ['update'],
					},
				},
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description:
					'By default do custom fields have to be set as ID instead of their actual name. Also option fields have to be set as ID instead of their actual value. If this option gets set they get automatically encoded.',
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
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/staffs', {});
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
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/pipelines', {});
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
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/stages', {});
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
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true,
					"feature": 'organization',
					"subFieldSettings.active": false,
					"system": false,
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
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true,
					"feature": 'deal',
					"subFieldSettings.active": false,
					"system": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},

			// Get all the Customer Custom Fields to display them to user so that they can
			// select them easily
			async getCustomerCustomFields(this: ILoadOptionsFunctions,): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true,
					"creatableWhen": 'contact',
					"feature": 'contact',
					"subFieldSettings.active": false,
					"system": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},

			// Get all the Prospect Custom Fields to display them to user so that they can
			// select them easily
			async getProspectCustomFields(this: ILoadOptionsFunctions,): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true,
					"creatableWhen": 'prospect',
					"feature": 'contact',
					"subFieldSettings.active": false,
					"system": false,
				});
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: `customField_${field._id}`,
					});
				}

				return sortOptionParameters(returnData);
			},

			// Get all the Lead Custom Fields to display them to user so that they can
			// select them easily
			async getLeadCustomFields(this: ILoadOptionsFunctions,): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true,
					"creatableWhen": 'lead',
					"feature": 'contact',
					"subFieldSettings.active": false,
					"system": false,
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

						const associateWith = this.getNodeParameter('associateWith', i) as | 'organization' | 'contact';

						if (associateWith === 'organization') {
							body.organization = this.getNodeParameter('organization', i) as string;
						} else {
							body.contact = this.getNodeParameter('contact', i) as string;
						}

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
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
						endpoint = '/deals';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         deal:update
						// ----------------------------------

						requestMethod = 'PUT';

						const dealId = this.getNodeParameter('dealId', i) as number;
						endpoint = `/deals/${dealId}`;

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);

						if (body.label === 'null') {
							body.label = null;
						}
					}
					if (operation === 'search') {
						// ----------------------------------
						//         deal:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.search = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}
						endpoint = '/deals';
					}
				}

				if (resource === 'organization') {
					if (operation === 'create') {
						// ----------------------------------
						//         organization:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/organizations';

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
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

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);

						if (body.label === 'null') {
							body.label = null;
						}
					}
					if (operation === 'search') {
						// ----------------------------------
						//         organization:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.search = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						endpoint = '/organizations';
					}
				}

				if (resource === 'customer') {
					if (operation === 'create') {
						// ----------------------------------
						//         contact:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/contacts';

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         contact:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const contactId = this.getNodeParameter('contactId', i) as number;
						endpoint = `/contacts/${contactId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         contact:get
						// ----------------------------------

						requestMethod = 'GET';

						const contactId = this.getNodeParameter('contactId', i) as number;
						endpoint = `/contacts/${contactId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         contact:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						endpoint = '/contacts';
					}
					if (operation === 'search') {
						// ----------------------------------
						//         contacts:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.search = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}


						endpoint = '/contacts';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         contact:update
						// ----------------------------------

						requestMethod = 'PUT';

						const contactId = this.getNodeParameter('contactId', i) as number;
						endpoint = `/contacts/${contactId}`;

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
				}

				if (resource === 'prospect') {
					if (operation === 'create') {
						// ----------------------------------
						//         contact:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/prospects';

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         prospect:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const prospectId = this.getNodeParameter('prospectId', i) as number;
						endpoint = `/prospects/${prospectId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         prospect:get
						// ----------------------------------

						requestMethod = 'GET';

						const prospectId = this.getNodeParameter('prospectId', i) as number;
						endpoint = `/prospects/${prospectId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         prospect:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						endpoint = '/prospects';
					}
					if (operation === 'search') {
						// ----------------------------------
						//         prospects:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.search = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}


						endpoint = '/prospects';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         prospect:update
						// ----------------------------------

						requestMethod = 'PUT';

						const prospectId = this.getNodeParameter('prospectId', i) as number;
						endpoint = `/prospects/${prospectId}`;

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
				}

				if (resource === 'lead') {
					if (operation === 'create') {
						// ----------------------------------
						//         contact:create
						// ----------------------------------

						requestMethod = 'POST';
						endpoint = '/leads';

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         lead:delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const leadId = this.getNodeParameter('leadId', i) as number;
						endpoint = `/leads/${leadId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         lead:get
						// ----------------------------------

						requestMethod = 'GET';

						const leadId = this.getNodeParameter('leadId', i) as number;
						endpoint = `/leads/${leadId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         lead:getAll
						// ----------------------------------

						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}

						endpoint = '/leads';
					}
					if (operation === 'search') {
						// ----------------------------------
						//         leads:search
						// ----------------------------------

						requestMethod = 'GET';

						qs.search = this.getNodeParameter('term', i) as string;
						returnAll = this.getNodeParameter('returnAll', i);
						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i);
						}


						endpoint = '/leads';
					}
					if (operation === 'update') {
						// ----------------------------------
						//         lead:update
						// ----------------------------------

						requestMethod = 'PUT';

						const leadId = this.getNodeParameter('leadId', i) as number;
						endpoint = `/leads/${leadId}`;

						const customFieldCollection = this.getNodeParameter('customFieldCollection', i);
						body.customFields = addAdditionalFields(customFieldCollection);
					}
				}

				Logger.debug(`requestMethod:: ${requestMethod}`);
				Logger.debug(`endpoint:: ${endpoint}`);
				Logger.debug(`body:: ${body}`);
				Logger.debug(`qs:: ${qs}`);

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
					// if (customFieldList !== undefined) magnetCustomerEncodeCustomProperties(customFieldList, body);

					responseData = await magnetCustomerApiRequest.call(
						this,
						requestMethod,
						endpoint,
						body,
						qs,
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData as IDataObject), {itemData: {item: i}},);
				returnData.push(...executionData);

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({json: {error: error.message}, pairedItem: {item: i}});
					continue;
				}
				throw error;
			}
		}

		// if (customFieldList !== undefined) {
		// 	for (const item of returnData) {
		// 		magnetCustomerResolveCustomFields(customFieldList, item);
		// 	}
		// }

		return [returnData];
	}
}
