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
