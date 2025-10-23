import type { INodeProperties } from 'n8n-workflow';

export const treatmentTypeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['treatmentType'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a treatment type', action: 'Create a treatment type' },
			{ name: 'Delete', value: 'delete', description: 'Delete a treatment type', action: 'Delete a treatment type' },
			{ name: 'Get', value: 'get', description: 'Get a treatment type', action: 'Get a treatment type' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many treatment types', action: 'Get many treatment types' },
			{ name: 'Search', value: 'search', description: 'Search treatment types', action: 'Search treatment types' },
			{ name: 'Update', value: 'update', description: 'Update a treatment type', action: 'Update a treatment type' },
		],
		default: 'create',
	},
];

export const treatmentTypeFields: INodeProperties[] = [
	{ displayName: 'Type ID', name: 'treatmentTypeId', type: 'string', displayOptions: { show: { operation: ['get', 'delete', 'update'], resource: ['treatmentType'] } }, default: '', required: true },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['getAll'], resource: ['treatmentType'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['getAll'], resource: ['treatmentType'] } }, default: 15, description: 'Max number of results to return' },

	// create/update fields
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { operation: ['create'], resource: ['treatmentType'] } }, default: '', required: true },
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { operation: ['update'], resource: ['treatmentType'] } }, default: '' },

	// search
	{ displayName: 'Search', name: 'search', type: 'string', displayOptions: { show: { operation: ['search'], resource: ['treatmentType'] } }, default: '' },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['search'], resource: ['treatmentType'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['search'], resource: ['treatmentType'] } }, default: 15, description: 'Max number of results to return' },
];


