import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MagnetCustomerOAuth2Api implements ICredentialType {
	name = 'magnetCustomerOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'MagnetCustomer OAuth2 API';

	documentationUrl = 'https://developers.magnetcustomer.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Sub Domain',
			name: 'subDomain',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorization_code',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://magnetcustomer.net/realms/platform/protocol/openid-connect/auth',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://magnetcustomer.net/realms/platform/protocol/openid-connect/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
