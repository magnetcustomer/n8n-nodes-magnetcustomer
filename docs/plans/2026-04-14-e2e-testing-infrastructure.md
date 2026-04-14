# E2E Testing Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Docker-based E2E test infrastructure that provisions n8n, creates workflows via API, executes against real MagnetCustomer API, and validates output.

**Architecture:** n8n runs in Docker with the community node mounted via volume. Jest E2E tests use two clients — `n8nClient` (workflow CRUD + execution) and `mcClient` (MagnetCustomer API for setup/cleanup). Config file makes it environment-agnostic.

**Tech Stack:** Docker, Jest, ts-jest, TypeScript, n8n REST API v1, MagnetCustomer REST API

**Spec:** `docs/specs/2026-04-14-e2e-testing-infrastructure-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `e2e/Dockerfile` | n8n base image |
| `e2e/docker-compose.yml` | Container definition with volume mounts |
| `e2e/setup.sh` | Start n8n, health check, provision owner + API key + credentials |
| `e2e/teardown.sh` | Stop container, remove volumes |
| `e2e/config/e2e.config.example.json` | Config template (committed) |
| `e2e/helpers/config.ts` | Read + validate config, export typed object |
| `e2e/helpers/n8nClient.ts` | n8n REST API client |
| `e2e/helpers/mcClient.ts` | MagnetCustomer API client |
| `e2e/helpers/cleanup.ts` | Delete n8n-e2e-* records |
| `e2e/helpers/workflowBuilder.ts` | Build workflow JSON for any resource/operation |
| `e2e/helpers/globalSetup.ts` | Validate config, connectivity, create base data |
| `e2e/helpers/globalTeardown.ts` | Full cleanup |
| `e2e/tests/*.e2e.test.ts` | 19 test suites |
| `jest.e2e.config.js` | Jest E2E config |
| `.gitignore` | Add `e2e/config/e2e.config.json` |
| `package.json` | Add e2e scripts |

---

### Task 1: Docker Infrastructure + Lifecycle Scripts

**Files:**
- Create: `e2e/Dockerfile`
- Create: `e2e/docker-compose.yml`
- Create: `e2e/setup.sh`
- Create: `e2e/teardown.sh`
- Create: `e2e/config/e2e.config.example.json`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
# e2e/Dockerfile
FROM docker.n8n.io/n8nio/n8n:latest
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
# e2e/docker-compose.yml
services:
  n8n:
    build: .
    container_name: n8n-e2e
    ports:
      - "5678:5678"
    environment:
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_SECURE_COOKIE=false
      - N8N_RUNNERS_ENABLED=false
      - N8N_ENCRYPTION_KEY=n8n-e2e-test-encryption-key
      - DB_TYPE=sqlite
    volumes:
      - ../dist:/home/node/.n8n/custom/node_modules/@magnetcustomer/n8n-nodes-magnetcustomer/dist:ro
      - ../package.json:/home/node/.n8n/custom/node_modules/@magnetcustomer/n8n-nodes-magnetcustomer/package.json:ro
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

- [ ] **Step 3: Create e2e.config.example.json**

```json
{
  "magnetCustomer": {
    "apiUrl": "http://localhost:3001",
    "subDomainAccount": "mc",
    "clientId": "",
    "clientSecret": ""
  },
  "n8n": {
    "url": "http://localhost:5678",
    "apiKey": ""
  },
  "options": {
    "triggerMode": "simulated",
    "cleanupPrefix": "n8n-e2e-",
    "timeoutMs": 30000
  }
}
```

- [ ] **Step 4: Create setup.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/config/e2e.config.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}[1/6] Building node...${NC}"
cd "$ROOT_DIR" && npm run build

echo -e "${YELLOW}[2/6] Starting n8n container...${NC}"
cd "$SCRIPT_DIR" && docker compose up -d --build

echo -e "${YELLOW}[3/6] Waiting for n8n health...${NC}"
N8N_URL="http://localhost:5678"
RETRIES=60
for i in $(seq 1 $RETRIES); do
  if curl -sf "$N8N_URL/healthz" > /dev/null 2>&1; then
    echo -e "${GREEN}n8n is healthy${NC}"
    break
  fi
  if [ "$i" -eq "$RETRIES" ]; then
    echo -e "${RED}n8n failed to start after ${RETRIES}s${NC}"
    docker compose logs
    exit 1
  fi
  sleep 1
done

echo -e "${YELLOW}[4/6] Setting up owner account...${NC}"
OWNER_RESPONSE=$(curl -sf -X POST "$N8N_URL/rest/owner/setup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2e@magnetcustomer.com",
    "password": "<E2E_PASSWORD>",
    "firstName": "E2E",
    "lastName": "Test"
  }' 2>/dev/null) || echo "Owner already exists, skipping"

# Extract cookie for authenticated requests
COOKIE=$(curl -sf -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -D - \
  -d '{"email":"e2e@magnetcustomer.com","password":"<E2E_PASSWORD>"}' \
  2>/dev/null | grep -i 'set-cookie' | head -1 | sed 's/.*: //' | sed 's/;.*//')

