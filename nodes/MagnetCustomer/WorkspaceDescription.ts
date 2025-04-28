import type { INodeProperties } from 'n8n-workflow';

// TODO: Verificar API para endpoint e operações corretas para Workspace
// https://apireference.magnetcustomer.com/ ?

export const workspaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['workspace'],
			},
		},
		options: [
			// Ordem alfabética
			{
				name: 'Create',
				value: 'create',
				description: 'Create a workspace',
				action: 'Create a workspace',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a workspace',
				action: 'Delete a workspace',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a workspace',
				action: 'Get a workspace',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many workspaces',
				action: 'Get many workspaces',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for workspaces',
				action: 'Search for workspaces',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a workspace',
				action: 'Update a workspace',
			},
		],
		default: 'getAll',
	},
];

export const workspaceFields: INodeProperties[] = [
	// TODO: Adicionar campos para cada operação

	// Exemplo para GetAll (se suportado)
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll', 'search'],
				resource: ['workspace'],
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
				resource: ['workspace'],
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
				operation: ['search'], // Somente para search
				resource: ['workspace'],
			},
		},
		default: '',
		description:
			'The search term to look for',
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
				resource: ['workspace'],
			},
		},
		options: [
			{
				displayName: 'Emails Empty',
				name: 'emailsEmpty',
				type: 'boolean',
				default: false,
				description: 'Whether to filter workspaces with empty emails',
			},
			{
				displayName: 'Phones Empty',
				name: 'phonesEmpty',
				type: 'boolean',
				default: false,
				description: 'Whether to filter workspaces with empty phones',
			},
			{
				displayName: 'Interactions Empty',
				name: 'interactionsEmpty',
				type: 'boolean',
				default: false,
				description: 'Whether to filter workspaces with empty interactions',
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
				resource: ['workspace'],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'string', // Poderia ser options se os campos forem conhecidos/fixos
				default: 'createdAt', // Suposição, verificar API qual o padrão
				description: 'Field to sort by (e.g., email, createdAt, name)',
			},
			{
				displayName: 'Sort Type',
				name: 'sortType',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
				description: 'Sort direction',
			},
		],
	},

	// Campo para Get por ID
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get', 'update', 'delete'], // Adicionado delete
				resource: ['workspace'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the workspace to retrieve',
	},

	// Campo para Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['create', 'update'], // Adicionado update
				resource: ['workspace'],
			},
		},
		default: '',
		description: 'Name of the workspace to create',
	},
]; 