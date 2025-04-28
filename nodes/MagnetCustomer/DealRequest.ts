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

export async function dealRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	index?: number): Promise<any> {

	let requestMethod;
	let endpoint;
	let body: IDataObject = {};
	let qs: IDataObject = {};


	switch (operation) {
		case 'create':
			requestMethod = 'POST';
			endpoint = '/import/deals';
			body = {
				title: this.getNodeParameter('title', index),
				description: this.getNodeParameter('description', index),
				amount: this.getNodeParameter('amount', index),
				expectedCloseDate: this.getNodeParameter('expectedCloseDate', index),
				pipeline: this.getNodeParameter('pipeline', index),
				customFields: addCustomFields(this.getNodeParameter('customFieldCollection', index) as object),
				source: this.getNodeParameter('source', index),
			};

			if (this.getNodeParameter('associateWith', index) === 'contact') {
				body.contact = this.getNodeParameter('contact', index) as string;
			}
			if (this.getNodeParameter('associateWith', index) === 'organization') {
				body.organization = this.getNodeParameter('organization', index) as string;
			}
			if (this.getNodeParameter('staff', index)) {
				body.staff = this.getNodeParameter('staff', index);
			}
			if (this.getNodeParameter('stage', index)) {
				body.stage = this.getNodeParameter('stage', index);
			}
			break;
		case 'delete':
			requestMethod = 'DELETE';
			endpoint = `/deals/${this.getNodeParameter('dealId', index)}`;
			break;
		case 'get':
			requestMethod = 'GET';
			endpoint = `/deals/${this.getNodeParameter('dealId', index)}`;
			break;
		case 'getAll':
			requestMethod = 'GET';
			endpoint = '/deals';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
			};
			break;
		case 'update':
			requestMethod = 'PUT';
			const dealId = this.getNodeParameter('dealId', index) as string;
			endpoint = `/deals/${dealId}`;
			body = {}; // Start with empty body for partial update

			// Helper function to add parameter to body if it exists
			const addParam = (paramName: string, bodyKey?: string) => {
				const value = this.getNodeParameter(paramName, index);
				if (value !== undefined && value !== null && value !== '') {
					body[bodyKey ?? paramName] = value;
				}
			};

			// Add fields to body only if provided
			addParam('title');
			addParam('description');
			addParam('amount');
			addParam('expectedCloseDate');
			addParam('pipeline');
			addParam('stage');
			addParam('status');
			addParam('staff');
			addParam('source'); // Assuming source might be updatable

			// Handle association
			const associateWith = this.getNodeParameter('associateWith', index);
			if (associateWith === 'contact') {
				addParam('contact');
				// Potentially clear the other association if switching?
				// body.organization = null; // API might not support nulling this way
			} else if (associateWith === 'organization') {
				addParam('organization');
				// body.contact = null;
			}

			// Handle custom fields
			const customFields = this.getNodeParameter('customFieldCollection', index) as any;
			if (customFields?.customFields && customFields.customFields.length > 0) {
				body.customFields = addCustomFields(customFields);
			}

			break;
		case 'search':
			requestMethod = 'GET';
			endpoint = '/deals';
			qs = {
				page: this.getNodeParameter('page', index),
				limit: this.getNodeParameter('limit', index),
				search: this.getNodeParameter('search', index) as string,
			};
			break;
		default:
			break;
	}

	// Ajuste para Delete
	if (operation === 'delete') {
		await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return { success: true };
	}

	// Ajuste para Update retornar o objeto deal
	if (operation === 'update') {
		const { deal } = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
		return deal;
	}

	if (['GET'].includes(String(requestMethod))) return magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);

	const {deal} = await magnetCustomerApiRequest.call(this, requestMethod, endpoint, body, qs,);
	return deal;
}

