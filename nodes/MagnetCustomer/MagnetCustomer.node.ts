import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {NodeConnectionType} from "n8n-workflow";
import {
	magnetCustomerApiRequest,
	sortOptionParameters,
} from './GenericFunctions';

import {customerFields, customerOperations} from './CustomerDescription';
import {leadFields, leadOperations} from './LeadDescription';
import {prospectFields, prospectOperations} from './ProspectDescription';
import {dealFields, dealOperations} from './DealDescription';
import {dealRequest} from './DealRequest';
import {organizationFields, organizationOperations} from './OrganizationDescription';
import {organizationRequest} from "./OrganizationRequest";
import {customerRequest} from "./CustomerRequest";
import {prospectRequest} from "./ProspectRequest";
import {leadRequest} from "./LeadRequest";


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
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', 0);
				const operation = this.getNodeParameter('operation', 0);
				let responseData;

				switch (resource) {
					case 'deal':
						responseData = await dealRequest.call(this, operation, i);
						break;
					case 'organization':
						responseData = await organizationRequest.call(this, operation, i);
						break;
					case 'customer':
						responseData = await customerRequest.call(this, operation, i);
						break;
					case 'prospect':
						responseData = await prospectRequest.call(this, operation, i);
						break;
					case 'lead':
						responseData = await leadRequest.call(this, operation, i);
						break;
					default:
						break;
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

		return [returnData];
	}
}
