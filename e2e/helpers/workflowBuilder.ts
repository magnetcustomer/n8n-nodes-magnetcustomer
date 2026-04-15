// e2e/helpers/workflowBuilder.ts
import { getConfig } from './config';
import {
  getRequiredFieldsForFeature,
  getE2EContext,
  getStaffId,
  getTaskTypeId,
  getStageId,
} from './testContext';

const PREFIX = () => getConfig().options.cleanupPrefix;

/** Merge required custom fields from globalSetup with any test-provided ones */
function contactCustomFields(lifecycle: 'prospect' | 'customer' | 'lead', overrideFields: any[] = []): { customFields: any[] } {
  const required = getRequiredFieldsForFeature('contact', lifecycle);
  return { customFields: [...required, ...overrideFields] };
}

/** Build customFieldCollection for any feature */
function featureCustomFields(feature: string, overrideFields: any[] = []): { customFields: any[] } {
  const required = getRequiredFieldsForFeature(feature);
  return { customFields: [...required, ...overrideFields] };
}

/** Default phone for contact-like resources (phones is often required) */
const DEFAULT_PHONE = { phones: [{ number: '+5511999990000' }] };

export function prospectCreate(overrides: Record<string, any> = {}) {
  return {
    resource: 'prospect',
    operation: 'create',
    params: {
      fullname: `${PREFIX()}Prospect ${Date.now()}`,
      email: `${PREFIX()}prospect-${Date.now()}@test.com`,
      phoneCollection: DEFAULT_PHONE,
      gender: '', birthDate: '', work: '', maritalStatus: '',
      doc: '', type: 'pf', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: contactCustomFields('prospect'),
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
      phoneCollection: DEFAULT_PHONE,
      gender: '', birthDate: '', work: '', maritalStatus: '',
      doc: '', type: 'pf', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: contactCustomFields('customer'),
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
      phoneCollection: DEFAULT_PHONE,
      gender: '', birthDate: '', work: '', maritalStatus: '',
      doc: '', type: 'pf', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: contactCustomFields('lead'),
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
      pipeline: pipelineId, stage: getStageId(), staff: getStaffId(),
      associateWith: '', contact: '', organization: '',
      customFieldCollection: featureCustomFields('deal'),
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
      phoneCollection: DEFAULT_PHONE, birthDate: '',
      doc: '', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: featureCustomFields('organization'),
      ...overrides,
    },
  };
}

export function taskCreate(overrides: Record<string, any> = {}) {
  const typeId = getTaskTypeId();
  return {
    resource: 'task',
    operation: 'create',
    params: {
      title: `${PREFIX()}Task ${Date.now()}`,
      observation: 'E2E test task', type: typeId,
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
      customFieldCollection: featureCustomFields('staff'),
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
      customFieldCollection: featureCustomFields('meeting'),
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
  // id must be non-empty for n8n 2.x workflow activation validation
  return { resource, operation: 'get', params: { [idParam]: id || 'placeholder' } };
}

export function getAll(resource: string, page = 1, limit = 25) {
  return { resource, operation: 'getAll', params: { page, limit } };
}

export function search(resource: string, query: string, page = 1, limit = 25) {
  return { resource, operation: 'search', params: { search: query, page, limit } };
}

export function deleteById(resource: string, idParam: string, id: string) {
  return { resource, operation: 'delete', params: { [idParam]: id || 'placeholder' } };
}

/** Update for contact-like resources with all required params */
export function contactUpdate(resource: string, idParam: string, id: string, overrides: Record<string, any> = {}) {
  return {
    resource,
    operation: 'update',
    params: {
      [idParam]: id || 'placeholder',
      fullname: `${PREFIX()}Updated ${Date.now()}`,
      email: '', phoneCollection: DEFAULT_PHONE,
      gender: '', birthDate: '', work: '', maritalStatus: '',
      doc: '', type: '', state: '', city: '', address: '',
      addressNumber: '', complement: '', neighborhood: '', cep: '',
      owners: '', customFieldCollection: { customFields: [] },
      ...overrides,
    },
  };
}
