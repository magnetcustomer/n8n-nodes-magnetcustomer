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
	magnetCustomerApiRequestAllItems,
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
import {taskFields, taskOperations} from "./TaskDescription";
import {taskRequest} from "./TaskRequest";
import { staffFields, staffOperations } from './StaffDescription';
import { staffRequest } from './StaffRequest';
import { workspaceFields, workspaceOperations } from './WorkspaceDescription';
import { workspaceRequest } from './WorkspaceRequest';
import { customFieldFields, customFieldOperations } from './CustomFieldDescription';
import { customFieldRequest } from './CustomFieldRequest';
import { customFieldBlockFields, customFieldBlockOperations } from './CustomFieldBlockDescription';
import { customFieldBlockRequest } from './CustomFieldBlockRequest';
import { customFieldTypeFields, customFieldTypeOperations } from './CustomFieldTypeDescription';
import { customFieldTypeRequest } from './CustomFieldTypeRequest';
import { pipelineFields, pipelineOperations } from './PipelineDescription';
import { pipelineRequest } from './PipelineRequest';
import { meetingFields, meetingOperations } from './MeetingDescription';
import { meetingRequest } from './MeetingRequest';
import { ticketFields, ticketOperations } from './TicketDescription';
import { ticketRequest } from './TicketRequest';
import { treatmentFields, treatmentOperations } from './TreatmentDescription';
import { treatmentRequest } from './TreatmentRequest';


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
						name: 'Custom Field',
						value: 'customField',
					},
					{
						name: 'Custom Field Block',
						value: 'customFieldBlock',
					},
					{
						name: 'Custom Field Type',
						value: 'customFieldType',
					},
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
						name: 'Pipeline',
						value: 'pipeline',
					},
					{
						name: 'Prospect',
						value: 'prospect',
					},
					{
						name: 'Staff',
						value: 'staff',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Workspace',
						value: 'workspace',
					},
					{
						name: 'Meeting',
						value: 'meeting',
					},
					{
						name: 'Ticket',
						value: 'ticket',
					},
					{
						name: 'Treatment',
						value: 'treatment',
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

			...organizationOperations,
			...organizationFields,

			...dealOperations,
			...dealFields,

			...taskOperations,
			...taskFields,

			...staffOperations,
			...staffFields,

			...workspaceOperations,
			...workspaceFields,

			...customFieldOperations,
			...customFieldFields,

			...customFieldBlockOperations,
			...customFieldBlockFields,

			...customFieldTypeOperations,
			...customFieldTypeFields,

			...pipelineOperations,
			...pipelineFields,

			...meetingOperations,
			...meetingFields,

			...ticketOperations,
			...ticketFields,

			...treatmentOperations,
			...treatmentFields,

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

			// Get all Task Types to display them to user so that they can
			// select them easily
			async getTaskTypeIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/tasks/types', {});
				for (const type of data) {
					if (type.active === true) {
						returnData.push({
							name: type.name,
							value: type._id,
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
				const pipelineId = this.getNodeParameter('pipeline', 0) as string;
				console.log('Attempting to load stages for pipeline:', pipelineId);
				if (!pipelineId) return sortOptionParameters(returnData);

				const data = await magnetCustomerApiRequest.call(this, 'GET', `/pipelines/${pipelineId}/stages`, {});
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

			// Get all the Staff Custom Fields to display them to user so that they can
			// select them easily
			async getStaffCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// Fetch custom fields for the 'staff' feature
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfields', {}, {
					"creatable": true, // Assuming staff fields can be created
					"feature": 'staff',
					"subFieldSettings.active": false,
					"system": false,
				});
				// Assuming response is an array of field objects
				for (const field of data) {
					returnData.push({
						name: field.name,
						value: field._id, // Use only the ID as value
					});
				}

				return sortOptionParameters(returnData);
			},

			// Get all Custom Field Types to display them to user so that they can
			// select them easily
			async getCustomFieldTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// Endpoint from curl: /api/customfieldtypes
				// Assuming it returns an array of objects like { _id: string, name: string, fieldType: string }
				// or similar. We need the 'fieldType' value and a user-friendly name.
				const data = await magnetCustomerApiRequest.call(this, 'GET', '/customfieldtypes', {}, {
					// Add query parameters if needed (like limit to get all?)
				});

				// Adjust parsing based on actual API response structure
				if (Array.isArray(data)) {
					for (const fieldType of data) {
						// Use fieldType.name or a combination for display, and fieldType.fieldType as the value
						if (fieldType?.fieldType && fieldType.name && fieldType._id) {
							returnData.push({
								name: fieldType.name, // Or format as needed: `${fieldType.name} (${fieldType.fieldType})`
								value: fieldType._id, // Use the ID as the value
							});
						}
					}
				}

				return sortOptionParameters(returnData);
			},

			// Get all Roles to display them to user so that they can
			// select them easily
			async getRoles(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// Usar magnetCustomerApiRequestAllItems para buscar todas as roles
				const roles = await magnetCustomerApiRequestAllItems.call(this, 'GET', '/api/roles'); // <-- Usar a função e o endpoint correto

				// A função AllItems já deve retornar o array de itens
				// Assumindo que cada item tem _id e name
				for (const role of roles) {
					if (role?._id && role.name) {
						returnData.push({ name: role.name, value: role._id });
					}
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
					case 'task':
						responseData = await taskRequest.call(this, operation, i);
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
					case 'staff':
						responseData = await staffRequest.call(this, operation, i);
						break;
					case 'workspace':
						responseData = await workspaceRequest.call(this, operation, i);
						break;
					case 'customField':
						responseData = await customFieldRequest.call(this, operation, i);
						break;
					case 'customFieldBlock':
						responseData = await customFieldBlockRequest.call(this, operation, i);
						break;
					case 'customFieldType':
						responseData = await customFieldTypeRequest.call(this, operation, i);
						break;
					case 'pipeline':
						responseData = await pipelineRequest.call(this, operation, i);
						break;
					case 'meeting':
						responseData = await meetingRequest.call(this, operation, i);
						break;
					case 'ticket':
						responseData = await ticketRequest.call(this, operation, i);
						break;
					case 'treatment':
						responseData = await treatmentRequest.call(this, operation, i);
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