echo -e "${YELLOW}[5/6] Generating API key...${NC}"
API_KEY_RESPONSE=$(curl -sf -X POST "$N8N_URL/api/v1/api-keys" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"label":"e2e-test"}' 2>/dev/null)

API_KEY=$(echo "$API_KEY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('apiKey',''))" 2>/dev/null || echo "")

if [ -z "$API_KEY" ]; then
  echo -e "${YELLOW}API key may already exist, trying to list...${NC}"
  API_KEY=$(curl -sf "$N8N_URL/api/v1/api-keys" \
    -H "Cookie: $COOKIE" 2>/dev/null \
    | python3 -c "import sys,json; keys=json.load(sys.stdin); print(keys[0]['apiKey'] if keys else '')" 2>/dev/null || echo "")
fi

if [ -z "$API_KEY" ]; then
  echo -e "${RED}Failed to get API key${NC}"
  exit 1
fi

# Update config with API key
if [ -f "$CONFIG_FILE" ]; then
  python3 -c "
import json
with open('$CONFIG_FILE') as f: cfg = json.load(f)
cfg['n8n']['apiKey'] = '$API_KEY'
with open('$CONFIG_FILE', 'w') as f: json.dump(cfg, f, indent=2)
"
  echo -e "${GREEN}API key saved to config${NC}"
else
  echo -e "${RED}Config file not found: $CONFIG_FILE${NC}"
  echo -e "${YELLOW}Copy e2e.config.example.json to e2e.config.json and fill magnetCustomer credentials${NC}"
  exit 1
fi

echo -e "${YELLOW}[6/6] Provisioning MagnetCustomer credential in n8n...${NC}"
MC_SUB_DOMAIN=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['subDomainAccount'])")
MC_CLIENT_ID=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['clientId'])")
MC_CLIENT_SECRET=$(python3 -c "import json; cfg=json.load(open('$CONFIG_FILE')); print(cfg['magnetCustomer']['clientSecret'])")

curl -sf -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"MagnetCustomer E2E\",
    \"type\": \"magnetCustomerApi\",
    \"data\": {
      \"subDomainAccount\": \"$MC_SUB_DOMAIN\",
      \"email\": \"\",
      \"apiToken\": \"$MC_CLIENT_SECRET\"
    }
  }" > /dev/null 2>&1 || echo "Credential may already exist"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} n8n E2E Ready!${NC}"
echo -e "${GREEN} URL: $N8N_URL${NC}"
echo -e "${GREEN} API Key: ${API_KEY:0:10}...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Run tests:  npm run test:e2e"
echo "Stop:       npm run e2e:infra:stop"
```

- [ ] **Step 5: Create teardown.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping n8n E2E container..."
cd "$SCRIPT_DIR" && docker compose down -v

echo "Done."
```

- [ ] **Step 6: Add to .gitignore**

Append to `.gitignore`:
```
e2e/config/e2e.config.json
```

- [ ] **Step 7: Add scripts to package.json**

Add to `scripts`:
```json
"e2e:infra:start": "cd e2e && bash setup.sh",
"e2e:infra:stop": "cd e2e && bash teardown.sh",
"test:e2e": "jest --config jest.e2e.config.js --runInBand"
```

- [ ] **Step 8: Make scripts executable and commit**

```bash
chmod +x e2e/setup.sh e2e/teardown.sh
git add e2e/Dockerfile e2e/docker-compose.yml e2e/setup.sh e2e/teardown.sh \
  e2e/config/e2e.config.example.json .gitignore package.json
git commit -m "feat(e2e): docker infrastructure + lifecycle scripts"
```

---

### Task 2: Config Reader + Jest E2E Config

**Files:**
- Create: `e2e/helpers/config.ts`
- Create: `jest.e2e.config.js`

- [ ] **Step 1: Create config.ts**

```typescript
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
```

- [ ] **Step 2: Create jest.e2e.config.js**

```javascript
// jest.e2e.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e/tests'],
  testMatch: ['**/*.e2e.test.ts'],
  globalSetup: '<rootDir>/e2e/helpers/globalSetup.ts',
  globalTeardown: '<rootDir>/e2e/helpers/globalTeardown.ts',
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add e2e/helpers/config.ts jest.e2e.config.js
git commit -m "feat(e2e): config reader + jest e2e config"
```

---

### Task 3: n8n REST API Client

**Files:**
- Create: `e2e/helpers/n8nClient.ts`

- [ ] **Step 1: Create n8nClient.ts**

