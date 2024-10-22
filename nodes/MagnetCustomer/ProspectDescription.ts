import type { INodeProperties } from 'n8n-workflow';

export const prospectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['prospect'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a prospect',
				action: 'Create a prospect',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a prospect',
				action: 'Delete a prospect',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a prospect',
				action: 'Get a prospect',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many prospects',
				action: 'Get many prospects',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search prospects',
				action: 'Search a prospect',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a prospect',
				action: 'Update a prospect',
			},
		],
		default: 'create',
	},
];

export const prospectFields: INodeProperties[] = [
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		placeholder: 'Add Custom Field',
		description: 'Adds a custom field to set also values which have not been predefined',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['prospect'],
			},
		},
		default: {},
		options: [
			{
				name: 'customField',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Property Name or ID',
						name: 'name',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getProspectCustomFields',
						},
						default: '',
						description:
							'Name of the property to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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


	//         prospect:create


	//         prospect:delete
	{
		displayName: 'Contact ID',
		name: 'prospect',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['prospect'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the prospect to delete',
	},

	//         prospect:get
	{
		displayName: 'Contact ID',
		name: 'prospect',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['prospect'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the prospect to get',
	},

	//         prospect:update
	{
		displayName: 'Contact ID',
		name: 'prospect',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['prospect'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the prospect to update',
	},

	//         prospect:search
	{
		displayName: 'Term',
		name: 'term',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['prospect'],
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
				resource: ['prospect'],
			},
		},
		default: false,
		description:
			'Whether only full exact matches against the given term are returned. It is not case sensitive.',
	},

];
