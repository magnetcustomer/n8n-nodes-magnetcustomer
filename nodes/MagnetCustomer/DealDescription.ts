import type {INodeProperties} from 'n8n-workflow';

export const dealOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['deal'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a deal',
				action: 'Create a deal',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a deal',
				action: 'Delete a deal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a deal',
				action: 'Get a deal',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many deals',
				action: 'Get many deals',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search deals',
				action: 'Search a deal',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a deal',
				action: 'Update a deal',
			},
		],
		default: 'create',
	},
];

export const dealFields: INodeProperties[] = [
	//         deal:delete
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['deal'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the deal to delete',
	},

	//         deal:get
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['deal'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the deal to get',
	},

	//         deal:update
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['deal'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the deal to update',
	},

	//         deal:fields
	{
		displayName: 'Source',
		name: 'source',
		type: 'hidden',
		default: 'n8n',
		required: true,
		description: 'The source of the contact',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
		description: 'The title of the deal to create',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'The description of the deal to create',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
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
		],
		default: 'organization',
		description: 'Type of entity to link to this deal',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		default: '',
		description: 'ID of the organization this deal will be associated with',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
				associateWith: ['organization'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contact',
		type: 'string',
		default: '',
		description: 'ID of the contact this deal will be associated with',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
				associateWith: ['contact'],
			},
		},
	},


	{
		displayName: 'Pipeline Name or ID',
		name: 'pipeline',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelineIds',
		},
		default: '',
		description: 'ID of the pipeline this deal will be placed. If omitted, the deal will be placed in the first stage of the default pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'Stage Name or ID',
		name: 'stage',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStageIds',
		},
		default: '',
		description: 'ID of the stage this deal will be placed in a pipeline. If omitted, the deal will be placed in the first stage of the default pipeline. (PIPELINE > STAGE). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'Expectation of Closing',
		name: 'expectedCloseDate',
		type: 'dateTime',
		default: 0,
		description: 'Enter the expectation of closing the deal',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Open',
				value: 'open',
			},
			{
				name: 'Won',
				value: 'won',
			},
			{
				name: 'Lost',
				value: 'lost',
			},
			{
				name: 'Deleted',
				value: 'deleted',
			},
		],
		default: 'open',
		description: 'The status of the deal. If not provided it will automatically be set to "open".',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'User Name or ID',
		name: 'staff',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStaffIds',
		},
		default: '',
		description: 'ID of the active user whom the activity will be assigned to. If omitted, the activity will be assigned to the authorized user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		default: 0,
		description: 'Value of the deal. If not set it will automatically be set to 0.',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
	},

	{
		displayName: 'Custom Fields',
		name: 'customFieldCollection',
		placeholder: 'Add Custom Field',
		description: 'Adds a custom field to set also values which have not been predefined',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['deal'],
			},
		},
		default: {},
		options: [
			{
				name: 'customFields',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: '_id',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDealCustomFields',
						},
						default: '',
						description:
							'Name of the field to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value',
						name: 'v',
						type: 'string',
						default: '',
						description: 'Value of the field to set',
					},
				],
			},
		],
	},

	//         deal:search
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['deal'],
			},
		},
		default: '',
		description:
			'The search to look for. Minimum 3 characters.',
	},
];
