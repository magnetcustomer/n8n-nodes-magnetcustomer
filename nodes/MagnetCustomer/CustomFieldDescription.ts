import type { INodeProperties } from 'n8n-workflow';

// API Ref: https://apireference.magnetcustomer.com/#/Custom%20Fields

export const customFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customField'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a custom field',
				action: 'Create a custom field',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a custom field',
				action: 'Delete a custom field',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a custom field',
				action: 'Get a custom field',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many custom fields',
				action: 'Get many custom fields',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search custom fields',
				action: 'Search custom fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a custom field',
				action: 'Update a custom field',
			},
		],
		default: 'getAll',
	},
];

export const customFieldFields: INodeProperties[] = [
	// --- ID for Get/Delete/Update ---
	{
		displayName: 'Custom Field ID',
		name: 'customFieldId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get', 'update', 'delete'],
				resource: ['customField'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the custom field',
	},

	// --- Filters for Get Many ---
	{
		displayName: 'Search Term',
		name: 'search',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customField'],
			},
		},
		default: '',
		description: 'Optional search term to filter results',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customField'],
			},
		},
		options: [
			{
				displayName: 'Feature',
				name: 'feature',
				type: 'options',
				options: [
					// TODO: Obter lista de features da API?
					{ name: 'Contact', value: 'contact' },
					{ name: 'Deal', value: 'deal' },
					{ name: 'Organization', value: 'organization' },
					{ name: 'Staff', value: 'staff' },
					// Adicionar outras features se necessário
				],
				default: 'contact',
				description: 'Filter by feature type',
			},
			{
				displayName: 'Creatable When',
				name: 'creatableWhen',
				type: 'options',
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Prospect', value: 'prospect' },
				],
				default: '', // Optional
				description: 'Filter by contact lifecycle stage (contact, lead, prospect)',
			},
			{
				displayName: 'Emails Empty',
				name: 'emailsEmpty',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Phones Empty',
				name: 'phonesEmpty',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Interactions Empty',
				name: 'interactionsEmpty',
				type: 'boolean',
				default: false,
			},
			// Adicionar outros filtros da API (e.g., system, subFieldSettings.active)
		],
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customField'],
			},
		},
		default: 0,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customField'],
			},
		},
		default: 0,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'collection',
		placeholder: 'Sort Options',
		default: {},
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customField'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'string',
				default: 'email', // From curl
				description: 'Field to sort by (e.g., email, name, createdAt)',
			},
			{
				displayName: 'Sort Type',
				name: 'sortType',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc', // From curl
				description: 'Sort direction',
			},
		],
	},

	// --- Fields for Create / Update ---
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		default: '',
		description: 'Name of the custom field',
	},
	{
		displayName: 'Feature',
		name: 'feature',
		type: 'options', // Required for Create
		required: true,
		options: [
			{ name: 'Contact', value: 'contact' },
			{ name: 'Deal', value: 'deal' },
			{ name: 'Organization', value: 'organization' },
			{ name: 'Staff', value: 'staff' },
			// Adicionar outras features
		],
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		default: 'contact',
		description: 'The feature this custom field belongs to',
	},
	{
		displayName: 'Field Type Name or ID',
		name: 'fieldType',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomFieldTypes',
		},
		required: true,
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		default: '',
		description: 'Type of the custom field (e.g., varchar, text, enum, set, date, number). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Order',
		name: 'order',
		type: 'number',
		// required: true, // API diz obrigatório para Create?
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		default: 0,
		description: 'Order position of the field',
	},
	{
		displayName: 'Values (for Enum/Set Types)',
		name: 'values',
		type: 'string',
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Value' },
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
				// TODO: Show only if fieldType is enum/set? Needs logic or separate fields.
			},
		},
		default: [],
		description: 'Define the possible values for Enum or Set field types. Enter each value separately.',
	},
	{
		displayName: 'Sub Field Settings',
		name: 'subFieldSettings',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		default: '{}',
		description: 'JSON object for sub field settings (structure depends on field type)',
	},
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'collection',
		placeholder: 'Configure Settings',
		default: {},
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customField'],
			},
		},
		options: [
			{
				displayName: 'Visible on View',
				name: 'visibleOnView',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Visible on View When',
				name: 'visibleOnViewWhen',
				type: 'multiOptions',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Prospect', value: 'prospect' },
					{ name: 'Contact', value: 'contact' },
				],
				default: [],
			},
			{
				displayName: 'Visible on View If Filled',
				name: 'visibleOnViewIfFilled',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Visible on View If Filled When',
				name: 'visibleOnViewIfFilledWhen',
				type: 'multiOptions',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Prospect', value: 'prospect' },
					{ name: 'Contact', value: 'contact' },
				],
				default: [],
			},
			{
				displayName: 'Editable',
				name: 'editable',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Editable When',
				name: 'editableWhen',
				type: 'multiOptions',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Prospect', value: 'prospect' },
					{ name: 'Contact', value: 'contact' },
				],
				default: [],
			},
			{
				displayName: 'Creatable',
				name: 'creatable',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Creatable When',
				name: 'creatableWhen',
				type: 'multiOptions',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Prospect', value: 'prospect' },
					{ name: 'Contact', value: 'contact' },
				],
				default: [],
			},
		],
	},
	// TODO: Adicionar outros campos (active, required, fieldRef, etc.)

]; 