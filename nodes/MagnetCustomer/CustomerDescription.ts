import type { INodeProperties } from 'n8n-workflow';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a customer',
				action: 'Create a customer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a customer',
				action: 'Delete a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a customer',
				action: 'Get a customer',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many customers',
				action: 'Get many customers',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search customers',
				action: 'Search a customer',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a customer',
				action: 'Update a customer',
			},
		],
		default: 'create',
	},
];

export const customerFields: INodeProperties[] = [
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
				resource: ['customer'],
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
							loadOptionsMethod: 'getCustomerCustomFields',
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


	//         customer:create


	//         customer:delete
	{
		displayName: 'Contact ID',
		name: 'customer',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['customer'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the customer to delete',
	},

	//         customer:get
	{
		displayName: 'Contact ID',
		name: 'customer',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['customer'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the customer to get',
	},

	//         customer:update
	{
		displayName: 'Contact ID',
		name: 'customer',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['customer'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the customer to update',
	},

	//         customer:search
	{
		displayName: 'Term',
		name: 'term',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['customer'],
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
				resource: ['customer'],
			},
		},
		default: false,
		description:
			'Whether only full exact matches against the given term are returned. It is not case sensitive.',
	},

];
