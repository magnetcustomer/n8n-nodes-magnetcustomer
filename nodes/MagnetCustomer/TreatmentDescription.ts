import type {INodeProperties} from 'n8n-workflow';

export const treatmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['treatment'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a treatment', action: 'Create a treatment' },
			{ name: 'Delete', value: 'delete', description: 'Delete a treatment', action: 'Delete a treatment' },
			{ name: 'Get', value: 'get', description: 'Get a treatment', action: 'Get a treatment' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many treatments', action: 'Get many treatments' },
			{ name: 'Search', value: 'search', description: 'Search treatments', action: 'Search treatments' },
			{ name: 'Update', value: 'update', description: 'Update a treatment', action: 'Update a treatment' },
		],
		default: 'create',
	},
];

export const treatmentFields: INodeProperties[] = [
	{ displayName: 'Treatment ID', name: 'treatmentId', type: 'string', displayOptions: { show: { operation: ['get', 'delete', 'update'], resource: ['treatment'] } }, default: '', required: true },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['getAll'], resource: ['treatment'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['getAll'], resource: ['treatment'] } }, default: 15, description: 'Max number of results to return' },

	// create/update fields (simplified to match Postman minimal example)
	{ displayName: 'Type ID', name: 'type', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['treatment'] } }, default: '' },
	{ displayName: 'Contact ID', name: 'contact', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['treatment'] } }, default: '' },
	{ displayName: 'Subject', name: 'subject', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['treatment'] } }, default: '' },
	{ displayName: 'Name Type', name: 'nameType', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['treatment'] } }, default: '' },

	// search
	{ displayName: 'Search', name: 'search', type: 'string', displayOptions: { show: { operation: ['search'], resource: ['treatment'] } }, default: '' },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['search'], resource: ['treatment'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['search'], resource: ['treatment'] } }, default: 15, description: 'Max number of results to return' },
];


