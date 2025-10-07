import type { INodeProperties } from 'n8n-workflow';

export const meetingTypeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['meetingType'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a meeting type', action: 'Create a meeting type' },
			{ name: 'Delete', value: 'delete', description: 'Delete a meeting type', action: 'Delete a meeting type' },
			{ name: 'Get', value: 'get', description: 'Get a meeting type', action: 'Get a meeting type' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many meeting types', action: 'Get many meeting types' },
			{ name: 'Search', value: 'search', description: 'Search meeting types', action: 'Search meeting types' },
			{ name: 'Update', value: 'update', description: 'Update a meeting type', action: 'Update a meeting type' },
		],
		default: 'create',
	},
];

export const meetingTypeFields: INodeProperties[] = [
	{ displayName: 'Type ID', name: 'meetingTypeId', type: 'string', displayOptions: { show: { operation: ['get', 'delete', 'update'], resource: ['meetingType'] } }, default: '', required: true },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['getAll'], resource: ['meetingType'] } }, default: 0 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['getAll'], resource: ['meetingType'] } }, default: 0, description: 'Max number of results to return' },

	// create/update fields
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['meetingType'] } }, default: '', required: true },

	// search
	{ displayName: 'Search', name: 'search', type: 'string', displayOptions: { show: { operation: ['search'], resource: ['meetingType'] } }, default: '' },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['search'], resource: ['meetingType'] } }, default: 0 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['search'], resource: ['meetingType'] } }, default: 0, description: 'Max number of results to return' },
];


