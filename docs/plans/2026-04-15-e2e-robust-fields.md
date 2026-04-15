# E2E Robust Fields — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task.

**Goal:** Make all 19 E2E test suites pass against any tenant by discovering required fields dynamically and generating fake data by field type.

**Architecture:** `globalSetup` discovers required fields for every feature (contact, deal, org, etc.), generates test values per field type, and saves to context. `workflowBuilder` consumes these values. All hardcoded params removed.

---

## Diagnostic Summary (from API tests)

| Resource | API Test | Missing Fields |
|----------|----------|---------------|
| Customer | FAIL | `lifeCycle: 'customer'` explicit + phone validation (10+ digits) |
| Deal | FAIL | `stage` + `staff` + custom CFs (Fee %, Origem) |
| Task | FAIL | `dateOfExpires` required by schema |
| Meeting | FAIL | Custom required fields on meeting |
| Pipeline | FAIL | `staff` required by schema |
| Staff | FAIL | `role` not found (empty in globalSetup) |
| Ticket | OK | Works |
| Treatment | OK | Works (with type + contact) |
| TreatmentType | OK | Works |
| MeetingType | 404 | Endpoint not available in this n8n build |
| MeetingRoom | 404 | Endpoint not available in this n8n build |
| CustomField | TBD | Need debugging |
| CustomFieldBlock | TBD | Need debugging |

---

### Task 1: Dynamic Required Field Discovery Engine

**Files:**
- Create: `e2e/helpers/fieldDiscovery.ts`

Build a module that queries the MC API to discover all required fields for any feature/lifecycle and generates appropriate test values.

- [ ] **Step 1: Create fieldDiscovery.ts**

```typescript
// e2e/helpers/fieldDiscovery.ts

interface DiscoveredField {
  _id: string;
  name: string;
  slug: string;
  fieldType: string;
  system: boolean;
  value: string; // Generated test value
}

/**
 * Discover required custom fields for a feature and generate test values.
 * Works with any tenant — no hardcoding.
 */
export async function discoverRequiredFields(
  apiUrl: string,
  token: string,
  feature: string,
  lifecycle?: string, // 'prospect' | 'customer' | 'lead' — for contact feature
): Promise<DiscoveredField[]> {
  const url = `${apiUrl}/api/customfields?feature=${feature}&creatable=true`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const fields = Array.isArray(data) ? data : data?.docs || data?.data || [];
  const result: DiscoveredField[] = [];

  for (const f of fields) {
    const s = f.settings || {};
    if (!s.required) continue;
    if (f.system) continue; // system fields handled by node params (fullname, title, etc.)

    // Check lifecycle-specific requirement
    if (lifecycle && Array.isArray(s.requiredWhen) && s.requiredWhen.length > 0) {
      if (!s.requiredWhen.includes(lifecycle)) continue;
    }

    const fieldType = f.fieldTypeSlug || '';
    const value = generateTestValue(fieldType, f);

    if (value !== null) {
      result.push({
        _id: f._id,
        name: f.name,
        slug: f.slug,
        fieldType,
        system: f.system || false,
        value,
      });
    }
  }

  return result;
}

/**
 * Generate a test value based on field type.
 * Returns the value to use in customFields { customField, v } format.
 */
function generateTestValue(fieldType: string, field: any): string | null {
  switch (fieldType) {
    case 'enum':
      // Use first option value ID
      return field.values?.[0]?._id || null;

    case 'set':
      // Use first option value ID
      return field.values?.[0]?._id || null;

    case 'varchar':
    case 'text':
      return 'n8n-e2e-test';

    case 'phone':
      return '+5511999990000';

    case 'link':
      return 'https://test.magnetcustomer.com';

    case 'date':
      return '2027-01-01';

    case 'time':
      return '10:00';

    case 'monetary':
    case 'double':
      return '1000';

    default:
      // Unknown type — try first value if enum-like, else text
      if (field.values?.length > 0) {
        return field.values[0]._id;
      }
      return 'n8n-e2e-test';
  }
}

/**
 * Convert discovered fields to n8n customFieldCollection format.
 * { _id, v } — the node's addCustomFields() converts _id → customField.
 */
export function toCustomFieldCollection(fields: DiscoveredField[]): { customFields: Array<{ _id: string; v: string }> } {
  return {
    customFields: fields.map(f => ({ _id: f._id, v: f.value })),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/fieldDiscovery.ts
git commit -m "feat(e2e): dynamic required field discovery engine"
```

---

### Task 2: Update globalSetup to use fieldDiscovery for ALL features

**Files:**
- Modify: `e2e/helpers/globalSetup.ts`
- Modify: `e2e/helpers/testContext.ts`

- [ ] **Step 1: Update globalSetup.ts**

Replace the per-lifecycle custom field discovery section with a comprehensive discovery:

