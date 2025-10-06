import type {INodeProperties} from 'n8n-workflow';

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
	//         lead:delete
	{
		displayName: 'Contact ID',
		name: 'leadId',
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
		name: 'leadId',
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

	//         lead:getAll
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['lead'],
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
				resource: ['lead'],
			},
		},
		default: 0,
		description: 'Max number of results to return',
	},

	//         lead:update
	{
		displayName: 'Contact ID',
		name: 'leadId',
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

	//         lead:fields
	{
		displayName: 'Life Cycle',
		name: 'lifeCycle',
		type: 'hidden',
		default: 'lead',
		required: true,
		description: 'The life cycle of the contact',
	},
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
		displayName: 'Gender',
		name: 'gender',
		type: 'options',
		default: '',
		options: [
			{
				name: 'Male',
				value: 'M',
			},
			{
				name: 'Woman',
				value: 'F',
			},
		],
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The gender of the contact',
	},
	{
		displayName: 'Birthdate',
		name: 'birthDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The birthdate of the contact',
	},
	{
		displayName: 'Work',
		name: 'work',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The work of the contact',
	},
	{
		displayName: 'Marital Status',
		name: 'maritalStatus',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The marital status of the contact',
	},
	{
		displayName: 'Document (CPF/CNPJ)',
		name: 'doc',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The document of the contact',
	},
	{
		displayName: 'Legal Type',
		name: 'type',
		type: 'options',
		default: '',
		options: [
			{
				name: 'Physical',
				value: 'physical',
			},
			{
				name: 'Legal',
				value: 'legal',
			},
		],
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
			},
		},
		description: 'The legal type of the contact',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
			},
		},
		default: {},
		options: [
			{
				name: 'customFields',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Property Name or ID',
						name: '_id',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getLeadCustomFields',
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


	//         lead:search
	{
		displayName: 'Search',
		name: 'search',
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
			'The search to look for. Minimum 3 characters.',
	},

	//         lead:search pagination
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['lead'],
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
				resource: ['lead'],
			},
		},
		default: 0,
		description: 'Max number of results to return',
	},

];
