/**
 * Dynamic required field discovery for any MagnetCustomer tenant.
 *
 * Uses `GET /api/customfields?feature={feature}&required=true&requiredWhen={lifecycle}`
 * which returns all fields the API will validate, including system fields.
 *
 * Fields with `fieldRef` (e.g. dealObj.title) are handled by the n8n node's
 * standard parameters and are skipped. Fields WITHOUT fieldRef need to be
 * sent via customFields in the request body.
 */

export interface DiscoveredField {
  _id: string;
  name: string;
  slug: string;
  fieldType: string;
  system: boolean;
  value: string;
  /** How to send this field: 'customField' in the customFields array, or 'bodyProperty' as top-level body key */
  sendAs: 'customField' | 'bodyProperty';
}

export async function discoverRequiredFields(
  apiUrl: string,
  token: string,
  feature: string,
  lifecycle?: string,
): Promise<DiscoveredField[]> {
  // Build query using the existing API filter support
  const params = new URLSearchParams({ feature, required: 'true' });
  if (lifecycle) params.set('requiredWhen', lifecycle);

  const res = await fetch(`${apiUrl}/api/customfields?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const fields = Array.isArray(data) ? data : data?.docs || data?.data || [];
  const result: DiscoveredField[] = [];

  for (const f of fields) {
    // Fields with fieldRef are system fields handled by node params
    // (e.g. dealObj.title → node sends 'title', dealObj.staff → node sends 'staff')
    if (f.fieldRef) continue;

    // Resolve field type — the API populates fieldType as an object
    const fieldTypeObj = f.fieldType || {};
    const fieldType = typeof fieldTypeObj === 'object'
      ? (fieldTypeObj.fieldType || '')
      : String(fieldTypeObj);

    const value = generateTestValue(fieldType, f);
    if (value === null) continue;

    // System fields without fieldRef are validated by slug in the body (top-level),
    // NOT in the customFields array. Non-system fields go in customFields.
    const sendAs = f.system ? 'bodyProperty' : 'customField';

    result.push({
      _id: f._id,
      name: f.name,
      slug: f.slug,
      fieldType,
      system: f.system || false,
      value,
      sendAs,
    });
  }

  return result;
}

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
      if (field.values?.length > 0) return field.values[0]._id;
      return 'n8n-e2e-test';
  }
}

/** Fields that go in the customFields array ({ _id, v } format for addCustomFields) */
export function toCustomFieldCollection(
  fields: DiscoveredField[],
): { customFields: Array<{ _id: string; v: string }> } {
  const cfFields = fields.filter((f) => f.sendAs === 'customField');
  return { customFields: cfFields.map((f) => ({ _id: f._id, v: f.value })) };
}

/** Fields that go as top-level body properties (slug → value) */
export function toBodyProperties(fields: DiscoveredField[]): Record<string, string> {
  const bodyFields = fields.filter((f) => f.sendAs === 'bodyProperty');
  const result: Record<string, string> = {};
  for (const f of bodyFields) {
    result[f.slug] = f.value;
  }
  return result;
}
