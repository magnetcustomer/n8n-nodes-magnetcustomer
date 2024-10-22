import type { INodeProperties } from 'n8n-workflow';

export const leadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a lead',
				action: 'Create a lead',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a lead',
				action: 'Delete a lead',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a lead',
				action: 'Get a lead',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many leads',
				action: 'Get many leads',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search leads',
				action: 'Search a lead',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a lead',
				action: 'Update a lead',
			},
		],
		default: 'create',
	},
];

export const leadFields: INodeProperties[] = [
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
				resource: ['lead'],
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
							loadOptionsMethod: 'getLeadCustomFields',
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


	//         lead:create


	//         lead:delete
	{
		displayName: 'Contact ID',
		name: 'lead',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['lead'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the lead to delete',
	},

	//         lead:get
	{
		displayName: 'Contact ID',
		name: 'lead',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['lead'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the lead to get',
	},

	//         lead:update
	{
		displayName: 'Contact ID',
		name: 'lead',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['lead'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the lead to update',
	},

	//         lead:search
	{
		displayName: 'Term',
		name: 'term',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['lead'],
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
				resource: ['lead'],
			},
		},
		default: false,
		description:
			'Whether only full exact matches against the given term are returned. It is not case sensitive.',
	},

];
