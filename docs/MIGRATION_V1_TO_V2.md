# Migration Guide: v1.x to v2.0

This guide helps you migrate your n8n workflows from the Magnet Customer node v1.x to v2.0.

## Breaking Changes

| Aspect | v1.x | v2.0 |
|--------|------|------|
| Create endpoints | `/import/leads`, `/import/contacts`, etc. | `/leads`, `/contacts`, etc. |
| Source tracking | Header `api: 'n8n'` | Body `source: 'n8n'` |
| Platform support | V1 + V2 | **V2 only** |
| Deduplication | Built-in (server-side) | Workflow-level (see below) |

## What You Need to Do

### If your workflows only Create contacts/leads

**No changes needed.** The node handles the endpoint mapping internally. Just update the node version.

### If your workflows rely on deduplication

In v1.x, the `/import/leads` endpoint had **built-in deduplication** — if a contact with the same CPF/email already existed, it would **merge** the data instead of creating a duplicate.

In v2.0, the `POST /leads` endpoint creates directly **without deduplication**. To reproduce the same behavior, you need to add a search step before creating.

## Deduplication Pattern (Search → Branch → Create or Update)

### Before (v1.x) — Single node

```
[Trigger] → [Magnet Customer: Create Lead]
```

The node handled deduplication internally. If a lead with the same CPF existed, it was updated instead of duplicated.

### After (v2.0) — Search + IF + Create/Update

```
[Trigger] → [Magnet Customer: Search Lead] → [IF] → [Create Lead] (not found)
                                                  → [Update Lead] (found)
```

### Step-by-step setup

#### 1. Search for existing contact

Add a **Magnet Customer** node with:
- **Resource:** Lead (or Customer/Prospect)
- **Operation:** Search
- **Search:** Use the CPF/doc value from your trigger: `{{ $json.doc }}`

#### 2. Check if contact exists

Add an **IF** node:
- **Condition:** `{{ $json.length > 0 }}` is true
  - Or check: `{{ $('Search Lead').item.json.length }}` is greater than 0

#### 3a. If NOT found → Create

Add a **Magnet Customer** node with:
- **Resource:** Lead
- **Operation:** Create
- Fill in the fields from your trigger data

#### 3b. If found → Update

Add a **Magnet Customer** node with:
- **Resource:** Lead
- **Operation:** Update
- **Lead ID:** `{{ $('Search Lead').first().json._id }}`
- Fill in the fields you want to update

### Complete workflow example

```
┌──────────┐    ┌─────────────────┐    ┌────┐    ┌─────────────────┐
│ Webhook  │───▶│ MC: Search Lead │───▶│ IF │───▶│ MC: Create Lead │ (not found)
│ Trigger  │    │ search = doc    │    │    │    └─────────────────┘
└──────────┘    └─────────────────┘    │    │    ┌─────────────────┐
                                       │    │───▶│ MC: Update Lead │ (found)
                                       └────┘    └─────────────────┘
```

### Tips

- **Search by CPF/Doc:** Use the `search` parameter with the document number. The API searches across `fullname`, `email`, `doc`, and `phones`.
- **Search by email:** If you don't have CPF, search by email address.
- **Batch workflows:** For bulk imports, add a **Split In Batches** node before the search to avoid rate limits.
- **Rate limits:** The API allows up to 100 requests per minute per tenant. Add delays between batches if needed.

## Source Tracking

Contacts created via n8n are now tracked with `source: 'n8n'` in the CRM. This is automatic — no configuration needed. You can filter contacts by source in the Magnet Customer platform.

## FAQ

### Do I need to change my existing workflows?

Only if they rely on the deduplication behavior. If your workflows just create contacts without caring about duplicates, they will work as-is after the update.

### Can I still use v1.x?

Yes, v1.9.x remains available on npm. However, it will not receive updates and may stop working as V1 infrastructure is deprecated.

### What happens if I create a duplicate?

The CRM will create a second contact with the same data. You can use the **Merge** feature in the Magnet Customer platform to consolidate duplicates manually, or implement the deduplication pattern described above.

### How do I check which version I'm using?

In n8n, go to **Settings > Community Nodes**. The version is displayed next to the node name.

## Support

- [API Reference](https://apireference.magnetcustomer.com)
- [GitHub Issues](https://github.com/magnetcustomer/n8n-nodes-magnetcustomer/issues)
- Email: suporte@magnetcustomer.com
