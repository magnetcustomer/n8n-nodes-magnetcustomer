<div>


![License](https://img.shields.io/npm/l/n8n-nodes-magnetcustomer)
[![n8n](https://img.shields.io/badge/n8n-community-F94B72)](https://community.n8n.io/)
![dt](https://img.shields.io/npm/dt/n8n-nodes-magnetcustomer)
![dw](https://img.shields.io/npm/dw/n8n-nodes-magnetcustomer)

</div>

<div><img src="./assets/cover.png" alt="Magnet Customer"></div>

# n8n-nodes-magnetcustomer

This is a [N8n](https://community.n8n.io) community node. It allows you to use [Magnet Customer API](https://developers.magnetcustomer.com) api to communicate with CRM Magnet Customer in your workflow.

## Available Resources

This node provides operations for the following Magnet Customer resources:

*   **Customer** (Get, Get Many, Search, Create, Update, Delete)
*   **Deal** (Get, Get Many, Search, Create, Update, Delete)
*   **Lead** (Get, Get Many, Search, Create, Update, Delete)
*   **Organization** (Get, Get Many, Search, Create, Update, Delete)
*   **Prospect** (Get, Get Many, Search, Create, Update, Delete)
*   **Task** (Get, Get Many, Search, Create, Update, Delete)
*   **Staff** (Get, Get Many, Search, Create, Update, Delete) - Including loading Roles and Custom Fields.
*   **Workspace** (Get, Get Many, Search, Create, Update, Delete)
*   **Pipeline** (Get, Get Many, Search, Create, Update, Delete) - Including filtering, sorting, and detailed updates with stages.
*   **Custom Field** (Get, Get Many, Search, Create, Update, Delete)
*   **Custom Field Block** (Get, Get Many, Search, Create, Update, Delete)
*   **Custom Field Type** (Get, Get Many, Search)

# Compatibility

Tested on n8n version 1.62.0

# License
[MIT](./LICENSE.md)

## Notas de Compatibilidade – Custom Fields

- A partir da versão 1.8.3, os carregadores de opções de campos customizados passam a retornar o `ObjectId` puro dos campos (sem o prefixo `customField_`).
- Fluxos existentes que ainda utilizam valores com o prefixo `customField_` continuam funcionando: o node sanitiza o valor automaticamente antes de enviar à API.
- Formato enviado ao backend: cada item em `customFields` é `{ customField: "<ObjectId>", v: <valor> }`.
