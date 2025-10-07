import type {INodeProperties} from 'n8n-workflow';

export const meetingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['meeting'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a meeting',
				action: 'Create a meeting',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a meeting',
				action: 'Delete a meeting',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a meeting',
				action: 'Get a meeting',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many meetings',
				action: 'Get many meetings',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search meetings',
				action: 'Search meetings',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a meeting',
				action: 'Update a meeting',
			},
		],
		default: 'create',
	},
];

export const meetingFields: INodeProperties[] = [
	// meeting:get/delete/update
	{
		displayName: 'Meeting ID',
		name: 'meetingId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get', 'delete', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the meeting',
	},

	// meeting:getAll
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['meeting'],
			},
		},
		default: 0,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 15,
		},
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['meeting'],
			},
		},
		default: 0,
		description: 'Max number of results to return',
	},

	// meeting:create/update fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
		description: 'Meeting title',
		required: true,
	},
	{
		displayName: 'Start',
		name: 'start',
		type: 'dateTime',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: 0,
		required: true,
	},
	{
		displayName: 'End',
		name: 'end',
		type: 'dateTime',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: 0,
		required: true,
	},
	{
		displayName: 'Calendar ID',
		name: 'calendar',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Workspace ID',
		name: 'workspace',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Staff ID',
		name: 'staff',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Type ID',
		name: 'type',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Room ID',
		name: 'room',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Contact ID',
		name: 'contact',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Branch ID',
		name: 'branch',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: '',
	},
	{
		displayName: 'Participants (IDs)',
		name: 'participants',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Participant ID' },
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['meeting'],
			},
		},
		default: [],
		description: 'List of participant IDs',
	},

	// meeting:search
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['meeting'],
			},
		},
		default: '',
		description: 'Search term (min 3 characters)',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['meeting'],
			},
		},
		default: 0,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 15,
		},
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['meeting'],
			},
		},
		default: 0,
		description: 'Max number of results to return',
	},
];


