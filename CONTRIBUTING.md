# Contributing to n8n-nodes-magnetcustomer

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/n8n-nodes-magnetcustomer.git`
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Link to n8n for testing: `npm link`

## Development

### Project Structure

```
credentials/          # n8n credential types
nodes/MagnetCustomer/ # Node implementation
  GenericFunctions.ts # API client, helpers
  *Request.ts         # Resource-specific operations
  MagnetCustomer.node.ts      # Main node definition
  MagnetCustomerTrigger.node.ts # Webhook trigger
```

### Building

```bash
npm run build    # Compile TypeScript
npm run lint     # Run ESLint
```

### Testing Locally

1. Build the node: `npm run build`
2. Link to your n8n instance: `npm link`
3. In your n8n directory: `npm link @magnetcustomer/n8n-nodes-magnetcustomer`
4. Restart n8n

## Pull Requests

1. Create a branch: `git checkout -b feature/my-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`
3. Include a clear description of what changed and why
4. Link related issues using `Closes #123`

## Adding a New Resource

1. Create `nodes/MagnetCustomer/NewResourceRequest.ts`
2. Add the resource to `MagnetCustomer.node.ts` (properties + execute switch)
3. Add operations (get, getAll, create, update, delete, search)
4. Follow existing patterns in `LeadRequest.ts` as reference

## Reporting Issues

- Use the issue templates (Bug Report or Feature Request)
- Include your n8n version and node version
- Provide steps to reproduce

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
