import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MagnetCustomerApi implements ICredentialType {
	name = 'magnetCustomerApi';

	displayName = 'MagnetCustomer API';

	documentationUrl = 'https://developers.magnetcustomer.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Subdomain Platform URL',
			name: 'subDomainAccount',
			type: 'string',
			description: 'The subdomain of your Magnet Customer Platform.',
			placeholder: 'company',
			default: '',
			required: true,
		},
		{
			displayName: 'E-mail',
			name: 'email',
			type: 'string',
			description: 'name@email.com',
			default: '',
		},
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
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};
}
