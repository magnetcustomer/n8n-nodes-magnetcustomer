import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	magnetCustomerApiRequest,
	magnetCustomerApiRequestAllItems,
} from './GenericFunctions';

export async function pipelineRequest(this: IExecuteFunctions, operation: string, i: number): Promise<IDataObject | IDataObject[]> {
	const qs: IDataObject = {};
	let body: IDataObject = {};
	let endpoint = '/pipelines';
	let method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'; // Default to GET

	if (operation === 'get') {
		const pipelineId = this.getNodeParameter('pipelineId', i) as string;
		endpoint = `/pipelines/${pipelineId}`;
		method = 'GET';
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i);
		method = 'GET';
		if (returnAll) {
			// Use the function that handles pagination
			// Note: magnetCustomerApiRequestAllItems might not support all specific filters yet.
			// If filtering/sorting is needed with returnAll, this function needs enhancement.
			return magnetCustomerApiRequestAllItems.call(this, method, endpoint, body, qs);
		} else {
			qs.limit = this.getNodeParameter('limit', i);
			const filters = this.getNodeParameter('filters', i, {});
			const sort = this.getNodeParameter('sort', i, {}) as IDataObject;

			// Add filter parameters to qs if they exist and are not empty strings
			if (filters.search) {
				qs.search = filters.search;
			}
			if (filters.emailsEmpty !== '' && filters.emailsEmpty !== undefined) {
				qs.emailsEmpty = filters.emailsEmpty as boolean;
			}
			if (filters.phonesEmpty !== '' && filters.phonesEmpty !== undefined) {
				qs.phonesEmpty = filters.phonesEmpty as boolean;
			}
			if (filters.interactionsEmpty !== '' && filters.interactionsEmpty !== undefined) {
				qs.interactionsEmpty = filters.interactionsEmpty as boolean;
			}

			// Add sort parameters to qs if they exist
			if (sort.sortBy) {
				qs.sortBy = sort.sortBy;
			}
			if (sort.sortType) {
				qs.sortType = sort.sortType;
			}
		}
	} else if (operation === 'create') {
		method = 'POST';
		body.title = this.getNodeParameter('title', i) as string;
		// Add other body parameters for creation if needed

		// Send request for create
		const response = await magnetCustomerApiRequest.call(this, method, endpoint, body, qs);
		// Log the raw response for create
		console.log('Raw API Response (Create Pipeline):', JSON.stringify(response, null, 2));
		return response; // Return the full response for create

	} else if (operation === 'update') {
		const pipelineId = this.getNodeParameter('pipelineId', i) as string;
		endpoint = `/pipelines/${pipelineId}`;
		method = 'PUT'; // Confirmado pelo curl
		const updateFields = this.getNodeParameter('updateFields', i);

		// Construir o body com base nos campos disponíveis em updateFields
		body = {};
		if (updateFields.title !== undefined) {
			body.title = updateFields.title;
		}
		if (updateFields.defaultView !== undefined) {
			body.defaultView = updateFields.defaultView;
		}
		if (updateFields.roles !== undefined) {
			body.roles = updateFields.roles; // Assumindo que é um array de IDs
		}
		if (updateFields.staffs !== undefined) {
			body.staffs = updateFields.staffs; // Assumindo que é um array de IDs
		}

		// Processar os stages da fixedCollection
		if (updateFields.stages && (updateFields.stages as IDataObject).stageDetails) {
			body.stages = ((updateFields.stages as IDataObject).stageDetails as IDataObject[]).map(stage => ({
				// Mapear os campos definidos na description
				name: stage.name,
				probability: stage.probability,
				position: stage.position,
				active: stage.active,
				won: stage.won,
				lost: stage.lost,
				// Adicionar outros campos de stage aqui se foram adicionados na description
			}));
		}

		// body = updateFields; // Lógica antiga removida

		// Send request for update and return the full response
		return magnetCustomerApiRequest.call(this, method, endpoint, body, qs);

	} else if (operation === 'delete') {
		const pipelineId = this.getNodeParameter('pipelineId', i) as string;
		endpoint = `/pipelines/${pipelineId}`;
		method = 'DELETE';

		// Send request for delete and return the full response
		return magnetCustomerApiRequest.call(this, method, endpoint, body, qs);
	} else if (operation === 'search') {
		method = 'GET';
		endpoint = '/pipelines';
		// qs já contém limit, filtros e sort da lógica de getAll
		// A única diferença é que o campo 'search' dentro de filters será usado
		// (A lógica de getAll já pega o search de dentro de filters)
	}

	// Make the single API request (only for GET operations now)
	// If operation was create, update, or delete, it would have returned already.
	if (method === 'GET') {
		return magnetCustomerApiRequest.call(this, method, endpoint, body, qs);
	}

	// Should not be reached if all operations are handled
	return {}; // Return empty object as a fallback
} 