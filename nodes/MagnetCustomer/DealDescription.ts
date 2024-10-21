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
	//         deal:create
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['deal'],
			},
		},
		description: 'The title of the deal to create',
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
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		default: '',
		description: 'ID of the organization this deal will be associated with',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
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
				operation: ['create'],
				resource: ['deal'],
				associateWith: ['contact'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['deal'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				placeholder: 'Add Custom Field',
				description: 'Adds a custom field to set also values which have not been predefined',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'customField',
						displayName: 'Custom Field',
						values: [
							{
								displayName: 'Custom Field Name or ID',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getDealCustomFields',
								},
								default: '',
								description: 'Name of the property to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Custom Field Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the custom field to set',
							},
						],
					},
				],
			},

			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the deal to create',
			},

			{
				displayName: 'Pipeline Name or ID',
				name: 'pipeline',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelineIds',
				},
				default: '',
				description:
					'ID of the pipeline this deal will be placed. If omitted, the deal will be placed in the first stage of the default pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			{
				displayName: 'Stage Name or ID',
				name: 'stage',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStageIds',
				},
				default: '',
				description:
					'ID of the stage this deal will be placed in a pipeline. If omitted, the deal will be placed in the first stage of the default pipeline. (PIPELINE > STAGE). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			{
				displayName: 'Expectation of Closing',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: 0,
				description: 'Enter the expectation of closing the deal',
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
				description:
					'The status of the deal. If not provided it will automatically be set to "open".',
			},

			{
				displayName: 'User Name or ID',
				name: 'staff',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStaffIds',
				},
				default: '',
				description:
					'ID of the active user whom the activity will be assigned to. If omitted, the activity will be assigned to the authorized user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'Value of the deal. If not set it will automatically be set to 0.',
			},
		],
	},

	//         deal:delete
	{
		displayName: 'Deal ID',
		name: 'deal',
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
		name: 'deal',
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
		name: 'deal',
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
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['deal'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Custom Properties',
				name: 'customProperties',
				placeholder: 'Add Custom Property',
				description: 'Adds a custom property to set also values which have not been predefined',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Property Name or ID',
								name: 'name',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getDealCustomFields',
								},
								default: '',
								description:
									'Name of the custom field to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Property Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the property to set',
							},
						],
					},
				],
			},
			{
				displayName: 'User Name or ID',
				name: 'staff',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStaffIds',
				},
				default: '',
				description:
					'ID of the active user whom the activity will be assigned to. If omitted, the activity will be assigned to the authorized user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},

			{
				displayName: 'Organization Name or ID',
				name: 'organization',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrganizationIds',
				},
				default: '',
				description:
					'ID of the organization this deal will be associated with. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Contact ID',
				name: 'contact',
				type: 'string',
				default: '',
				description: 'ID of the contact this deal will be associated with',
			},

			{
				displayName: 'Pipeline Name or ID',
				name: 'pipeline',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelineIds',
				},
				default: '',
				description:
					'ID of the pipeline this deal will be placed. If omitted, the deal will be placed in the first stage of the default pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Stage Name or ID',
				name: 'stage',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStageIds',
				},
				default: '',
				description:
					'ID of the stage this deal will be placed in a pipeline. If omitted, the deal will be placed in the first stage of the default pipeline. (PIPELINE > STAGE). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
				description:
					'The status of the deal. If not provided it will automatically be set to "open".',
			},

			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the deal',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the deal',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'Value of the deal. If not set it will automatically be set to 0.',
			},
		],
	},

	//         deal:search
	{
		displayName: 'Term',
		name: 'term',
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
			'The search term to look for. Minimum 2 characters (or 1 if using exact_match).',
	},
	{
		displayName: 'Exact Match',
		name: 'exactMatch',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['deal'],
			},
		},
		default: false,
		description:
			'Whether only full exact matches against the given term are returned. It is not case sensitive.',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['deal'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Stage Name or ID',
				name: 'stage',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStageIds',
				},
				default: '',
				description:
					'ID of the stage to filter deals by. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'All Not Deleted',
						value: 'all_not_deleted',
					},
					{
						name: 'Deleted',
						value: 'deleted',
					},
					{
						name: 'Lost',
						value: 'lost',
					},
					{
						name: 'Open',
						value: 'open',
					},
					{
						name: 'Won',
						value: 'won',
					},
				],
				default: 'all_not_deleted',
				description: 'Status to filter deals by. Defaults to <code>all_not_deleted</code>',
			},
			{
				displayName: 'User Name or ID',
				name: 'staff',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStaffIds',
				},
				default: '',
				description:
					'ID of the user to filter deals by. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['deal'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Organization ID',
				name: 'organization',
				type: 'string',
				default: '',
				description: 'Will filter Deals by the provided Organization ID',
			},
			{
				displayName: 'Contact ID',
				name: 'contact',
				type: 'string',
				default: '',
				description: 'Will filter Deals by the provided Contact ID',
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
				],
				default: 'open',
				description:
					'The status of the deal. If not provided it will automatically be set to "open".',
			},
		],
	},
];
