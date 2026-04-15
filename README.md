<div align="center">
  <img src="./assets/cover.svg" alt="Magnet Customer for n8n" width="100%">

  <br/><br/>

  ![npm version](https://img.shields.io/npm/v/%40magnetcustomer%2Fn8n-nodes-magnetcustomer)
  ![License](https://img.shields.io/github/license/magnetcustomer/n8n-nodes-magnetcustomer)
  ![Downloads](https://img.shields.io/npm/dt/%40magnetcustomer%2Fn8n-nodes-magnetcustomer)
  [![n8n](https://img.shields.io/badge/n8n-community-F94B72)](https://community.n8n.io/)
</div>

# Magnet Customer — n8n Community Node

[n8n](https://n8n.io/) community node for [Magnet Customer](https://magnetcustomer.com) CRM. Automate leads, deals, contacts, tasks, and more in your n8n workflows.

## Installation

```bash
npm install @magnetcustomer/n8n-nodes-magnetcustomer
```

Or install via the n8n UI:

1. Go to **Settings > Community Nodes**
2. Search for `@magnetcustomer/n8n-nodes-magnetcustomer`
3. Click **Install**

## Authentication

Two authentication methods are supported:

- **API Token** — Generate in **Settings > API** within your Magnet Customer account
- **OAuth2** — Configure OAuth2 credentials for server-to-server flows

## Configuration

1. Go to **Credentials > New Credential > Magnet Customer API**
2. Enter your **Subdomain** (`subDomainAccount`) — e.g., `mycompany` (your URL is `mycompany.magnetcustomer.com`)
3. Enter your **API Token**

## Available Resources

| Resource | Create | Get | Get Many | Update | Delete | Search |
|----------|:------:|:---:|:--------:|:------:|:------:|:------:|
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
| Custom Field Type | — | — | ✅ | — | — | ✅ |
| Ticket | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting Room | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meeting Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Treatment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Treatment Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Custom Field Type** is read-only (Get Many + Search only).

## Testing

### Unit Tests

```bash
npm test
```

65 unit tests covering all resources, operations, and edge cases.

### E2E Tests

```bash
npm run test:e2e
```

105 end-to-end tests that run against a real Magnet Customer API instance via Docker.

#### E2E Setup

1. Copy the config template:
   ```bash
   cp e2e/config/e2e.config.example.json e2e/config/e2e.config.json
   ```
2. Fill in your credentials in `e2e/config/e2e.config.json`
3. Start the E2E infrastructure:
   ```bash
   npm run e2e:infra:start
   ```
4. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

## Migration from 1.x

Version 2.0 introduces changes for full V2 API compatibility:

| Aspect | v1.x | v2.0 |
|--------|------|------|
| Create endpoints | `/import/leads`, `/import/contacts`, etc. | `/leads`, `/contacts`, etc. |
| Source tracking | Header `api: 'n8n'` | Body field `source: 'n8n'` |
| Platform support | V1 + V2 | V2 only |

See the full [Migration Guide](docs/MIGRATION_V1_TO_V2.md) for details.

## API Reference

Full API documentation is available at [apireference.magnetcustomer.com](https://apireference.magnetcustomer.com).

## Compatibility

Tested on n8n version **1.62.0+**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## License

[MIT](LICENSE.md) — Magnet Customer

## Support

- [API Reference](https://apireference.magnetcustomer.com)
- [GitHub Issues](https://github.com/magnetcustomer/n8n-nodes-magnetcustomer/issues)
- Email: suporte@magnetcustomer.com
