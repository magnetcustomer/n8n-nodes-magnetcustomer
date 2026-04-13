<div align="center">
  <img src="./assets/cover.svg" alt="Magnet Customer for n8n" width="100%">

  <br/><br/>

  ![License](https://img.shields.io/github/license/magnetcustomer/n8n-nodes-magnetcustomer)
  ![npm version](https://img.shields.io/npm/v/%40magnetcustomer%2Fn8n-nodes-magnetcustomer)
  ![Downloads](https://img.shields.io/npm/dt/%40magnetcustomer%2Fn8n-nodes-magnetcustomer)
  [![n8n](https://img.shields.io/badge/n8n-community-F94B72)](https://community.n8n.io/)

  **[English](docs/en/MIGRATION_V1_TO_V2.md)** | **[Portugues](docs/pt-br/MIGRATION_V1_TO_V2.md)** | **[Espanol](docs/es/MIGRATION_V1_TO_V2.md)**
</div>

# n8n-nodes-magnetcustomer

[n8n](https://n8n.io/) community node for [Magnet Customer](https://magnetcustomer.com) CRM. Automate leads, deals, contacts, tasks, and more in your n8n workflows.

## Quick Start

### Installation

1. In n8n, go to **Settings > Community Nodes**
2. Search for `@magnetcustomer/n8n-nodes-magnetcustomer`
3. Click **Install**

### Configuration

1. Go to **Credentials > New Credential > Magnet Customer API**
2. Enter your **Subdomain** (e.g., `mycompany` — your URL is `mycompany.magnetcustomer.com`)
3. Enter your **API Token** (generated in **Settings > API** within your Magnet Customer account)

## Available Resources

| Resource | Get | Get Many | Search | Create | Update | Delete |
|----------|:---:|:--------:|:------:|:------:|:------:|:------:|
| Customer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prospect | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organization | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staff | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pipeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workspace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom Field | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom Field Block | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom Field Type | — | ✅ | ✅ | — | — | — |
| Ticket | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting Room | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Treatment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Treatment Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Custom Field Type** is read-only (Get Many + Search only).

## Usage Examples

### Create a Lead with Custom Fields

1. Add a **Magnet Customer** node to your workflow
2. Set **Resource** to `Lead` and **Operation** to `Create`
3. Fill in the required fields: **Name**, **Email**, and **Pipeline**
4. Under **Additional Fields**, add the `customFields` collection with your field IDs and values
5. Connect the node to your trigger (e.g., a webhook receiving form submissions)

### Search Contacts and Update Deal Stage

1. Add a **Magnet Customer** node — Resource: `Customer`, Operation: `Search`
2. Enter the search term (e.g., company name or email)
3. Connect to a second **Magnet Customer** node — Resource: `Deal`, Operation: `Update`
4. Map the customer ID from step 1 to the deal's contact field
5. Set the new pipeline stage in the update body

## Custom Fields

### Resolve Custom Fields (GET operations)

Enable the **Resolve Custom Fields** toggle on `Get` and `Get Many` operations for Customer, Deal, Organization, Prospect, and Lead resources. When active, custom field IDs are automatically resolved to their names and option labels in the output — making downstream data processing straightforward without extra transformation nodes.

### Encode Custom Fields (UPDATE operations)

Enable the **Encode Custom Fields** toggle on `Update` operations for the same resources. When active, you can pass human-readable field names and option labels; the node encodes them to the API format (`{ customField: "<ObjectId>", v: <value> }`) before sending the request.

> **Note (v1.8.3+):** Option loaders return the pure `ObjectId` of each custom field (without the legacy `customField_` prefix). Workflows using the old prefix continue to work — the node sanitizes the value automatically.

## Migration from 1.x

Version 2.0 introduces changes for full V2 API compatibility:

| Aspect | v1.x | v2.0 |
|--------|------|------|
| Create endpoints | `/import/leads`, `/import/contacts`, etc. | `/leads`, `/contacts`, etc. |
| Source tracking | Header `api: 'n8n'` | Body field `source: 'n8n'` |
| Platform support | V1 + V2 | V2 only |

**No workflow changes needed for basic usage** — the endpoint mapping is handled internally by the node.

**Important:** If your workflows relied on the **built-in deduplication** from v1.x (where creating a contact with an existing CPF would merge instead of duplicate), you now need to implement a Search → IF → Create/Update pattern. See the full [Migration Guide](docs/MIGRATION_V1_TO_V2.md) for details.

## API Reference

Full API documentation is available at [apireference.magnetcustomer.com](https://apireference.magnetcustomer.com).

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOTFOUND` | Incorrect subdomain | Verify your subdomain in credentials (just the name, e.g., `mycompany`) |
| `401 Unauthorized` | Invalid or expired API token | Generate a new token in **Settings > API** |
| `400 Bad Request` | Missing required fields | Check the [API Reference](https://apireference.magnetcustomer.com) for required parameters |
| `404 Not Found` | Resource does not exist | Verify the resource ID is correct |

## Compatibility

Tested on n8n version **1.62.0+**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE.md) — Magnet Customer

## Support

- [API Reference](https://apireference.magnetcustomer.com)
- [GitHub Issues](https://github.com/magnetcustomer/n8n-nodes-magnetcustomer/issues)
- Email: suporte@magnetcustomer.com