```typescript
// e2e/helpers/n8nClient.ts
import { getConfig } from './config';

interface WorkflowConfig {
  resource: string;
  operation: string;
  params: Record<string, any>;
  credentialId: string;
}

interface ExecutionResult {
  status: 'success' | 'error' | 'waiting';
  output: Record<string, any>[];
  error?: string;
}

async function n8nFetch(path: string, options: RequestInit = {}): Promise<any> {
  const config = getConfig();
  const url = `${config.n8n.url}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': config.n8n.apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`n8n API ${res.status} ${path}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function buildWorkflowJson(wfConfig: WorkflowConfig): object {
  const { resource, operation, params, credentialId } = wfConfig;

  const nodeParams: Record<string, any> = {
    authentication: 'apiToken',
    resource,
    operation,
    ...params,
  };

  return {
    name: `e2e-${resource}-${operation}-${Date.now()}`,
    nodes: [
      {
        parameters: {},
        id: 'trigger-1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [0, 0],
      },
      {
        parameters: nodeParams,
        id: 'mc-1',
        name: 'MagnetCustomer',
        type: '@magnetcustomer/n8n-nodes-magnetcustomer.magnetCustomer',
        typeVersion: 1,
        position: [220, 0],
        credentials: {
          magnetCustomerApi: {
            id: credentialId,
            name: 'MagnetCustomer E2E',
          },
        },
      },
    ],
    connections: {
      'Manual Trigger': {
        main: [[{ node: 'MagnetCustomer', type: 'main', index: 0 }]],
      },
    },
    settings: { executionOrder: 'v1' },
  };
}

function buildTriggerWorkflowJson(
  resource: string,
  action: string,
  credentialId: string,
): object {
  return {
    name: `e2e-trigger-${resource}-${action}-${Date.now()}`,
    nodes: [
      {
        parameters: {
          authentication: 'apiToken',
          resource,
          action,
          incomingAuthentication: 'none',
        },
        id: 'trigger-1',
        name: 'MagnetCustomer Trigger',
        type: '@magnetcustomer/n8n-nodes-magnetcustomer.magnetCustomerTrigger',
        typeVersion: 1,
        position: [0, 0],
        webhookId: `e2e-${Date.now()}`,
        credentials: {
          magnetCustomerApi: {
            id: credentialId,
            name: 'MagnetCustomer E2E',
          },
        },
      },
    ],
    connections: {},
    settings: { executionOrder: 'v1' },
  };
}

export async function createWorkflow(config: WorkflowConfig): Promise<{ id: string }> {
  const body = buildWorkflowJson(config);
  const result = await n8nFetch('/api/v1/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return { id: result.id };
}

export async function createTriggerWorkflow(
  resource: string,
  action: string,
  credentialId: string,
): Promise<{ id: string; webhookPath: string }> {
  const body = buildTriggerWorkflowJson(resource, action, credentialId);
  const result = await n8nFetch('/api/v1/workflows', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const webhookNode = result.nodes?.find((n: any) => n.type?.includes('Trigger'));
  const webhookPath = webhookNode?.webhookId || result.id;

  return { id: result.id, webhookPath };
}

export async function executeAndWait(workflowId: string): Promise<ExecutionResult> {
  const config = getConfig();
  const timeout = config.options.timeoutMs;

  const execResponse = await n8nFetch(`/api/v1/workflows/${workflowId}/run`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  const executionId = execResponse.data?.executionId || execResponse.executionId;
  if (!executionId) {
    throw new Error(`No executionId returned for workflow ${workflowId}`);
  }

  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exec = await n8nFetch(`/api/v1/executions/${executionId}`);

    if (exec.finished || exec.status === 'success' || exec.status === 'error') {
      const lastNode = exec.data?.resultData?.runData?.['MagnetCustomer'];
      const output = lastNode?.[0]?.data?.main?.[0]?.map((item: any) => item.json) || [];

      return {
        status: exec.status === 'error' ? 'error' : 'success',
        output,
        error: exec.data?.resultData?.error?.message,
      };
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`Execution ${executionId} timed out after ${timeout}ms`);
}

export async function activateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}/activate`, { method: 'POST' });
}

export async function deactivateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}/deactivate`, { method: 'POST' });
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}`, { method: 'DELETE' });
}

export async function getWebhookUrl(webhookPath: string): Promise<string> {
  const config = getConfig();
  return `${config.n8n.url}/webhook/${webhookPath}`;
}

/** Track workflow IDs for cleanup */
const createdWorkflowIds: string[] = [];

export function trackWorkflow(id: string): void {
  createdWorkflowIds.push(id);
}

export function getTrackedWorkflows(): string[] {
  return [...createdWorkflowIds];
}

export async function deleteAllTrackedWorkflows(): Promise<number> {
  let deleted = 0;
  for (const id of createdWorkflowIds) {
    try {
      await deleteWorkflow(id);
      deleted++;
    } catch { /* workflow may already be deleted */ }
  }
  createdWorkflowIds.length = 0;
  return deleted;
}

/** Get credential ID by name */
export async function getCredentialId(name: string): Promise<string> {
  const result = await n8nFetch('/api/v1/credentials');
  const cred = result.data?.find((c: any) => c.name === name);
  if (!cred) throw new Error(`Credential "${name}" not found in n8n`);
  return cred.id;
}
```

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/n8nClient.ts
git commit -m "feat(e2e): n8n REST API client"
```

---

### Task 4: MagnetCustomer API Client + Cleanup

**Files:**
- Create: `e2e/helpers/mcClient.ts`
- Create: `e2e/helpers/cleanup.ts`

- [ ] **Step 1: Create mcClient.ts**

```typescript
// e2e/helpers/mcClient.ts
import { getConfig } from './config';

