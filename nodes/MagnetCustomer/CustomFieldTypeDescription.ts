import type { INodeProperties } from 'n8n-workflow';

// API Ref: Based on GET /api/customfieldtypes curl

export const customFieldTypeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customFieldType'],
			},
		},
		options: [
			// Only Get Many/Search seems available from the curl
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many custom field types',
				action: 'Get many custom field types',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search custom field types',
				action: 'Search custom field types',
			},
		],
		default: 'getAll',
	},
];

export const customFieldTypeFields: INodeProperties[] = [
	// --- Fields for Get Many / Search ---
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customFieldType'],
			},
		},
		default: 1,
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
				resource: ['customFieldType'],
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
				operation: ['search'], // Only for search
				resource: ['customFieldType'],
			},
		},
		default: '',
		description:
			'The search term to look for',
	},
	{
		displayName: 'Filters', // Optional filters seen in curl
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['customFieldType'],
			},
		},
		options: [
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
		],
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
				resource: ['customFieldType'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'string',
				default: 'name', // Guessing, check API response/docs
				description: 'Field to sort by',
			},
			{
				displayName: 'Sort Type',
				name: 'sortType',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'asc', // Default from curl was desc, but asc might be more common
				description: 'Sort direction',
			},
		],
	},
]; 