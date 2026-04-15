# Plano de Melhoria: API + Node n8n

**Data:** 2026-04-15
**Contexto:** Descobertas durante validação E2E do n8n-nodes-magnetcustomer contra a API real

---

## Diagnóstico

| # | Problema | Onde | Impacto |
|---|---------|------|---------|
| 1 | Node envia `""` para campos de referência (contact, staff, deal, organization) | **Node** | API rejeita com Cast to ObjectId error |
| 2 | Node não envia `lifeCycle` para customer create via `/contacts` | **Node** | API rejeita com "lifeCycle is required" |
| 3 | API rejeita `""` em vez de ignorar campos vazios | **API** | Qualquer integração que envie campos opcionais vazios falha |
| 4 | Campos system required sem `fieldRef` não são descobríveis via `/customfields` | **API** | Integrações não conseguem saber quais campos preencher |
| 5 | API exige `staff` no deal create mas o campo não é passado pelo n8n node | **Node** | Deal create via n8n falha em tenants que obrigam staff |
| 6 | API exige `type` (taskType) no task create mas node envia `""` quando não preenchido | **Node** | Task create falha quando taskType não é selecionado |
| 7 | Pipeline create exige `staff` no schema mas node não envia | **Node** | Pipeline create via n8n impossível |

---

## Parte 1: Melhorias no Node (n8n-nodes-magnetcustomer)

### 1.1 Filtrar campos de referência vazios no body

**Problema:** O node coleta TODOS os parâmetros do formulário n8n e envia no body, incluindo campos opcionais com `""`. A API interpreta `""` como um ObjectId inválido.

**Solução:** No `GenericFunctions.ts` ou em cada `*Request.ts`, filtrar campos que são referências (ObjectId) e estão vazios antes de enviar.

**Implementação (opção A — centralizado em GenericFunctions):**
```javascript
// Em magnetCustomerApiRequest, antes de enviar:
// Remover campos com string vazia que são referências de ObjectId
const refFields = ['contact', 'organization', 'staff', 'deal', 'owner', 'owners',
                   'pipeline', 'stage', 'type', 'room', 'calendar', 'workspace',
                   'workspaceReceiver', 'branch'];
if (body) {
  for (const field of refFields) {
    if (body[field] === '' || body[field] === undefined) {
      delete body[field];
    }
  }
  // owners: filtrar array com valores vazios
  if (Array.isArray(body.owners)) {
    body.owners = body.owners.filter(o => o !== '' && o !== undefined);
    if (body.owners.length === 0) delete body.owners;
  }
}
```

**Implementação (opção B — em cada Request.ts):**
Em cada `*Request.ts`, no case `create`, envolver o body num helper:
```javascript
body = stripEmptyRefs(body);
```

**Recomendação:** Opção A — uma única mudança no ponto central.

**Resources afetados:** Deal, Task, Ticket, Meeting, Staff, Treatment, Customer, Lead, Prospect

### 1.2 Enviar `lifeCycle` explícito para customer/lead/prospect

**Problema:** `CustomerRequest.ts` usa `/contacts` sem `lifeCycle`. A API V2 refatorada exige `lifeCycle` explícito.

**Solução:** Já implementado para customer. Verificar se lead e prospect precisam do mesmo (usam endpoints dedicados `/leads` e `/prospects` que setam lifeCycle no controller, então provavelmente OK).

**Status:** Customer ✅ corrigido. Lead e Prospect ✅ OK (endpoints dedicados).

### 1.3 Campos obrigatórios da API que o node não expõe

**Problema:** Alguns campos são obrigatórios na API mas o node não oferece como parâmetro (ex: `staff` no deal/pipeline, `type` no task).

**Solução:** Estes campos já existem como parâmetros opcionais no node. O problema é que quando o usuário não preenche, o node envia `""`. O fix 1.1 resolve isso. Para tenants que obrigam esses campos, o usuário deve preencher no n8n.

### 1.4 Publicar v2.1.2 com os fixes

Após implementar 1.1 e 1.2, publicar nova versão:
- `lifeCycle: 'customer'` no CustomerRequest
- Filtro de referências vazias no body
- MAGNETCUSTOMER_API_BASE_URL env override

---

## Parte 2: Melhorias na API (platform-api)

### 2.1 Tratar campos de referência vazios como null/undefined

**Problema:** A API recebe `contact: ""` e tenta fazer Cast to ObjectId, falhando. Campos opcionais com string vazia deveriam ser tratados como ausentes.

**Solução:** No middleware de sanitização ou no controller base, normalizar strings vazias em campos de referência para `undefined`.

**Implementação:**
```javascript
// middleware/sanitizeBody.js ou no controller genérico
const REFERENCE_FIELDS = ['contact', 'organization', 'staff', 'deal', 'owner',
                          'pipeline', 'stage', 'type', 'room', 'calendar',
                          'workspace', 'workspaceReceiver', 'branch'];

function sanitizeEmptyRefs(body) {
  for (const field of REFERENCE_FIELDS) {
    if (body[field] === '' || body[field] === null) {
      delete body[field];
    }
  }
  if (Array.isArray(body.owners)) {
    body.owners = body.owners.filter(o => o && o !== '');
    if (body.owners.length === 0) delete body.owners;
  }
  return body;
}
```