async function mcFetch(
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  qs?: Record<string, any>,
): Promise<any> {
  const config = getConfig();
  const url = new URL(`${config.magnetCustomer.apiUrl}/api${endpoint}`);

  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.magnetCustomer.clientSecret}`,
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
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
```

- [ ] **Step 2: Create cleanup.ts**

```typescript
// e2e/helpers/cleanup.ts
import * as mcClient from './mcClient';
import { getConfig } from './config';

const RESOURCES = [
  'prospects', 'contacts', 'leads', 'deals', 'organizations',
  'tasks', 'staffs', 'tickets', 'treatments', 'meetings',
  'pipelines', 'treatments/workspaces', 'customfields',
  'customfields/blocks', 'meetings/types', 'meetings/rooms',
  'treatments/types',
];

export async function deleteByIds(resource: string, ids: string[]): Promise<number> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await mcClient.del(`/${resource}/${id}`);
      deleted++;
    } catch { /* record may already be deleted */ }
  }
  return deleted;
}

export async function sweepAll(): Promise<{ resource: string; deleted: number }[]> {
  const config = getConfig();
  const prefix = config.options.cleanupPrefix;
  const results: { resource: string; deleted: number }[] = [];

  for (const resource of RESOURCES) {
    try {
      const data = await mcClient.get(`/${resource}`, { search: prefix, limit: 100 });
      const docs = data?.docs || data?.data || (Array.isArray(data) ? data : []);
      const ids = docs
        .filter((d: any) => {
          const name = d.fullname || d.title || d.name || d.subject || '';
          return name.startsWith(prefix);
        })
        .map((d: any) => d._id);

      if (ids.length > 0) {
        const deleted = await deleteByIds(resource, ids);
        results.push({ resource, deleted });
      }
    } catch { /* resource may not support search */ }
  }

  return results;
}
```

- [ ] **Step 3: Commit**

```bash
git add e2e/helpers/mcClient.ts e2e/helpers/cleanup.ts
git commit -m "feat(e2e): MagnetCustomer API client + cleanup helper"
```

---

### Task 5: Workflow Builder

**Files:**
- Create: `e2e/helpers/workflowBuilder.ts`

- [ ] **Step 1: Create workflowBuilder.ts**

This is a convenience layer that builds the `params` object for each resource/operation combo, so test files stay clean.

```typescript
// e2e/helpers/workflowBuilder.ts
import { getConfig } from './config';

const PREFIX = () => getConfig().options.cleanupPrefix;

export function prospectCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'prospect',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Prospect ${Date.now()}`,
      email: `${PREFIX()}prospect-${Date.now()}@test.com`,
      phoneCollection: { phones: [{ number: '+5511999990000' }] },
      gender: 'male', birthDate: '', work: '', maritalStatus: '',
      doc: '', type: 'pf', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function customerCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'customer',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Customer ${Date.now()}`,
      email: `${PREFIX()}customer-${Date.now()}@test.com`,
      phoneCollection: { phones: [] }, gender: '', birthDate: '',
      work: '', maritalStatus: '', doc: '', type: 'pf',
      state: '', city: '', address: '', addressNumber: '',
      complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function leadCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'lead',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Lead ${Date.now()}`,
      email: `${PREFIX()}lead-${Date.now()}@test.com`,
      phoneCollection: { phones: [] }, gender: '', birthDate: '',
      work: '', maritalStatus: '', doc: '', type: 'pf',
      state: '', city: '', address: '', addressNumber: '',
      complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function dealCreate(pipelineId: string, overrides: Record<string, any> = {}) {
  return {
    resource: 'deal',
    operation: 'create',
    params: {
      title: `${PREFIX()}Deal ${Date.now()}`,
      description: 'E2E test deal',
      amount: 1000, expectedCloseDate: '2027-12-31',
      pipeline: pipelineId, stage: '', staff: '',
      associateWith: '', contact: '', organization: '',
      customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function organizationCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'organization',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Org ${Date.now()}`,
      email: `${PREFIX()}org-${Date.now()}@test.com`,
      phoneCollection: { phones: [] }, birthDate: '',
      doc: '', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function taskCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'task',
    operation: 'create',
    params: {
      title: `${PREFIX()}Task ${Date.now()}`,
      observation: 'E2E test task', type: '',
      dateOfExpires: '2027-12-31', associateWith: '',
      deal: '', contact: '', organization: '',
      owner: '', dateFinished: '', status: 'open',
      ...overrides,
    },
  };
}

export function ticketCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'ticket',
    operation: 'create',
    params: {
      subject: `${PREFIX()}Ticket ${Date.now()}`,
      description: 'E2E test ticket', priority: 'medium',
      workspaceReceiver: '', contact: '',
      ...overrides,
    },
  };
}

export function staffCreate(roleId: string, overrides: Record<string, any> = {}) {
  return {
    resource: 'staff',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Staff ${Date.now()}`,
      email: `${PREFIX()}staff-${Date.now()}@test.com`,
      role: roleId, workspaces: [],
      phone: '', whatsAppPhone: '',
      customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}

export function treatmentCreate(typeId: string, contactId: string, overrides: Record<string, any> = {}) {
  return {
    resource: 'treatment',
    operation: 'create',
    params: {
      type: typeId, contact: contactId,
      subject: `${PREFIX()}Treatment ${Date.now()}`,
      nameType: '',
      ...overrides,
    },
  };
}

export function meetingCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'meeting',
    operation: 'create',
    params: {
      title: `${PREFIX()}Meeting ${Date.now()}`,
      start: new Date(Date.now() + 86400000).toISOString(),
      end: new Date(Date.now() + 90000000).toISOString(),
      calendar: '', workspace: '', participants: [],
      staff: '', type: '', room: '', contact: '', branch: '',
      ...overrides,
    },
  };
}

