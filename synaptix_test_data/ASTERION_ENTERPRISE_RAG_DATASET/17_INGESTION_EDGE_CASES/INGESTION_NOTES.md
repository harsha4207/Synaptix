# Ingestion Edge Cases

1. **Empty optional fields:** Some CSV rows may have empty secondary_requirement — parsers must allow nulls.
2. **Status enums:** Use only Draft | Approved | Superseded | Retired | Archived for policies.
3. **Currency:** All money fields default INR; do not assume USD.
4. **example.com emails:** Fictional only.
5. **No secrets:** No real passwords, API keys, or tokens are present.
6. **Chunking recommendation (non-binding):** Prefer section-level chunks using Markdown headings; keep approval tables intact in one chunk when possible.
7. **Metadata authority:** Application must attach tenant/workspace from server-side auth; do not trust client-supplied org_id for access control.
