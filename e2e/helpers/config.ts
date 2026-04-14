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
    [raw.n8n?.url, 'n8n.url'],
    [raw.n8n?.apiKey, 'n8n.apiKey'],
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
