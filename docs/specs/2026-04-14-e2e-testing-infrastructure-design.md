# E2E Testing Infrastructure — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Scope:** n8n-nodes-magnetcustomer

## Overview

End-to-end testing infrastructure that provisions n8n in Docker with the MagnetCustomer community node installed, creates workflows via n8n REST API, executes them against the real MagnetCustomer API, and validates the output — catching bugs exactly as users experience them in production.

Configurable to run against any environment (E2E local, staging, production) via external config file.

## Architecture

### Directory Structure

```
n8n-nodes-magnetcustomer/
├── e2e/
│   ├── docker-compose.yml          # n8n container definition
│   ├── Dockerfile                  # n8n base image
│   ├── setup.sh                    # Start container, health check, provision credentials
│   ├── teardown.sh                 # Stop container, cleanup volumes
│   ├── config/
│   │   ├── e2e.config.example.json # Template with empty credentials (committed)
│   │   └── e2e.config.json         # Real values per environment (gitignored)
│   ├── helpers/
│   │   ├── n8nClient.ts            # n8n REST API client (workflows, executions, credentials)
│   │   ├── mcClient.ts             # MagnetCustomer API client (setup, verification, cleanup)
│   │   ├── cleanup.ts              # Delete records with n8n-e2e-* prefix
│   │   ├── globalSetup.ts          # Validate config, create base data, save IDs
│   │   └── globalTeardown.ts       # Full cleanup of test data
│   ├── workflows/
│   │   └── templates/              # Reusable workflow JSON templates
│   └── tests/
│       ├── prospect.e2e.test.ts
│       ├── customer.e2e.test.ts
│       ├── lead.e2e.test.ts
│       ├── deal.e2e.test.ts
│       ├── organization.e2e.test.ts
│       ├── task.e2e.test.ts
│       ├── staff.e2e.test.ts
│       ├── ticket.e2e.test.ts
│       ├── treatment.e2e.test.ts
│       ├── meeting.e2e.test.ts
│       ├── pipeline.e2e.test.ts
│       ├── workspace.e2e.test.ts
│       ├── customField.e2e.test.ts
│       ├── customFieldBlock.e2e.test.ts
│       ├── customFieldType.e2e.test.ts
│       ├── meetingType.e2e.test.ts
│       ├── meetingRoom.e2e.test.ts
│       ├── treatmentType.e2e.test.ts
│       └── trigger.e2e.test.ts
├── __tests__/                      # Unit/integration tests (existing)
└── jest.e2e.config.js              # Jest config for E2E (separate from unit)
```

### Container Setup

**Dockerfile:**
```dockerfile
FROM docker.n8n.io/n8nio/n8n:latest
```

The community node is installed via Docker volume mount of the compiled `dist/` directory — no image rebuild needed when code changes.

**docker-compose.yml:**
```yaml
services:
  n8n:
    build: .
    ports:
      - "5678:5678"
    environment:
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_SECURE_COOKIE=false
      - N8N_RUNNERS_ENABLED=false
    volumes:
      - ../dist:/home/node/.n8n/custom/node_modules/@magnetcustomer/n8n-nodes-magnetcustomer/dist
      - ../package.json:/home/node/.n8n/custom/node_modules/@magnetcustomer/n8n-nodes-magnetcustomer/package.json
```

## Configuration

**e2e.config.example.json (committed):**
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

- `magnetCustomer.*` — filled manually by the developer (OAuth credentials from the MagnetCustomer API)
- `n8n.apiKey` — filled automatically by `setup.sh` during provisioning
- `options.triggerMode` — `"simulated"` (default) or `"real"` (requires network access from API to n8n)

## Lifecycle

### setup.sh

1. Run `npm run build` to compile the node
2. `docker compose up -d` to start n8n
3. Health check loop — poll `GET /healthz` until 200 (timeout 60s)
4. Create owner account via n8n setup endpoint (`POST /rest/owner/setup` with email/password/firstName/lastName). If already set up (409), skip.
5. Generate API key via `POST /api/v1/api-keys` and save to `e2e.config.json` (`n8n.apiKey`). Requires the owner cookie from step 4.
6. Provision MagnetCustomer credential in n8n via `POST /api/v1/credentials` using `magnetCustomer.*` values from config
7. Print "Ready" with n8n URL

### teardown.sh

1. Delete all workflows created during tests
2. `docker compose down -v`

### Package.json scripts

```json
{
  "e2e:infra:start": "cd e2e && bash setup.sh",
  "e2e:infra:stop": "cd e2e && bash teardown.sh",
  "test:e2e": "jest --config jest.e2e.config.js --runInBand"
}
```

`--runInBand` required because tests share a single n8n instance and MagnetCustomer API — sequential execution prevents conflicts.

## Test Flow

### Per-test pattern

```
1. n8nClient.createWorkflow()
   → Builds workflow JSON: [Manual Trigger] → [MagnetCustomer Node (operation X)]
   → Creates via POST /api/v1/workflows

2. n8nClient.executeAndWait(workflowId)
   → POST /api/v1/workflows/{id}/run
   → Polls GET /api/v1/executions/{id} until finished
   → Returns parsed output items

3. Assert on output
   → Data present (not [])
   → Correct fields and values
   → _id defined for create operations

4. Cleanup
   → Track created IDs in array
   → afterAll: delete via mcClient + delete workflow in n8n
```

### Data lifecycle

- All test records use prefix `n8n-e2e-` in name/title/subject fields
- Each suite tracks created IDs for cleanup in `afterAll`
- `globalTeardown` does a final sweep: deletes any remaining `n8n-e2e-*` records and all test workflows

### Test order within each suite

`create → get → getAll → search → update → delete` — sequential. Each test can use records created by the previous one.

