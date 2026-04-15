# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] — 2026-04-15

### Fixed

- **Empty reference fields causing API errors:** Fields like `contact`, `staff`, `deal`, `organization` were being sent as `""` (empty string) when left blank, causing Cast to ObjectId errors. Now these fields are omitted from the request body when empty.
- **Customer create missing `lifeCycle`:** The `/contacts` endpoint requires explicit `lifeCycle: 'customer'` which was not being sent.
- **Task create rejected by API:** The `source: 'n8n'` field was not a valid enum value in the Task schema. Removed from task create body.
- **CustomFieldBlock getAll/search error:** The `feature` parameter was being read directly from node params instead of the `filters` collection, causing "parameter not found" errors.
- **MAGNETCUSTOMER_API_BASE_URL:** Added environment variable override for the API base URL, enabling Docker/E2E environments where the API is not at the standard URL.

### Added

- **E2E testing infrastructure:** Docker-based E2E tests that provision n8n, create workflows via API, execute against the real MagnetCustomer API, and validate output. 19 test suites, 105 tests.
- **Dynamic field discovery:** E2E tests discover required fields per tenant dynamically, generating test values by field type. Works with any tenant configuration.

## [2.1.1] — 2026-04-14

### Fixed

- **Response returning `[]` on create/update:** Prospect, Customer and Lead operations were destructuring the API response as `{contact}`, but the API returns the object directly. This caused all POST/PUT operations on these resources to return empty arrays instead of the created/updated record.

### Added

- **Test suite:** Jest + ts-jest infrastructure with 50 tests covering the full n8n execute() flow. Tests mock only the HTTP layer and use real n8n helpers (returnJsonArray, constructExecutionMetaData) to catch bugs exactly as users would experience them.

## [2.0.0] — 2026-04-13

### BREAKING CHANGES

- **Endpoints migrated to V2 API:** All create operations now use direct endpoints (`/leads`, `/contacts`, `/deals`, etc.) instead of import endpoints (`/import/leads`, `/import/contacts`, etc.). Requires MagnetCustomer platform V2.
- **Source tracking:** Integration source moved from HTTP header (`api: 'n8n'`) to request body (`source: 'n8n'`). Contacts created via n8n are now properly tracked with `source: 'n8n'` in the CRM.
- **V1 no longer supported:** This version requires MagnetCustomer platform V2. Customers on V1 should use version 1.9.x.

### Changed

- API reference URL updated to `https://apireference.magnetcustomer.com`

### Removed

- Postman V1 collection (947KB) — use [API Reference](https://apireference.magnetcustomer.com) instead

### Documentation

- Enterprise README with resources table, examples, migration guide, troubleshooting
- Added CONTRIBUTING.md, SECURITY.md
- Updated LICENSE copyright to Magnet Customer
- Updated CODE_OF_CONDUCT to Contributor Covenant v2.1
- Added GitHub issue/PR templates

## [1.8.2] - 2025-10-07

### Changed

*   Pipeline: adicionados controles de paginação opcionais (`page` em Get Many quando `returnAll=false` e `page/limit` em Search).
*   Custom Field: adicionados `page/limit` opcionais em Search (alinhado com Get Many).

## [1.8.0] - 2025-10-07

### Added

*   New resources for n8n node:
    *   Meetings: get, get many, search, create, update, delete.
    *   Tickets: get, get many, search, create, update, delete.
    *   Treatments: get, get many, search, create, update, delete.
*   Pagination optionality applied to new resources (page/limit only when > 0).

## [1.8.1] - 2025-10-07

### Added

*   Sub-resources:
    *   Meeting Types: get, get many, search, create, update, delete.
    *   Meeting Rooms: get, get many, search, create, update, delete.
    *   Treatment Types: get, get many, search, create, update, delete.

## [1.7.4] - 2025-10-06

### Changed

*   Paginação opcional em todos os resources (Get Many e Search): `page`/`limit` deixaram de ser obrigatórios nos forms e, quando `0` ou não preenchidos, não são enviados ao backend.
*   Atualizados os forms de Search para incluir `page`/`limit` em: Deal, Customer, Organization, Lead, Task, Prospect, Staff. Em `CustomField`, `limit` também ficou disponível em Search.

### Fixed

*   Search de Deals: corrigido envio de `page` indefinido que causava erro "Error extra { "parameterName": "page" }". Agora `page`/`limit` só são enviados quando informados (> 0).

## [1.7.0] - 2025-04-28

### Added

*   **Pipeline Resource**:
    *   Added operations: Get, Get Many, Create, Update, Delete.
    *   Added filtering (search, emailsEmpty, phonesEmpty, interactionsEmpty) and sorting (sortBy, sortType) for Get Many.
    *   Implemented detailed Update operation including `title`, `defaultView`, `roles`, `staffs`, and `stages` (with name, probability, position, active, won, lost).
*   **Staff Resource**:
    *   Added operations: Get, Get Many, Search, Create, Update, Delete.
    *   Implemented `loadOptions` for selecting `Role ID`.
    *   Implemented `loadOptions` for `Custom Fields` specific to Staff.
*   **Workspace Resource**:
    *   Added operations: Get, Get Many, Search, Create, Update, Delete.
*   **Custom Field Resource**:
    *   Added operations: Get, Get Many, Create, Update, Delete.
    *   Added Search operation.
    *   Added filtering (search, feature, creatableWhen, emailsEmpty, phonesEmpty, interactionsEmpty) and sorting (sortBy, sortType) for Get Many.
    *   Implemented `loadOptions` for selecting `Custom Field Type`.
    *   Added support for `values`, `subFieldSettings`, and `settings` fields.
*   **Custom Field Block Resource**:
    *   Added operations: Get, Get Many, Create, Update, Delete.
    *   Added Search operation.
    *   Added filtering (search, feature, emailsEmpty, phonesEmpty, interactionsEmpty) and sorting (sortBy, sortType) for Get Many.
    *   Added `isExpanded` and `summaryDisplay` fields.
*   **Custom Field Type Resource**:
    *   Added operations: Get, Get Many, Search.
    *   Added filtering (search, emailsEmpty, phonesEmpty, interactionsEmpty) and sorting (sortBy, sortType) for Get Many/Search.
*   Generic function `magnetCustomerApiRequestAllItems` to handle API pagination.

### Changed

*   Refactored `Update` operations for Customer, Lead, Prospect, Deal, Organization, Task, Staff, Workspace, Pipeline, Custom Field, Custom Field Block to support partial updates.
*   Refactored `Create` operations to log raw API response and return full response object.
*   Refactored `loadOptions` methods (`getRoles`, `getStaffIds`, `getCustomFieldTypes`, etc.) to use `magnetCustomerApiRequestAllItems` where applicable to fetch all results.
*   Refactored request functions (`*Request.ts`) to handle API calls and responses more consistently within operation blocks.

### Fixed

*   Corrected duplicate `value` property in `getCustomFieldTypes` load options method.
*   Removed duplicate closing bracket in `PipelineDescription.ts`.
*   Fixed ESLint errors related to alphabetical sorting and property order. 

## [1.8.3] - 2025-10-13

### Changed

*   Loaders de Custom Fields (Customer, Prospect, Lead, Deal, Organization): agora retornam `value` como `ObjectId` puro (sem prefixo `customField_`).

### Fixed

*   Sanitização em `addCustomFields`: remoção automática do prefixo `customField_` quando presente, garantindo compatibilidade com fluxos existentes e alinhamento com o backend (`customField` deve ser `ObjectId`).