# VALIDATION_REPORT

**Generated:** 2026-10-09T11:07:40.849244Z  
**Corpus:** ASTERION_ENTERPRISE_RAG_DATASET

## Checks Performed

| Check | Result | Notes |
|-------|--------|-------|
| Folder structure exists (17 domain folders) | PASS | Created as specified |
| Core policies non-empty | PASS | POL-HR-001, POL-FIN-003, POL-SEC-001, POL-AI-001, POL-LEG-001 present |
| Document IDs unique in DOCUMENT_METADATA | PASS | Reviewed at generation |
| ROLE_CATALOG.csv parses | PASS | Header + role rows |
| APPROVAL_MATRIX.csv parses | PASS | Expense and PO bands |
| GLOSSARY.csv parses | PASS | 14 terms |
| RISK_REGISTER.csv scores consistent | PASS | inherent = L×I for sample rows |
| RAG_TEST_CASES.jsonl count | PASS | 100 cases |
| GOLD_ANSWERS.json aligns with tests | PASS | Same objects |
| Superseded policy stub present | PASS | POL-HR-001 v5.1 stub |
| No real credentials/API keys | PASS | By construction |
| example.com emails only | PASS | By construction |
| Synthetic notice present | PASS | Root + headers |

## Known Limitations
1. Not every conceivable SOP (e.g., full offboarding checklist detail) is expanded to multi-page length; core paths are covered.
2. Full text of superseded POL-HR-001 v5.1 is a summary stub, not a complete duplicate—version tests should use Status and Effective-To fields.
3. No PDF/DOCX binary policies in this batch (Markdown is primary for clean RAG chunking); prior SYNAPTIX dummy data package demonstrated PDF/DOCX generation separately.
4. Financial multi-year ledgers are sample-scale, not 2010–2026 full GL.
5. External regulatory register deliberately avoids inventing statute numbers.

## Incomplete Work
- Optional future expansion: full DOCX/PDF renders of each POL-*, richer employee synthetic directory (still without real PII), month-end close SOP long form.

## File Count
See DATASET_MANIFEST.csv for authoritative list of generated files.
