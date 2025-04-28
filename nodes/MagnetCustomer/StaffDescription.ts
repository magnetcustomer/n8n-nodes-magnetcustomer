import type { INodeProperties } from 'n8n-workflow';

// Baseado na API: https://apireference.magnetcustomer.com/#tag/Staffs

export const staffOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['staff'],
			},
		},
		options: [
			// TODO: Adicionar operações baseadas na API (Get, GetAll, Create, Update, Delete?)
			// Ordem Alfabética
			{
				name: 'Create',
				value: 'create',
				description: 'Create a staff member',
				action: 'Create a staff member',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a staff member',
				action: 'Delete a staff member',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a staff member',
				action: 'Get a staff member',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many staff members',
				action: 'Get many staff members',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for staff members',
				action: 'Search for staff members',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a staff member',
				action: 'Update a staff member',
			},
			// Outras operações (Delete) podem precisar de endpoints diferentes ou não existir. Verificar API.
		],
		default: 'getAll',
	},
];

export const staffFields: INodeProperties[] = [

	// TODO: Adicionar campos para cada operação (IDs para Get/Delete, filtros para GetAll, dados para Create/Update)

	// Exemplo para Get
	{
		displayName: 'Staff ID',
		name: 'staffId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get', 'update', 'delete'],
				resource: ['staff'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the staff member',
	},

	// Exemplo para GetAll
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'], // Adicionar 'search' se aplicável
				resource: ['staff'],
			},
		},
		default: 1,
		// required: true, // Verificar API
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1, // Verificar API
		},
		displayOptions: {
			show: {
				operation: ['getAll'], // Adicionar 'search' se aplicável
				resource: ['staff'],
			},
		},
		default: 15, // Verificar API
		// required: true, // Verificar API
		description: 'Max number of results to return',
	},
	// Adicionar outros filtros para GetAll/Search se a API suportar (e.g., search term, status)

	// Campos para GetAll e Search
	{
		displayName: 'Search Term',
		name: 'search',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['search'], // Apenas para search
				resource: ['staff'],
			},
		},
		default: '',
		required: true, // Necessário para a operação search
		description: 'The search term to look for',
	},

	// --- Campos para Create --- <----------------------- Adicionados
	{
		displayName: 'Nome Completo',
		name: 'fullname',
		type: 'string',
		default: '',
		// required: true, // Não requerido para Update (parcial)
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'Full name of the staff member',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		// required: true, // Não requerido para Update (parcial)
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'Email address of the staff member',
	},
	{
		displayName: 'Telefone',
		name: 'phone',
		type: 'string',
		default: '',
		// required: false, // Opcional
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'Phone number (optional)',
	},
	{
		displayName: 'Telefone (WhatsApp)',
		name: 'whatsAppPhone',
		type: 'string',
		default: '',
		// required: false, // Opcional
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'WhatsApp phone number (optional)',
	},
	{
		displayName: 'Role Name or ID',
		name: 'role',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRoles',
		},
		default: '',
		// required: true, // Não requerido para Update (parcial)
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'ID of the role for the staff member. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'IDs Do Workspace',
		name: 'workspaces',
		type: 'string', // Mudar para multiOptions com loadOptions se Workspaces forem carregáveis
		typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Workspace ID' },
		default: [],
		// required: true, // Não requerido para Update (parcial)
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
			},
		},
		description: 'List of Workspace IDs to associate the staff member with',
	},
	{
		displayName: 'Custom Fields',
		name: 'customFieldCollection',
		placeholder: 'Add Custom Field',
		description: 'Adds custom fields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['create', 'update'],
				resource: ['staff'],
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
						name: '_id', // Usado internamente para obter ID e talvez nome
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getStaffCustomFields',
						},
						default: '',
						description: 'Name of the field to set. Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	// --- Fim dos Campos para Create ---

	// Campos para Update (se suportados)
	/*
	{
		displayName: 'Fullname',
		name: 'fullname',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['staff'],
			},
		},
		description: 'The fullname of the staff member',
	},
	// Adicionar outros campos relevantes (email, phone, role, etc.)
	*/
]; 