import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MagnetCustomerApi implements ICredentialType {
	name = 'magnetCustomerApi';

	displayName = 'MagnetCustomer API';

	documentationUrl = 'https://developers.magnetcustomer.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: 'Bearer ={{$credentials.apiToken}}',
			},
		},
	};
}