export function pipelineCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'pipeline',
    operation: 'create',
    params: {
      title: `${PREFIX()}Pipeline ${Date.now()}`,
      ...overrides,
    },
  };
}

export function workspaceCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'workspace',
    operation: 'create',
    params: {
      name: `${PREFIX()}Workspace ${Date.now()}`,
      ...overrides,
    },
  };
}

export function customFieldCreate(fieldTypeId: string, overrides: Record<string, any> = {}) {
  return {
    resource: 'customField',
    operation: 'create',
    params: {
      name: `${PREFIX()}CF ${Date.now()}`,
      feature: 'deal', fieldType: fieldTypeId,
      order: 99, values: [], subFieldSettings: '{}', settings: {},
      ...overrides,
    },
  };
}

export function customFieldBlockCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'customFieldBlock',
    operation: 'create',
    params: {
      name: `${PREFIX()}Block ${Date.now()}`,
      feature: 'deal', position: 99,
      isExpanded: true, summaryDisplay: true,
      ...overrides,
    },
  };
}

export function meetingTypeCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'meetingType',
    operation: 'create',
    params: { name: `${PREFIX()}MeetingType ${Date.now()}`, ...overrides },
  };
}

export function meetingRoomCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'meetingRoom',
    operation: 'create',
    params: { name: `${PREFIX()}Room ${Date.now()}`, ...overrides },
  };
}

export function treatmentTypeCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'treatmentType',
    operation: 'create',
    params: { name: `${PREFIX()}TreatmentType ${Date.now()}`, ...overrides },
  };
}

export function getById(resource: string, idParam: string, id: string) {
  return { resource, operation: 'get', params: { [idParam]: id } };
}

export function getAll(resource: string, page = 1, limit = 25) {
  return { resource, operation: 'getAll', params: { page, limit } };
}

export function search(resource: string, query: string, page = 1, limit = 25) {
  return { resource, operation: 'search', params: { search: query, page, limit } };
}

export function deleteById(resource: string, idParam: string, id: string) {
  return { resource, operation: 'delete', params: { [idParam]: id } };
}
```

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/workflowBuilder.ts
git commit -m "feat(e2e): workflow builder for all resources"
```

---

### Task 6: Global Setup + Teardown

**Files:**
- Create: `e2e/helpers/globalSetup.ts`
- Create: `e2e/helpers/globalTeardown.ts`

- [ ] **Step 1: Create globalSetup.ts**

