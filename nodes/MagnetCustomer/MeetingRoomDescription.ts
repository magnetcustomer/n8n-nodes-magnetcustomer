import type { INodeProperties } from 'n8n-workflow';

export const meetingRoomOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['meetingRoom'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a meeting room', action: 'Create a meeting room' },
			{ name: 'Delete', value: 'delete', description: 'Delete a meeting room', action: 'Delete a meeting room' },
			{ name: 'Get', value: 'get', description: 'Get a meeting room', action: 'Get a meeting room' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many meeting rooms', action: 'Get many meeting rooms' },
			{ name: 'Search', value: 'search', description: 'Search meeting rooms', action: 'Search meeting rooms' },
			{ name: 'Update', value: 'update', description: 'Update a meeting room', action: 'Update a meeting room' },
		],
		default: 'create',
	},
];

export const meetingRoomFields: INodeProperties[] = [
	{ displayName: 'Room ID', name: 'meetingRoomId', type: 'string', displayOptions: { show: { operation: ['get', 'delete', 'update'], resource: ['meetingRoom'] } }, default: '', required: true },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['getAll'], resource: ['meetingRoom'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['getAll'], resource: ['meetingRoom'] } }, default: 15, description: 'Max number of results to return' },

	// create/update fields
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { operation: ['create'], resource: ['meetingRoom'] } }, default: '', required: true },
	{ displayName: 'Name', name: 'name', type: 'string', displayOptions: { show: { operation: ['update'], resource: ['meetingRoom'] } }, default: '' },

	// search
	{ displayName: 'Search', name: 'search', type: 'string', displayOptions: { show: { operation: ['search'], resource: ['meetingRoom'] } }, default: '' },
	{ displayName: 'Page', name: 'page', type: 'number', displayOptions: { show: { operation: ['search'], resource: ['meetingRoom'] } }, default: 1 },
	{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 15 }, displayOptions: { show: { operation: ['search'], resource: ['meetingRoom'] } }, default: 15, description: 'Max number of results to return' },
];


