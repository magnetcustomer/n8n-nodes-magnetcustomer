# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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