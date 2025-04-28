import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function workspaceRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};

	// TODO: Verificar API para endpoints e operações corretas
	switch (operation) {
		case 'getAll': // Assumindo que existe um endpoint para listar workspaces
		case 'search': // Search usa o mesmo endpoint, mas com parâmetro 'search'
			requestMethod = 'GET';
			endpoint = '/treatments/workspaces'; // Endpoint CORRETO
			qs = {
				page: this.getNodeParameter('page', index, 1),
				limit: this.getNodeParameter('limit', index, 15),
				search: operation === 'search' ? this.getNodeParameter('search', index, '') : '', // Adiciona search apenas para operação search
			};

			// Adicionar filtros booleanos opcionais
			const filters = this.getNodeParameter('filters', index, {}) as {
				emailsEmpty?: boolean;
				phonesEmpty?: boolean;
				interactionsEmpty?: boolean;
			};
			if (filters.emailsEmpty !== undefined) qs.emailsEmpty = filters.emailsEmpty;
			if (filters.phonesEmpty !== undefined) qs.phonesEmpty = filters.phonesEmpty;
			if (filters.interactionsEmpty !== undefined) qs.interactionsEmpty = filters.interactionsEmpty;

			// Adicionar ordenação opcional
			const sort = this.getNodeParameter('sort', index, {}) as {
				sortBy?: string;
				sortType?: string;
			};
			if (sort.sortBy) qs.sortBy = sort.sortBy;
			if (sort.sortType) qs.sortType = sort.sortType;

			break;

		case 'get':
			requestMethod = 'GET';
			const workspaceId = this.getNodeParameter('workspaceId', index) as string;
			endpoint = `/treatments/workspaces/${workspaceId}`;
			// qs e body não são necessários para GET por ID
			break;

		case 'create':
			requestMethod = 'POST';
			endpoint = '/treatments/workspaces';
			body = {
				name: this.getNodeParameter('name', index) as string,
			};
			// qs não é necessário para POST
			break;

		case 'update':
			requestMethod = 'PUT';
			const workspaceIdUpdate = this.getNodeParameter('workspaceId', index) as string;
			endpoint = `/treatments/workspaces/${workspaceIdUpdate}`;
			body = {};
			// Adiciona name ao body apenas se fornecido
			if (this.getNodeParameter('name', index)) {
				body.name = this.getNodeParameter('name', index) as string;
			}
			// qs não é necessário para PUT
			break;

		case 'delete':
			requestMethod = 'DELETE';
			const workspaceIdDelete = this.getNodeParameter('workspaceId', index) as string;
			endpoint = `/treatments/workspaces/${workspaceIdDelete}`;
			// body e qs não são necessários
			break;

		// TODO: Implementar casos para 'delete' se suportado

		default:
			throw new Error(`Operação '${operation}' não suportada para o recurso Workspace.`);
	}

	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Assumindo que POST/PUT retorna o objeto criado/atualizado
	if (operation === 'create' || operation === 'update') {
		return responseData;
	}

	// Handle delete response
	else if (operation === 'delete') {
		return { success: true }; // Assume success if no error thrown
	}

	return responseData;
} 