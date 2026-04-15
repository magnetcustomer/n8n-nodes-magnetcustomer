// e2e/helpers/config.ts
import * as fs from 'fs';
import * as path from 'path';

export interface E2EConfig {
  magnetCustomer: {
    apiUrl: string;
    subDomainAccount: string;
    clientId: string;
    clientSecret: string;
  };
  keycloak: {
    tokenUrl: string;
    username?: string;
    password?: string;
  };
  n8n: {
    url: string;
    apiKey: string;
  };
  options: {
    triggerMode: 'simulated' | 'real';
    cleanupPrefix: string;
    timeoutMs: number;
  };
}

let cachedConfig: E2EConfig | null = null;

export function loadConfig(): E2EConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = path.resolve(__dirname, '../config/e2e.config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `E2E config not found: ${configPath}\n` +
      'Copy e2e/config/e2e.config.example.json to e2e/config/e2e.config.json and fill in credentials.',
    );
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as E2EConfig;

  const required: Array<[string, string]> = [
    [raw.magnetCustomer?.apiUrl, 'magnetCustomer.apiUrl'],
    [raw.magnetCustomer?.subDomainAccount, 'magnetCustomer.subDomainAccount'],
    [raw.magnetCustomer?.clientId, 'magnetCustomer.clientId'],
    [raw.magnetCustomer?.clientSecret, 'magnetCustomer.clientSecret'],
    [raw.keycloak?.tokenUrl, 'keycloak.tokenUrl'],
    [raw.n8n?.url, 'n8n.url'],
  ];

  for (const [value, name] of required) {
    if (!value) {
      throw new Error(`E2E config missing required field: ${name}`);
    }
  }

  cachedConfig = raw;
  return raw;
}

export function getConfig(): E2EConfig {
  if (!cachedConfig) throw new Error('Config not loaded. Call loadConfig() first.');
  return cachedConfig;
}

/**
 * Get a fresh API token via Keycloak password grant.
 * Uses the e2e-backend client with e2e-admin user credentials.
 * Password grant provides a user context (staff) needed by the API.
 * Token is valid for 1 hour — sufficient for a full test run.
 */
export async function getApiToken(): Promise<string> {
  const config = getConfig();
  const res = await fetch(config.keycloak.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.magnetCustomer.clientId,
      client_secret: config.magnetCustomer.clientSecret,
      grant_type: 'password',
      username: config.keycloak.username || 'e2e-admin',
      password: config.keycloak.password || '<KC_PASSWORD>',
    }),
  });

  if (!res.ok) {
    throw new Error(`Keycloak token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}
