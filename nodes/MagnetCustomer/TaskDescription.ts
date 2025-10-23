import type {INodeProperties} from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a task',
				action: 'Create a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a task',
				action: 'Delete a task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a task',
				action: 'Get a task',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many tasks',
				action: 'Get many tasks',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search tasks',
				action: 'Search a task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a task',
				action: 'Update a task',
			},
		],
		default: 'create',
	},
];

export const taskFields: INodeProperties[] = [
	//         task:delete
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['task'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the task to delete',
	},

	//         task:get
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['task'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the task to get',
	},

	//         task:getAll
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['task'],
			},
		},
		default: 1,
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
				resource: ['task'],
			},
		},
		default: 15,
		description: 'Max number of results to return',
	},

	//         task:update
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['task'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the task to update',
	},

	//         task:fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
		description: 'The title of the task',
	},
	{
		displayName: 'Description',
		name: 'observation',
		type: 'string',
		default: '',
		description: 'The description of the task to create',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},
	{
		displayName: 'Expectation of Closing',
		name: 'dateOfExpires',
		type: 'dateTime',
		default: 0,
		description: 'Enter the expectation of closing the task',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},
	{
		displayName: 'Task Slug or Name or ID',
		name: 'type',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTaskTypeIds',
		},
		default: '',
		description: 'ID of the active types whom the activity will be assigned to. If omitted, the activity will be assigned to the authorized user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},
	{
		displayName: 'User Name or ID',
		name: 'owner',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStaffIds',
		},
		default: '',
		description: 'ID of the active user whom the activity will be assigned to. If omitted, the activity will be assigned to the authorized user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Pendente',
				value: 'pending',
			},
			{
				name: 'Concluída',
				value: 'finished',
			},
		],
		default: 'pending',
		description: 'The status of the task',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},
	{
		displayName: 'Date Of Finished',
		name: 'dateFinished',
		type: 'dateTime',
		default: 0,
		description: 'Enter the date of finished the task',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
			},
		},
	},

	{
		displayName: 'Associate With',
		name: 'associateWith',
		type: 'options',
		options: [
			{
				name: 'Organization',
				value: 'organization',
			},
			{
				name: 'Contact',
				value: 'contact',
			},
			{
				name: 'Deal',
				value: 'deal',
			},
		],
		default: 'organization',
		description: 'Type of entity to link to this task',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create', 'update'],
			},
		},
	},

	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		default: '',
		description: 'ID of the organization this task will be associated with',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
				associateWith: ['organization'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contact',
		type: 'string',
		default: '',
		description: 'ID of the contact this task will be associated with',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
				associateWith: ['contact'],
			},
		},
	},
	{
		displayName: 'Deal ID',
		name: 'deal',
		type: 'string',
		default: '',
		description: 'ID of the deal this task will be associated with',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['task'],
				associateWith: ['deal'],
			},
		},
	},

	//         task:search
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['task'],
			},
		},
		default: '',
		description:
			'The search to look for. Minimum 3 characters.',
	},

	//         task:search pagination
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['task'],
			},
		},
		default: 1,
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
				resource: ['task'],
			},
		},
		default: 15,
		description: 'Max number of results to return',
	},
];
