import type { INodeProperties } from 'n8n-workflow';

export const organizationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['organization'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a organization',
				action: 'Create a organization',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a organization',
				action: 'Delete a organization',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a organization',
				action: 'Get a organization',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many organizations',
				action: 'Get many organizations',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search organizations',
				action: 'Search a organization',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a organization',
				action: 'Update a organization',
			},
		],
		default: 'create',
	},
];

export const organizationFields: INodeProperties[] = [
	//         organization:create
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['organization'],
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
									loadOptionsMethod: 'getOrganizationCustomFields',
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
		],
	},

	//         organization:delete
	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['organization'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the organization to delete',
	},

	//         organization:get
	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['organization'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the organization to get',
	},

	//         organization:update
	{
		displayName: 'Organization ID',
		name: 'organization',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['organization'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the organization to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['organization'],
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
									loadOptionsMethod: 'getOrganizationCustomFields',
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
		],
	},

	//         organization:search
	{
		displayName: 'Term',
		name: 'term',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['organization'],
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
				resource: ['organization'],
			},
		},
		default: false,
		description:
			'Whether only full exact matches against the given term are returned. It is not case sensitive.',
	},
];
