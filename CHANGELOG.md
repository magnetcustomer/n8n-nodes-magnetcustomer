# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
*   **Custom Field Block Resource**:
    *   Added operations: Get, Get Many, Create, Update, Delete.
*   **Custom Field Type Resource**:
    *   Added operations: Get, Get Many.
    *   Implemented `loadOptions` for selecting `Custom Field Type` in Custom Field creation/update.
*   Generic function `magnetCustomerApiRequestAllItems` to handle API pagination.

### Changed

*   Refactored load options methods (`getRoles`, `getStaffIds`, etc.) to use `magnetCustomerApiRequestAllItems` where applicable to fetch all results.
*   Improved structure for resource descriptions and requests.

### Fixed

*   Corrected duplicate `value` property in `getCustomFieldTypes` load options method.
*   Removed duplicate closing bracket in `PipelineDescription.ts`. 