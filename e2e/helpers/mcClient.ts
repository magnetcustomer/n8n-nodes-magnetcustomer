// e2e/helpers/mcClient.ts
import { getConfig, getApiToken } from './config';

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  cachedToken = await getApiToken();
  return cachedToken;
}

async function mcFetch(
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  qs?: Record<string, any>,
): Promise<any> {
  const config = getConfig();
  const token = await getToken();
  const url = new URL(`${config.magnetCustomer.apiUrl}/api${endpoint}`);

  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MC API ${res.status} ${method} ${endpoint}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function get(endpoint: string, qs?: Record<string, any>): Promise<any> {
  return mcFetch('GET', endpoint, undefined, qs);
}

export async function post(endpoint: string, body: Record<string, any>): Promise<any> {
  return mcFetch('POST', endpoint, body);
}

export async function put(endpoint: string, body: Record<string, any>): Promise<any> {
  return mcFetch('PUT', endpoint, body);
}

export async function del(endpoint: string): Promise<any> {
  return mcFetch('DELETE', endpoint);
}

export async function healthCheck(): Promise<boolean> {
  try {
    const config = getConfig();
    const res = await fetch(`${config.magnetCustomer.apiUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
