import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';



import {
	ICredentialDataDecryptedObject,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionType
} from "n8n-workflow";
import basicAuth from "basic-auth";
import {
	magnetCustomerApiRequest
} from './GenericFunctions';

function authorizationError(resp: any, realm: string, responseCode: number, message?: string) {
	if (message === undefined) {
		message = 'Authorization problem!';
		if (responseCode === 401) {
			message = 'Authorization is required!';
		} else if (responseCode === 403) {
			message = 'Authorization data is wrong!';
		}
	}

	resp.writeHead(responseCode, {'WWW-Authenticate': `Basic realm="${realm}"`});
	resp.end(message);
	return {
		noWebhookResponse: true,
	};
}

export class MagnetCustomerTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Magnet Customer Trigger',
		name: 'magnetCustomerTrigger',
		icon: 'file:magnetcustomer.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Starts the workflow when Magnet Customer events occur',
		defaults: {
			name: 'MagnetCustomerTrigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'magnetCustomerApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiToken'],
					},
				},
			},
			{
				name: 'magnetCustomerOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Token',
						value: 'apiToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiToken',
			},
			{
				displayName: 'Incoming Authentication',
				name: 'incomingAuthentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth',
						value: 'basicAuth',
					},
					{
						name: 'None',
						value: 'none',
					},
				],
				default: 'none',
				description: 'If authentication should be activated for the webhook (makes it more secure)',
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Added',
						value: 'added',
						description: 'Data got added',
						action: 'Data was added',
					},
					{
						name: 'All',
						value: '*',
						description: 'Any change',
						action: 'Any change',
					},
					{
						name: 'Deleted',
						value: 'deleted',
						description: 'Data got deleted',
						action: 'Data was deleted',
					},
					{
						name: 'Merged',
						value: 'merged',
						description: 'Data got merged',
						action: 'Data was merged',
					},
					{
						name: 'Updated',
						value: 'updated',
						description: 'Data got updated',
						action: 'Data was updated',
					},
				],
				default: '*',
				description: 'Type of action to receive notifications about',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Meeting',
						value: 'meeting',
					},
					{
						name: 'Organization',
						value: 'organization',
					},
					{
						name: 'Prospect',
						value: 'prospect',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Ticket',
						value: 'ticket',
					},
					{
						name: 'Treatment',
						value: 'treatment',
					},
				],
				default: 'deal',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');

				const webhookData = this.getWorkflowStaticData('node');

				const eventAction = this.getNodeParameter('action') as string;

				const eventResource = this.getNodeParameter('resource') as string;

				// Webhook got created before so check if it still exists
				const endpoint = '/webhooks';

				const responseData = await magnetCustomerApiRequest.call(this, 'GET', endpoint, {});

				if (responseData.data === undefined) {
					return false;
				}

				for (const existingData of responseData.data) {
					if (
						existingData.subscriptionUrl === webhookUrl &&
						existingData.eventAction === eventAction &&
						existingData.eventResource === eventResource
					) {
						// The webhook exists already
						webhookData.webhookId = existingData.id;
						return true;
					}
				}

				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const incomingAuthentication = this.getNodeParameter('incomingAuthentication', 0) as string;
				const eventAction = this.getNodeParameter('action') as string;
				const eventResource = this.getNodeParameter('resource') as string;

				const endpoint = '/webhooks';

				const body = {
					eventAction,
					eventResource,
					subscriptionUrl: webhookUrl,
					httpAuthUser: undefined as string | undefined,
					httpAuthPassword: undefined as string | undefined,
				};

				if (incomingAuthentication === 'basicAuth') {
					let httpBasicAuth;

					try {
						httpBasicAuth = await this.getCredentials('httpBasicAuth');
					} catch (error) {
						// Do nothing
					}

					if (httpBasicAuth === undefined || !httpBasicAuth.user || !httpBasicAuth.password) {
						// Data is not defined on node so can not authenticate
						return false;
					}

					body.httpAuthUser = httpBasicAuth.user as string;
					body.httpAuthPassword = httpBasicAuth.password as string;
				}

				const responseData = await magnetCustomerApiRequest.call(this, 'POST', endpoint, body);

				if (responseData.data === undefined || responseData.data.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = responseData.data.id as string;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					const endpoint = `/webhooks/${webhookData.webhookId}`;
					const body = {};

					try {
						await magnetCustomerApiRequest.call(this, 'DELETE', endpoint, body);
					} catch (error) {
						return false;
					}

					// Remove from the static workflow data so that it is clear
					// that no webhooks are registered anymore
					delete webhookData.webhookId;
					delete webhookData.webhookEvents;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const resp = this.getResponseObject();
		const realm = 'Webhook';

		const incomingAuthentication = this.getNodeParameter('incomingAuthentication', 0) as string;

		if (incomingAuthentication === 'basicAuth') {
			// Basic authorization is needed to call webhook
			let httpBasicAuth: ICredentialDataDecryptedObject | undefined;

			try {
				httpBasicAuth = await this.getCredentials<ICredentialDataDecryptedObject>('httpBasicAuth');
			} catch (error) {
				// Do nothing
			}

			if (httpBasicAuth === undefined || !httpBasicAuth.user || !httpBasicAuth.password) {
				// Data is not defined on node so can not authenticate
				return authorizationError(resp, realm, 500, 'No authentication data defined on node!');
			}

			const basicAuthData = basicAuth(req);

			if (basicAuthData === undefined) {
				// Authorization data is missing
				return authorizationError(resp, realm, 401);
			}

			if (
				basicAuthData.name !== httpBasicAuth.user ||
				basicAuthData.pass !== httpBasicAuth.password
			) {
				// Provided authentication data is wrong
				return authorizationError(resp, realm, 403);
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(req.body as IDataObject[])],
		};
	}

}