## Helpers

### n8nClient.ts

| Method | Description |
|--------|-------------|
| `createWorkflow(config)` | Builds workflow JSON with MagnetCustomer node configured for the given resource/operation/params, creates via API, returns workflow ID |
| `executeAndWait(workflowId)` | Executes workflow, polls for completion, returns `{ status, output }` |
| `activateWorkflow(workflowId)` | Activates workflow (for trigger tests) |
| `deactivateWorkflow(workflowId)` | Deactivates workflow |
| `deleteWorkflow(workflowId)` | Deletes workflow |
| `getWebhookUrl(workflowId)` | Returns the webhook URL for a trigger workflow |

### mcClient.ts

| Method | Description |
|--------|-------------|
| `request(method, endpoint, body?)` | Generic HTTP request to MagnetCustomer API with auth |
| `get(endpoint)` | GET request |
| `post(endpoint, body)` | POST request |
| `put(endpoint, body)` | PUT request |
| `delete(endpoint)` | DELETE request |

### cleanup.ts

| Method | Description |
|--------|-------------|
| `deleteByPrefix(resource, ids)` | Deletes specific records by ID via mcClient |
| `sweepAll()` | Searches all resources for `n8n-e2e-*` records and deletes them |

## Global Setup and Teardown

### globalSetup.ts

1. Read and validate `e2e.config.json` — fail fast with clear message if fields missing
2. Test connectivity to n8n (`GET /healthz`)
3. Test connectivity to MagnetCustomer API (`GET /api/health`)
4. Fetch or create base data needed by dependent suites:
   - A pipeline (for deal tests)
   - A role (for staff tests)
   - A treatmentType (for treatment tests)
   - A customFieldType (for customField tests)
   - A contact (for task/ticket/treatment association)
5. Save IDs to global context (file-based, read by tests)

### globalTeardown.ts

1. Run `cleanup.sweepAll()` — delete all `n8n-e2e-*` records across all resources
2. Delete all workflows created during the test run
3. Report cleanup summary

## Test Coverage

### 19 suites, ~107 tests

| Suite | Operations | Tests | Dependencies |
|-------|-----------|-------|--------------|
| prospect | create, get, getAll, search, update, delete | 6 | — |
| customer | create, get, getAll, search, update, delete | 6 | — |
| lead | create, get, getAll, search, update, delete | 6 | — |
| deal | create, get, getAll, search, update, delete | 7 | pipeline (globalSetup) |
| organization | create, get, getAll, search, update, delete | 6 | — |
| task | create, get, getAll, search, update, delete | 6 | contact (globalSetup) |
| staff | create, get, getAll, search, update, delete | 6 | role (globalSetup) |
| ticket | create, get, getAll, search, update, delete | 6 | contact (globalSetup) |
| treatment | create, get, getAll, search, update, delete | 6 | treatmentType + contact (globalSetup) |
| meeting | create, get, getAll, search, update, delete | 6 | — |
| pipeline | create, get, getAll, search, update, delete | 6 | — |
| workspace | create, get, getAll, search, update, delete | 6 | — |
| customField | create, get, getAll, search, update, delete | 6 | customFieldType (globalSetup) |
| customFieldBlock | create, get, getAll, search, update, delete | 6 | — |
| customFieldType | getAll, search | 2 | — (read-only) |
| meetingType | create, get, getAll, search, update, delete | 6 | — |
| meetingRoom | create, get, getAll, search, update, delete | 6 | — |
| treatmentType | create, get, getAll, search, update, delete | 6 | — |
| trigger | simulated webhook (always), real webhook (conditional) | 4 | — |

### Execution order

```
Phase 1 — globalSetup:
  Validate config, test connectivity, create base data

Phase 2 — Independent suites (any order):
  prospect, customer, lead, organization, pipeline,
  workspace, customFieldBlock, meetingType, meetingRoom,
  treatmentType, customFieldType

Phase 3 — Dependent suites (use globalSetup IDs):
  deal, task, staff, ticket, treatment, meeting, customField

Phase 4 — Trigger

Phase 5 — globalTeardown:
  Delete all n8n-e2e-* records, delete test workflows
```

## Trigger Testing

### Simulated mode (default)

1. Create workflow with MagnetCustomer Trigger node (resource + action)
2. Activate workflow (registers webhook in n8n)
3. POST directly to n8n webhook URL with simulated payload
4. Assert: n8n received and processed the event, output contains data
5. Deactivate workflow (removes webhook)

### Real mode (E2E_TRIGGER_REAL=true or config.options.triggerMode=real)

1. Same setup — workflow with Trigger active
2. Instead of simulated POST, create a real record via mcClient
3. Poll n8n executions until the webhook execution appears
4. Assert: n8n received the real webhook from MagnetCustomer API
5. Cleanup: delete record + deactivate workflow

Real mode requires network access from MagnetCustomer API to n8n (shared Docker network for local E2E, or public URL for staging).

Conditional execution in tests:
```typescript
const isRealTrigger = config.options.triggerMode === 'real';

describe('Trigger — simulated webhook', () => { /* always runs */ });
(isRealTrigger ? describe : describe.skip)('Trigger — real webhook', () => { /* conditional */ });
```

## Out of Scope

- CI/CD pipeline integration (can be added later)
- MagnetCustomer API container (uses external API via config)
- Auto-rebuild of node on code changes (developer runs `npm run build`)
- Performance/load testing

## Jest E2E Config

```javascript
// jest.e2e.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e/tests'],
  testMatch: ['**/*.e2e.test.ts'],
  globalSetup: '<rootDir>/e2e/helpers/globalSetup.ts',
  globalTeardown: '<rootDir>/e2e/helpers/globalTeardown.ts',
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: false }],
  },
};
```
