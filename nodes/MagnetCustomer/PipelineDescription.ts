import type { INodeProperties } from 'n8n-workflow';

// Baseado em endpoints comuns de API RESTful e no método getPipelineIds existente
// Endpoints prováveis: /pipelines, /pipelines/{id}

export const pipelineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a pipeline',
				action: 'Create a pipeline',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a pipeline',
				action: 'Delete a pipeline',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a pipeline',
				action: 'Get a pipeline',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many pipelines',
				action: 'Get many pipelines',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a pipeline',
				action: 'Update a pipeline',
			},
		],
		default: 'getAll',
	},
];

export const pipelineFields: INodeProperties[] = [

	// ----------------------------------
	//         pipeline: get
	// ----------------------------------
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the pipeline',
	},

	// ----------------------------------
	//         pipeline: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
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
				resource: ['pipeline'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		options: [
			{
				displayName: 'Search Term',
				name: 'search',
				type: 'string',
				default: '',
				description: 'The search term to look for',
			},
			{
				displayName: 'Has Emails?',
				name: 'emailsEmpty',
				type: 'options',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'Yes (Not Empty)', value: false },
					{ name: 'No (Empty)', value: true },
				],
				default: '',
				description: 'Filter based on presence of emails',
			},
			{
				displayName: 'Has Phones?',
				name: 'phonesEmpty',
				type: 'options',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'Yes (Not Empty)', value: false },
					{ name: 'No (Empty)', value: true },
				],
				default: '',
				description: 'Filter based on presence of phones',
			},
			{
				displayName: 'Has Interactions?',
				name: 'interactionsEmpty',
				type: 'options',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'Yes (Not Empty)', value: false },
					{ name: 'No (Empty)', value: true },
				],
				default: '',
				description: 'Filter based on presence of interactions',
			},
		],
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'collection',
		placeholder: 'Add Sort Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'string',
				default: 'createdAt',
				description: 'Field to sort by (e.g., title, createdAt)',
			},
			{
				displayName: 'Sort Direction',
				name: 'sortType',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Direction of sorting',
			},
		],
	},
	// Adicionar outros filtros se a API suportar (e.g., search term, status)

	// ----------------------------------
	//         pipeline: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['create'],
			},
		},
		description: 'Title of the pipeline',
	},
	// Adicionar outros campos necessários para Create (e.g., stages?)

	// ----------------------------------
	//         pipeline: update
	// ----------------------------------
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['update'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the pipeline to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field to Update',
		default: {},
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New title for the pipeline',
			},
			{
				displayName: 'Default View',
				name: 'defaultView',
				type: 'boolean',
				default: false,
				description: 'Whether this pipeline is the default view',
			},
			{
				displayName: 'Roles (IDs) Names or IDs',
				name: 'roles',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getRoles',
				},
				default: [],
				description: 'Associate roles with this pipeline. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Staffs (IDs) Names or IDs',
				name: 'staffs',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getStaffIds',
				},
				default: [],
				description: 'Associate staff members with this pipeline. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Stages',
				name: 'stages',
				placeholder: 'Add Stage',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Define the stages for this pipeline',
				options: [
					{
						name: 'stageDetails',
						displayName: 'Stage Details',
						values: [
							// Campos essenciais baseados no exemplo curl
							// O _id provavelmente não deve ser enviado ou será ignorado na atualização
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
							},
							{
								displayName: 'Probability (%)',
								name: 'probability',
								type: 'number',
								typeOptions: { minValue: 0, maxValue: 100 },
								default: 100,
							},
							{
								displayName: 'Position',
								name: 'position',
								type: 'number',
								typeOptions: { minValue: 0 },
								default: 0,
								description: 'Order of the stage in the pipeline (0-based)',
							},
							{
								displayName: 'Active',
								name: 'active',
								type: 'boolean',
								default: true,
							},
							{
								displayName: 'Is Won Stage?',
								name: 'won',
								type: 'boolean',
								default: false,
							},
							{
								displayName: 'Is Lost Stage?',
								name: 'lost',
								type: 'boolean',
								default: false,
							},
							// Adicionar outros campos de stage se necessário (e.g., rottingEnabled)
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         pipeline: delete - Nenhum campo específico além do ID
	// ----------------------------------

]; 