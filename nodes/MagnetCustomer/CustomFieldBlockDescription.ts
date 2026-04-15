import type { INodeProperties } from 'n8n-workflow';

// API Ref: https://apireference.magnetcustomer.com/#/Custom%20Fields%20Blocks

export const customFieldBlockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customFieldBlock'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a custom field block',
				action: 'Create a custom field block',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a custom field block',
				action: 'Delete a custom field block',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a custom field block',
				action: 'Get a custom field block',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many custom field blocks',
				action: 'Get many custom field blocks',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search custom field blocks',
				action: 'Search custom field blocks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a custom field block',
				action: 'Update a custom field block',
			},
		],
		default: 'getAll',
	},
];

export const customFieldBlockFields: INodeProperties[] = [
	// --- ID for Get/Delete/Update ---
	{
		displayName: 'Block ID',
		name: 'blockId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get', 'update', 'delete'],
				resource: ['customFieldBlock'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the custom field block',
	},

	// --- Fields for Get Many / Search ---
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customFieldBlock'],
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
				operation: ['getAll', 'search'],
				resource: ['customFieldBlock'],
			},
		},
		default: 15,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Search Term',
		name: 'search',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['search'],
				resource: ['customFieldBlock'],
			},
		},
		default: '',
		description: 'Optional search term to filter results',
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
				resource: ['customFieldBlock'],
			},
		},
		default: '',
		description: 'Name of the custom field block',
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
				resource: ['customFieldBlock'],
			},
		},
		default: 'contact',
		description: 'The feature this block belongs to',
	},
	{
		displayName: 'Position',
		name: 'position',
		type: 'number',
		// required: true, // API diz obrigatório para Create?
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customFieldBlock'],
			},
		},
		default: 0,
		description: 'Position of the block',
	},
	{
		displayName: 'Is Expanded',
		name: 'isExpanded',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customFieldBlock'],
			},
		},
		default: true, // Based on curl example
		description: 'Whether the block should be expanded by default',
	},
	{
		displayName: 'Summary Display',
		name: 'summaryDisplay',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['customFieldBlock'],
			},
		},
		default: true, // Based on curl example
		description: 'Whether to display this block in summaries',
	},
]; 