**Onde aplicar:** Nos controllers de Deal, Task, Ticket, Meeting, Treatment, ou como middleware global.

**Impacto:** Resolve o problema para TODAS as integrações (n8n, Zapier, API direta), não apenas o node n8n.

### 2.2 Tornar campos system required descobríveis via API

**Problema:** Campos system com `required: true` mas sem `fieldRef` (campos system custom do tenant) não aparecem na query `GET /customfields?feature=deal&creatable=true` com informação suficiente para saber que precisam ser enviados via customFields.

**Solução:**
1. Adicionar endpoint `GET /api/customfields/required?feature={feature}&lifecycle={lifecycle}` que retorna TODOS os campos required (incluindo system custom) com informação de como preencher
2. Ou: garantir que campos system required sem `fieldRef` apareçam na listagem com `creatable: true` e informação de tipo/formato

**Prioridade:** Média — afeta apenas integrações que fazem discovery automático.

### 2.3 Endpoint `/contacts` aceitar sem `lifeCycle` explícito

**Problema:** O endpoint `POST /contacts` no controller refatorado exige `lifeCycle` explícito, diferente do comportamento anterior onde cada rota (`/customers`, `/prospects`, `/leads`) setava o lifeCycle automaticamente.

**Solução:** O `contactController.factory.js` já seta `req.body.lifeCycle = lifecycle` no controller criado por `createContactController(app, 'customer')`. Verificar se a rota `/contacts` genérica usa o controller com lifecycle default `'customer'` ou se precisa de tratamento especial.

**Status:** O node n8n agora envia `lifeCycle: 'customer'` explicitamente, então o problema está contornado. Mas a API deveria ter um default para não quebrar integrações existentes.

### 2.4 Validação de `staff` no deal create

**Problema:** O schema do deal exige `staff` como obrigatório, mas nem todas as integrações sabem qual staff usar.

**Solução:**
1. Se `staff` não for enviado, usar o staff do token JWT (req._staff)
2. Ou: remover `staff` como required no schema e setar default para o user autenticado

**Implementação no controller:**
```javascript
if (!req.body.staff && req._staff?._id) {
  req.body.staff = req._staff._id;
}
```

**Impacto:** Resolve deal create para TODAS as integrações que não enviam staff.

---

## Priorização

### Quick Wins (1-2h cada)

| # | O que | Onde | Impacto |
|---|-------|------|---------|
| **1** | Filtrar referências vazias no node | Node | Resolve ticket, task, meeting E2E |
| **2** | Sanitizar refs vazias na API | API | Resolve para TODAS integrações |
| **3** | Default `staff` do JWT no deal/pipeline | API | Resolve deal/pipeline create sem staff |

### Médio Prazo

| # | O que | Onde | Impacto |
|---|-------|------|---------|
| **4** | Endpoint de campos required | API | Discovery automático para integrações |
| **5** | Default `lifeCycle` no POST /contacts | API | Compatibilidade backward |
| **6** | Publicar node v2.1.2 | Node | Users recebem fixes |

### Longo Prazo

| # | O que | Onde | Impacto |
|---|-------|------|---------|
| **7** | CI/CD para E2E tests | Node | Testes rodam automaticamente |
| **8** | E2E com tenant minimal (sem CFs custom required) | Infra | Testes passam em qualquer tenant |

---

## Resultado esperado após Quick Wins

Com os items 1-3 implementados:

| Suite | Atual | Esperado |
|-------|-------|----------|
| Prospect | 6/6 PASS | 6/6 PASS |
| Lead | 6/6 PASS | 6/6 PASS |
| Customer | 6/6 PASS | 6/6 PASS |
| Organization | 6/6 PASS | 6/6 PASS |
| Workspace | 6/6 PASS | 6/6 PASS |
| Deal | 2/6 PASS | 6/6 PASS |
| Task | 2/6 PASS | 6/6 PASS |
| Ticket | 2/6 PASS | 6/6 PASS |
| Staff | 2/6 PASS | 6/6 PASS |
| Meeting | 2/6 PASS | 6/6 PASS |
| Treatment | 4/6 PASS | 6/6 PASS |
| Pipeline | 2/6 PASS | 4-6/6 PASS |
| CustomField | 2/6 PASS | 6/6 PASS |
| CustomFieldBlock | 0/6 PASS | 6/6 PASS |
| TreatmentType | 5/6 PASS | 6/6 PASS |
| CustomFieldType | 2/2 PASS | 2/2 PASS |
| Trigger | 1/1 PASS | 1/1 PASS |
| MeetingType/Room | skip | skip |
| **Total** | **~68/105** | **~95+/105** |
