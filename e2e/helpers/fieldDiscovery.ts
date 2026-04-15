// e2e/helpers/fieldDiscovery.ts

export interface DiscoveredField {
  _id: string;
  name: string;
  slug: string;
  fieldType: string;
  system: boolean;
  value: string;
}

/**
 * Discover required custom fields for a feature and generate test values.
 * Works with any tenant — no hardcoding.
 *
 * @param apiUrl  - MC API base URL (e.g. http://localhost:3001)
 * @param token   - Bearer token for API auth
 * @param feature - Feature slug: contact, deal, organization, staff, meeting, task, ticket
 * @param lifecycle - For contact feature: prospect | customer | lead
 */
export async function discoverRequiredFields(
  apiUrl: string,
  token: string,
  feature: string,
  lifecycle?: string,
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

    // Check lifecycle-specific requirement for contact feature
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
      return field.values?.[0]?._id || null;

    case 'set':
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
 * { _id, v } — the node's addCustomFields() converts _id -> customField.
 */
export function toCustomFieldCollection(fields: DiscoveredField[]): { customFields: Array<{ _id: string; v: string }> } {
  return {
    customFields: fields.map(f => ({ _id: f._id, v: f.value })),
  };
}
