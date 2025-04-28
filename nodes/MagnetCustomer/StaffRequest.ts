import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	addCustomFields,
	magnetCustomerApiRequest
} from "./GenericFunctions";

export async function staffRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};

	switch (operation) {
		case 'get':
			requestMethod = 'GET';
			const staffIdGet = this.getNodeParameter('staffId', index) as string;
			endpoint = `/staffs/${staffIdGet}`;
			break;

		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/staffs';
			qs = {
				page: this.getNodeParameter('page', index, 1), // Adiciona valor padrão 1
				limit: this.getNodeParameter('limit', index, 15), // Adiciona valor padrão 15
				// TODO: Adicionar outros parâmetros de query suportados pela API (e.g., search)
			};
			break;

		case 'search': // Novo caso para Search
			requestMethod = 'GET';
			endpoint = '/staffs';
			qs = {
				page: this.getNodeParameter('page', index, 1),
				limit: this.getNodeParameter('limit', index, 15),
				search: this.getNodeParameter('search', index, '') as string, // Pega o parâmetro search
			};
			break;

		case 'create':
			requestMethod = 'POST';
			endpoint = '/staffs';
			body = {
				fullname: this.getNodeParameter('fullname', index) as string,
				email: this.getNodeParameter('email', index) as string,
				phone: this.getNodeParameter('phone', index, '') as string, // Opcional
				whatsAppPhone: this.getNodeParameter('whatsAppPhone', index, '') as string, // Opcional
				role: this.getNodeParameter('role', index) as string,
				workspaces: this.getNodeParameter('workspaces', index, []) as string[], // Array de strings
				// TODO: Ajustar a chamada de addCustomFields ou usar uma nova função
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index, {}) as any),
			};
			// Send request for create
			const response = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);
			// Log the raw response for create
			console.log('Raw API Response (Create Staff):', JSON.stringify(response, null, 2));
			return response; // Return the full response for create

		case 'update':
			requestMethod = 'PUT';
			const staffIdUpdate = this.getNodeParameter('staffId', index) as string;
			endpoint = `/staffs/${staffIdUpdate}`;
			body = {}; // Começa corpo vazio para update parcial

			// Adiciona campos ao corpo SOMENTE se eles foram fornecidos pelo usuário
			if (this.getNodeParameter('fullname', index)) {
				body.fullname = this.getNodeParameter('fullname', index) as string;
			}
			if (this.getNodeParameter('email', index)) {
				body.email = this.getNodeParameter('email', index) as string;
			}
			if (this.getNodeParameter('phone', index)) {
				body.phone = this.getNodeParameter('phone', index) as string;
			}
			if (this.getNodeParameter('whatsAppPhone', index)) {
				body.whatsAppPhone = this.getNodeParameter('whatsAppPhone', index) as string;
			}
			if (this.getNodeParameter('role', index)) {
				body.role = this.getNodeParameter('role', index) as string;
			}
			const workspaces = this.getNodeParameter('workspaces', index, []) as string[];
			if (workspaces.length > 0) { // Verifica se o array não está vazio
				body.workspaces = workspaces;
			}

			// Adiciona campos customizados se fornecidos
			const customFieldCollection = this.getNodeParameter('customFieldCollection', index, {}) as {
				customFields?: [{ _id: string, v: string }]
			};
			if (customFieldCollection.customFields && customFieldCollection.customFields.length > 0) {
				body.customFields = addCustomFields(customFieldCollection);
			}
			break;

		case 'delete':
			requestMethod = 'DELETE';
			const staffIdDelete = this.getNodeParameter('staffId', index) as string;
			endpoint = `/staffs/${staffIdDelete}`;
			// body e qs não são necessários
			break;

		default:
			throw new Error(`Operação '${operation}' não suportada para o recurso Staff.`);
	}

	// Only GET, PUT, DELETE operations should reach here now
	const responseData = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs);

	// Process response for non-create operations
	if (operation === 'update' || operation === 'get' || operation === 'getAll' || operation === 'search') { // GET/getAll/search also handled here
		 return responseData; // Retorna o objeto staff atualizado/encontrado diretamente
	}

	// Handle delete response
	else if (operation === 'delete') {
		return { success: true }; // Assume success if no error thrown
	}

	return responseData; // Fallback
} 