```typescript
// In globalSetup, after fetching base data:

import { discoverRequiredFields } from './fieldDiscovery';

// Discover required fields for each feature/lifecycle
const featureConfigs = [
  { feature: 'contact', lifecycle: 'prospect', key: 'requiredFields_prospect' },
  { feature: 'contact', lifecycle: 'customer', key: 'requiredFields_customer' },
  { feature: 'contact', lifecycle: 'lead', key: 'requiredFields_lead' },
  { feature: 'deal', key: 'requiredFields_deal' },
  { feature: 'organization', key: 'requiredFields_organization' },
  { feature: 'staff', key: 'requiredFields_staff' },
  { feature: 'meeting', key: 'requiredFields_meeting' },
  { feature: 'task', key: 'requiredFields_task' },
  { feature: 'ticket', key: 'requiredFields_ticket' },
];

for (const cfg of featureConfigs) {
  const fields = await discoverRequiredFields(
    config.magnetCustomer.apiUrl, apiToken, cfg.feature, cfg.lifecycle
  );
  if (fields.length > 0) {
    context[cfg.key] = JSON.stringify(fields);
    console.log(`  Required fields (${cfg.key}): ${fields.map(f => f.name).join(', ')}`);
  }
}
```

Also discover additional base data:
- **Role**: fix the query to find an actual role (filter by name not empty)
- **Stage**: already fetched, verify it's in context
- **TaskType**: fetch first task type for task creation
- **Staff for deals/pipelines**: the API requires `staff` — use the logged-in user's staff ID

- [ ] **Step 2: Update testContext.ts**

Add `getRequiredFieldsForFeature(feature, lifecycle?)` that reads from context:

```typescript
export function getRequiredFieldsForFeature(
  feature: string,
  lifecycle?: string,
): Array<{ _id: string; v: string }> {
  const c = getE2EContext();
  const key = lifecycle
    ? `requiredFields_${lifecycle}`
    : `requiredFields_${feature}`;
  const raw = (c as any)[key];
  if (!raw) return [];
  try {
    const fields = JSON.parse(raw);
    return fields.map((f: any) => ({ _id: f._id, v: f.value }));
  } catch { return []; }
}
```

- [ ] **Step 3: Commit**

---

### Task 3: Fix workflowBuilder for ALL resources

**Files:**
- Modify: `e2e/helpers/workflowBuilder.ts`

Fix each builder based on the diagnostic:

- [ ] **Step 1: Fix contact builders (prospect/customer/lead)**

- Phone must have 10+ digits: `+5511999990000` (already OK)
- Use `getRequiredFieldsForFeature('contact', lifecycle)` for custom fields

- [ ] **Step 2: Fix dealCreate**

- Add `staff` from context (staffId discovered in globalSetup)
- Use `getRequiredFieldsForFeature('deal')` for deal custom fields

- [ ] **Step 3: Fix taskCreate**

- `dateOfExpires` is required by API schema — set default `'2027-12-31'`
- `type` should use taskTypeId from context

- [ ] **Step 4: Fix meetingCreate**

- Use `getRequiredFieldsForFeature('meeting')` for meeting custom fields
- Ensure `participants` is `[]` not undefined

- [ ] **Step 5: Fix pipelineCreate**

- Add `staff` from context
- Include `stages` array: `[{ name: 'Stage 1', probability: 0, position: 0 }]`

- [ ] **Step 6: Fix staffCreate**

- `role` must be a valid ObjectId — use `roleId` from context
- `workspaces` should be `[]`

- [ ] **Step 7: Skip meetingType/meetingRoom suites if 404**

- Add a check in the test suites: if the API returns 404 for the endpoint, skip the suite

- [ ] **Step 8: Commit**

---

### Task 4: Fix test suites for resources with special behavior

**Files:**
- Modify: `e2e/tests/customer.e2e.test.ts`
- Modify: `e2e/tests/deal.e2e.test.ts`
- Modify: `e2e/tests/staff.e2e.test.ts`
- Modify: `e2e/tests/meetingType.e2e.test.ts`
- Modify: `e2e/tests/meetingRoom.e2e.test.ts`

- [ ] **Step 1: Fix customer test** — the n8n node sets lifeCycle internally via the `/contacts` endpoint. Verify the builder sends all required customer fields.

- [ ] **Step 2: Fix deal test** — use pipelineId AND stageId from context.

- [ ] **Step 3: Fix staff test** — ensure roleId is available and valid.

- [ ] **Step 4: Make meetingType/meetingRoom conditional** — skip if the API returns 404 (not all n8n builds include these endpoints).

- [ ] **Step 5: Commit**

---

### Task 5: Fix setup.sh for full automation

**Files:**
- Modify: `e2e/setup.sh`

- [ ] **Step 1: Add staff discovery** — after creating credential, fetch the logged-in user's staff ID:
```bash
STAFF_ID=$(curl -sf "$MC_API_URL/api/staffs/me" -H "Authorization: Bearer $MC_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('_id',''))")
```
Save to context for deal/pipeline creation.

- [ ] **Step 2: Commit**

---

### Task 6: Full E2E run and iterate

- [ ] **Step 1: Start Docker** — `npm run e2e:infra:start`
- [ ] **Step 2: Run all suites** — `npm run test:e2e`
- [ ] **Step 3: Fix remaining failures** — iterate on specific resources
- [ ] **Step 4: Final commit with all passing suites**
- [ ] **Step 5: Push**
