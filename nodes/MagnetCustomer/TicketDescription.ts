import type {INodeProperties} from 'n8n-workflow';

export const ticketOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ticket'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', description: 'Create a ticket', action: 'Create a ticket' },
			{ name: 'Delete', value: 'delete', description: 'Delete a ticket', action: 'Delete a ticket' },
			{ name: 'Get', value: 'get', description: 'Get a ticket', action: 'Get a ticket' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many tickets', action: 'Get many tickets' },
			{ name: 'Search', value: 'search', description: 'Search tickets', action: 'Search tickets' },
			{ name: 'Update', value: 'update', description: 'Update a ticket', action: 'Update a ticket' },
		],
		default: 'create',
	},
];

export const ticketFields: INodeProperties[] = [
	{ displayName: 'Ticket ID', name: 'ticketId', type: 'string', displayOptions: { show: { operation: ['get', 'delete', 'update'], resource: ['ticket'] } }, default: '', required: true },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['getAll'], resource: ['ticket'] } }, default: 0 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['getAll'], resource: ['ticket'] } }, default: 15, description: 'Max number of results to return' },

	// create/update fields
	{ displayName: 'Subject', name: 'subject', type: 'string', displayOptions: { show: { operation: ['create'], resource: ['ticket'] } }, default: '', required: true },
	{ displayName: 'Subject', name: 'subject', type: 'string', displayOptions: { show: { operation: ['update'], resource: ['ticket'] } }, default: '' },
	{ displayName: 'Description', name: 'description', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['ticket'] } }, default: '' },
	{ displayName: 'Priority', name: 'priority', type: 'options', options: [ { name: 'Low', value: 'low' }, { name: 'Medium', value: 'medium' }, { name: 'High', value: 'high' } ], displayOptions: { show: { operation: ['create', 'update'], resource: ['ticket'] } }, default: 'medium' },
	{ displayName: 'Workspace Receiver ID', name: 'workspaceReceiver', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['ticket'] } }, default: '' },
	{ displayName: 'Contact ID', name: 'contact', type: 'string', displayOptions: { show: { operation: ['create', 'update'], resource: ['ticket'] } }, default: '' },

	// search
	{ displayName: 'Search', name: 'search', type: 'string', displayOptions: { show: { operation: ['search'], resource: ['ticket'] } }, default: '' },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['search'], resource: ['ticket'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['search'], resource: ['ticket'] } }, default: 15, description: 'Max number of results to return' },
];


