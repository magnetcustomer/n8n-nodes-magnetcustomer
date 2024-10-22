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
	//         organization:delete
	{
		displayName: 'Organization ID',
		name: 'organizationId',
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
		name: 'organizationId',
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
		name: 'organizationId',
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

	//         organization:fields
	{
		displayName: 'Source',
		name: 'source',
		type: 'hidden',
		default: 'n8n',
		required: true,
		description: 'The source of the contact',
	},
	{
		displayName: 'Fullname',
		name: 'fullname',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The fullname of the contact',
	},
	{
		displayName: 'E-Mail',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The e-mail of the contact',
	},
	{
		displayName: 'Phones',
		name: 'phoneCollection',
		placeholder: 'Add Phone',
		description: 'Adds a phone to set also values which have not been predefined',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		default: {},
		options: [
			{
				name: 'phones',
				displayName: 'Phone',
				values: [
					{
						displayName: 'Number',
						name: 'number',
						type: 'string',
						default: '',
						description: 'Value of the phone to set',
					},
				],
			},
		],
	},
	{
		displayName: 'Birthdate',
		name: 'birthDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The birthdate of the contact',
	},
	{
		displayName: 'Document (CPF/CNPJ)',
		name: 'doc',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The document of the contact',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The state of the contact',
	},
	{
		displayName: 'City',
		name: 'city',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The city of the contact',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The address of the contact',
	},
	{
		displayName: 'Address Number',
		name: 'addressNumber',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The address number of the contact',
	},
	{
		displayName: 'Complement Address',
		name: 'complement',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The complement address of the contact',
	},
	{
		displayName: 'Neighborhood',
		name: 'neighborhood',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The neighborhood of the contact',
	},
	{
		displayName: 'CEP',
		name: 'cep',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The cep of the contact',
	},
	{
		displayName: 'Owners',
		name: 'owners',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['organization'],
			},
		},
		description: 'The owners of the contact',
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
				resource: ['organization'],
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
						name: 'customField',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getOrganizationCustomFields',
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

	//         organization:search
	{
		displayName: 'Search',
		name: 'search',
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
			'The search to look for. Minimum 3 characters.',
	},
];