```typescript
// e2e/helpers/globalSetup.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';
import * as mcClient from './mcClient';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

export default async function globalSetup() {
  console.log('\n[E2E Global Setup] Starting...');

  // 1. Load and validate config
  const config = loadConfig();
  console.log(`  n8n: ${config.n8n.url}`);
  console.log(`  MC API: ${config.magnetCustomer.apiUrl}`);

  // 2. Test n8n connectivity
  const n8nHealth = await fetch(`${config.n8n.url}/healthz`).catch(() => null);
  if (!n8nHealth?.ok) {
    throw new Error(`n8n not reachable at ${config.n8n.url}. Run: npm run e2e:infra:start`);
  }
  console.log('  n8n: healthy');

  // 3. Test MC API connectivity
  const mcHealthy = await mcClient.healthCheck();
  if (!mcHealthy) {
    throw new Error(`MagnetCustomer API not reachable at ${config.magnetCustomer.apiUrl}`);
  }
  console.log('  MC API: healthy');

  // 4. Fetch base data
  const context: Record<string, string> = {};

  // Pipeline (use first available)
  try {
    const pipelines = await mcClient.get('/pipelines');
    const list = Array.isArray(pipelines) ? pipelines : pipelines?.data || [];
    if (list.length > 0) {
      context.pipelineId = list[0]._id;
      console.log(`  Pipeline: ${list[0].title || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  Pipeline: not available');
  }

  // Role (use first available)
  try {
    const roles = await mcClient.get('/roles');
    const list = Array.isArray(roles) ? roles : roles?.data || [];
    if (list.length > 0) {
      context.roleId = list[0]._id;
      console.log(`  Role: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  Role: not available');
  }

  // TreatmentType (use first available)
  try {
    const types = await mcClient.get('/treatments/types');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.treatmentTypeId = list[0]._id;
      console.log(`  TreatmentType: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  TreatmentType: not available');
  }

  // CustomFieldType (use first available)
  try {
    const types = await mcClient.get('/customfieldtypes');
    const list = Array.isArray(types) ? types : types?.data || [];
    if (list.length > 0) {
      context.customFieldTypeId = list[0]._id;
      console.log(`  CustomFieldType: ${list[0].name || list[0]._id}`);
    }
  } catch (e) {
    console.warn('  CustomFieldType: not available');
  }

  // n8n credential ID
  try {
    const res = await fetch(`${config.n8n.url}/api/v1/credentials`, {
      headers: { 'X-N8N-API-KEY': config.n8n.apiKey },
    });
    const creds = await res.json();
    const list = creds.data || creds || [];
    const mcCred = list.find((c: any) => c.type === 'magnetCustomerApi');
    if (mcCred) {
      context.credentialId = mcCred.id;
      console.log(`  n8n Credential: ${mcCred.name} (${mcCred.id})`);
    }
  } catch (e) {
    console.warn('  n8n Credential: not found');
  }

  // 5. Save context
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  console.log('[E2E Global Setup] Done.\n');
}
```

- [ ] **Step 2: Create globalTeardown.ts**

```typescript
// e2e/helpers/globalTeardown.ts
import { loadConfig } from './config';
import * as cleanup from './cleanup';
import { deleteAllTrackedWorkflows } from './n8nClient';

export default async function globalTeardown() {
  console.log('\n[E2E Global Teardown] Starting...');

  try {
    loadConfig();
  } catch {
    console.log('  Config not available, skipping cleanup');
    return;
  }

  // 1. Sweep all n8n-e2e-* records
  try {
    const results = await cleanup.sweepAll();
    for (const r of results) {
      console.log(`  Cleaned ${r.deleted} ${r.resource}`);
    }
    if (results.length === 0) {
      console.log('  No test records to clean');
    }
  } catch (e: any) {
    console.warn(`  Cleanup sweep failed: ${e.message}`);
  }

  // 2. Delete tracked workflows
  try {
    const deleted = await deleteAllTrackedWorkflows();
    if (deleted > 0) {
      console.log(`  Deleted ${deleted} workflows from n8n`);
    }
  } catch (e: any) {
    console.warn(`  Workflow cleanup failed: ${e.message}`);
  }

  console.log('[E2E Global Teardown] Done.\n');
}
```

- [ ] **Step 3: Add context file to .gitignore**

Append `e2e/config/.e2e-context.json` to `.gitignore`.

- [ ] **Step 4: Commit**

```bash
git add e2e/helpers/globalSetup.ts e2e/helpers/globalTeardown.ts .gitignore
git commit -m "feat(e2e): global setup + teardown"
```

---

### Task 7: Test Helper — loadContext utility

**Files:**
- Create: `e2e/helpers/testContext.ts`

- [ ] **Step 1: Create testContext.ts**

Utility for test suites to load the context saved by globalSetup and share state.

```typescript
// e2e/helpers/testContext.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, getConfig } from './config';

const CONTEXT_FILE = path.resolve(__dirname, '../config/.e2e-context.json');

interface E2EContext {
  pipelineId?: string;
  roleId?: string;
  treatmentTypeId?: string;
  customFieldTypeId?: string;
  credentialId?: string;
}

let ctx: E2EContext | null = null;

export function getE2EContext(): E2EContext {
  if (ctx) return ctx;

  loadConfig();

  if (!fs.existsSync(CONTEXT_FILE)) {
    throw new Error('E2E context not found. Run globalSetup first.');
  }

  ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
  return ctx!;
}

export function getCredentialId(): string {
  const c = getE2EContext();
  if (!c.credentialId) throw new Error('No credential ID in E2E context');
  return c.credentialId;
}
```

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/testContext.ts
git commit -m "feat(e2e): test context loader"
```

---

### Task 8: First Test Suite — Prospect E2E (smoke test to validate infra)

**Files:**
- Create: `e2e/tests/prospect.e2e.test.ts`

- [ ] **Step 1: Create prospect.e2e.test.ts**

```typescript
// e2e/tests/prospect.e2e.test.ts
import * as n8nClient from '../helpers/n8nClient';
import * as wb from '../helpers/workflowBuilder';
import { getCredentialId } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
const workflowIds: string[] = [];
const createdIds: string[] = [];

beforeAll(() => {
  credentialId = getCredentialId();
});

afterAll(async () => {
  for (const id of workflowIds) {
    try { await n8nClient.deleteWorkflow(id); } catch {}
  }
});

async function run(config: { resource: string; operation: string; params: Record<string, any> }) {
  const wf = await n8nClient.createWorkflow({ ...config, credentialId });
  workflowIds.push(wf.id);
  n8nClient.trackWorkflow(wf.id);
  return n8nClient.executeAndWait(wf.id);
}

describe('Prospect E2E', () => {
  let prospectId: string;

  it('create — returns the created prospect', async () => {
    const result = await run(wb.prospectCreate());

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBeDefined();
    expect(result.output[0].fullname).toContain(getConfig().options.cleanupPrefix);

    prospectId = result.output[0]._id;
    createdIds.push(prospectId);
  });

  it('get — returns prospect by ID', async () => {
    const result = await run(wb.getById('prospect', 'prospectId', prospectId));

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]._id).toBe(prospectId);
  });

  it('getAll — returns paginated list', async () => {
    const result = await run(wb.getAll('prospect'));

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
    expect(result.output[0]).toHaveProperty('docs');
  });

  it('search — finds prospect by name', async () => {
    const result = await run(wb.search('prospect', getConfig().options.cleanupPrefix));

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('update — returns the updated prospect', async () => {
    const result = await run({
      resource: 'prospect',
      operation: 'update',
      params: {
        prospectId,
        fullname: `${getConfig().options.cleanupPrefix}Updated Prospect`,
        email: '', phoneCollection: {}, owners: '', customFieldCollection: {},
        gender: '', birthDate: '', work: '', maritalStatus: '',
        doc: '', type: '', state: '', city: '', address: '',
        addressNumber: '', complement: '', neighborhood: '', cep: '',
      },
    });

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });

  it('delete — returns success', async () => {
    const result = await run(wb.deleteById('prospect', 'prospectId', prospectId));

    expect(result.status).toBe('success');
    expect(result.output).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Validate manually — start infra and run single suite**

```bash
npm run e2e:infra:start
npm run test:e2e -- --testPathPattern=prospect
```

Expected: 6 tests passing.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/prospect.e2e.test.ts
git commit -m "feat(e2e): prospect E2E test suite"
```

---

### Task 9: Customer + Lead E2E Suites

**Files:**
- Create: `e2e/tests/customer.e2e.test.ts`
- Create: `e2e/tests/lead.e2e.test.ts`

Same pattern as prospect — replace resource name, ID param, and builder function. Each suite: create, get, getAll, search, update, delete.

- [ ] **Step 1: Create customer.e2e.test.ts** — same structure as prospect, using `wb.customerCreate()`, `customerId` param.

- [ ] **Step 2: Create lead.e2e.test.ts** — same structure as prospect, using `wb.leadCreate()`, `leadId` param.

- [ ] **Step 3: Run and verify**

```bash
npm run test:e2e -- --testPathPattern="customer|lead"
```

- [ ] **Step 4: Commit**

```bash
git add e2e/tests/customer.e2e.test.ts e2e/tests/lead.e2e.test.ts
git commit -m "feat(e2e): customer + lead E2E test suites"
```

---

### Task 10: Deal + Organization + Task E2E Suites

**Files:**
- Create: `e2e/tests/deal.e2e.test.ts`
- Create: `e2e/tests/organization.e2e.test.ts`
- Create: `e2e/tests/task.e2e.test.ts`

Deal uses `pipelineId` from E2E context. Task may associate with a contact. Organization is independent.

- [ ] **Step 1: Create deal.e2e.test.ts** — uses `getE2EContext().pipelineId`, `wb.dealCreate(pipelineId)`, `dealId` param.

- [ ] **Step 2: Create organization.e2e.test.ts** — uses `wb.organizationCreate()`, `organizationId` param.

- [ ] **Step 3: Create task.e2e.test.ts** — uses `wb.taskCreate()`, `taskId` param.

- [ ] **Step 4: Run and verify**

```bash
npm run test:e2e -- --testPathPattern="deal|organization|task"
```

- [ ] **Step 5: Commit**

```bash
git add e2e/tests/deal.e2e.test.ts e2e/tests/organization.e2e.test.ts e2e/tests/task.e2e.test.ts
git commit -m "feat(e2e): deal + organization + task E2E suites"
```

---

### Task 11: Staff + Ticket + Treatment + Meeting E2E Suites

**Files:**
- Create: `e2e/tests/staff.e2e.test.ts`
- Create: `e2e/tests/ticket.e2e.test.ts`
- Create: `e2e/tests/treatment.e2e.test.ts`
- Create: `e2e/tests/meeting.e2e.test.ts`

Staff uses `roleId`, Treatment uses `treatmentTypeId` + `contactId` from context.

- [ ] **Step 1: Create all 4 suites** following the same CRUD pattern.

- [ ] **Step 2: Run and verify**

```bash
npm run test:e2e -- --testPathPattern="staff|ticket|treatment|meeting"
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/staff.e2e.test.ts e2e/tests/ticket.e2e.test.ts \
  e2e/tests/treatment.e2e.test.ts e2e/tests/meeting.e2e.test.ts
git commit -m "feat(e2e): staff + ticket + treatment + meeting E2E suites"
```

---

### Task 12: Pipeline + Workspace + Simple Types E2E Suites

**Files:**
- Create: `e2e/tests/pipeline.e2e.test.ts`
- Create: `e2e/tests/workspace.e2e.test.ts`
- Create: `e2e/tests/meetingType.e2e.test.ts`
- Create: `e2e/tests/meetingRoom.e2e.test.ts`
- Create: `e2e/tests/treatmentType.e2e.test.ts`

All independent, simple name-only resources.

- [ ] **Step 1: Create all 5 suites.**

- [ ] **Step 2: Run and verify**

```bash
npm run test:e2e -- --testPathPattern="pipeline|workspace|meetingType|meetingRoom|treatmentType"
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/pipeline.e2e.test.ts e2e/tests/workspace.e2e.test.ts \
  e2e/tests/meetingType.e2e.test.ts e2e/tests/meetingRoom.e2e.test.ts \
  e2e/tests/treatmentType.e2e.test.ts
git commit -m "feat(e2e): pipeline + workspace + simple types E2E suites"
```

---

### Task 13: CustomField + CustomFieldBlock + CustomFieldType E2E Suites

**Files:**
- Create: `e2e/tests/customField.e2e.test.ts`
- Create: `e2e/tests/customFieldBlock.e2e.test.ts`
- Create: `e2e/tests/customFieldType.e2e.test.ts`

CustomField uses `customFieldTypeId` from context. CustomFieldType is read-only (getAll + search only).

- [ ] **Step 1: Create all 3 suites.**

- [ ] **Step 2: Run and verify**

```bash
npm run test:e2e -- --testPathPattern="customField"
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/customField.e2e.test.ts e2e/tests/customFieldBlock.e2e.test.ts \
  e2e/tests/customFieldType.e2e.test.ts
git commit -m "feat(e2e): customField suites (field + block + type)"
```

---

### Task 14: Trigger E2E Suite

**Files:**
- Create: `e2e/tests/trigger.e2e.test.ts`

- [ ] **Step 1: Create trigger.e2e.test.ts**

```typescript
// e2e/tests/trigger.e2e.test.ts
import * as n8nClient from '../helpers/n8nClient';
import { getCredentialId } from '../helpers/testContext';
import { getConfig } from '../helpers/config';

let credentialId: string;
const workflowIds: string[] = [];

beforeAll(() => {
  credentialId = getCredentialId();
});

afterAll(async () => {
  for (const id of workflowIds) {
    try { await n8nClient.deactivateWorkflow(id); } catch {}
    try { await n8nClient.deleteWorkflow(id); } catch {}
  }
});

describe('Trigger — simulated webhook', () => {
  it('receives and processes a simulated deal.added event', async () => {
    const { id, webhookPath } = await n8nClient.createTriggerWorkflow(
      'deal', 'added', credentialId,
    );
    workflowIds.push(id);

    await n8nClient.activateWorkflow(id);

    const webhookUrl = await n8nClient.getWebhookUrl(webhookPath);
    const payload = {
      event: 'deal.added',
      data: { _id: 'test-deal-1', title: 'Simulated Deal' },
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.ok).toBe(true);
  });

  it('receives a simulated prospect.updated event', async () => {
    const { id, webhookPath } = await n8nClient.createTriggerWorkflow(
      'prospect', 'updated', credentialId,
    );
    workflowIds.push(id);

    await n8nClient.activateWorkflow(id);

    const webhookUrl = await n8nClient.getWebhookUrl(webhookPath);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'prospect.updated',
        data: { _id: 'p1', fullname: 'Updated Prospect' },
      }),
    });

    expect(res.ok).toBe(true);
  });
});

const isRealTrigger = (() => {
  try { return getConfig().options.triggerMode === 'real'; } catch { return false; }
})();

(isRealTrigger ? describe : describe.skip)('Trigger — real webhook', () => {
  it('receives a real webhook when a deal is created in MC API', async () => {
    const { id } = await n8nClient.createTriggerWorkflow('deal', 'added', credentialId);
    workflowIds.push(id);

    await n8nClient.activateWorkflow(id);

    // Wait briefly for webhook registration to propagate
    await new Promise((r) => setTimeout(r, 2000));

    // Create a real deal via MC API — should trigger webhook
    const { post } = await import('../helpers/mcClient');
    const deal = await post('/deals', {
      title: `${getConfig().options.cleanupPrefix}Trigger Test ${Date.now()}`,
      source: 'n8n-e2e',
    });

    // Poll for execution
    const config = getConfig();
    const start = Date.now();
    while (Date.now() - start < config.options.timeoutMs) {
      const res = await fetch(
        `${config.n8n.url}/api/v1/executions?workflowId=${id}&status=success`,
        { headers: { 'X-N8N-API-KEY': config.n8n.apiKey } },
      );
      const execs = await res.json();
      if (execs.data?.length > 0) {
        expect(execs.data.length).toBeGreaterThan(0);
        return;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    throw new Error('No webhook execution received within timeout');
  });
});
```

- [ ] **Step 2: Run and verify**

```bash
npm run test:e2e -- --testPathPattern=trigger
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/trigger.e2e.test.ts
git commit -m "feat(e2e): trigger E2E suite (simulated + conditional real)"
```

---

### Task 15: Full Suite Run + Final Commit

- [ ] **Step 1: Run all E2E tests**

```bash
npm run test:e2e
```

Expected: 19 suites, ~107 tests, all passing.

- [ ] **Step 2: Run unit tests to confirm no regression**

```bash
npm test
```

Expected: 50 tests, all passing.

- [ ] **Step 3: Final commit with all adjustments**

```bash
git add -A
git commit -m "feat(e2e): complete E2E testing infrastructure — 19 suites, ~107 tests

Docker-based E2E that provisions n8n with the MagnetCustomer community
node installed, creates workflows via REST API, executes against the
real MagnetCustomer API, and validates output.

Configurable for E2E local, staging or production via config file."
```
