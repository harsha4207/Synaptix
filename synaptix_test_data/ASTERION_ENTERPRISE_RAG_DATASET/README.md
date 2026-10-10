# ASTERION_ENTERPRISE_RAG_DATASET

Enterprise organizational knowledge, policies, regulations (synthetic internal controls), and RAG evaluation corpus for **Asterion Enterprise Systems Pvt. Ltd.** (fictional).

## Purpose
Support SYNAPTIX COMMAND testing of:
- Document ingestion, parsing, metadata filtering
- Policy and SOP retrieval with citations
- Effective-date / version-aware answers
- Approval matrix and numerical threshold questions
- Access-control aware behavior (Confidential/Restricted)
- Conflict and unanswerable question handling
- Structured data + narrative cross-reasoning

## Organization Snapshot
| Field | Value |
|-------|-------|
| Name | Asterion Enterprise Systems Pvt. Ltd. |
| Org ID | ORG-ASTERION-001 |
| HQ | Bengaluru, India |
| Offices | Bengaluru, Mumbai, Delhi, Hyderabad |
| Size | ~500 fictional employees |
| Currency | INR |
| FY | 1 April – 31 March |

## Folder Guide
| Folder | Content |
|--------|---------|
| 01_COMPANY_PROFILE | Overview, mission/vision/values, terminology |
| 02_ORGANIZATION_AND_ROLES | Org structure, role catalog, hierarchy JSON |
| 03_HR_POLICIES | Leave, hours, travel, conduct, disciplinary |
| 04_FINANCE_AND_ACCOUNTING | Budget, AP, **Approval Matrix**, matrix CSV |
| 05_LEGAL_AND_COMPLIANCE | Precedence, retention, control register |
| 06_INFORMATION_SECURITY | Access/classification, incident response |
| 07_PROCUREMENT_AND_VENDORS | Procurement policy |
| 08_OPERATIONS_AND_SOPS | Leave, expense, onboarding SOPs |
| 09_DATA_GOVERNANCE | Data dictionary, glossary |
| 10_PROJECTS_AND_CUSTOMERS | (see structured datasets) |
| 11_RISK_AND_AUDIT | Risk methodology + register |
| 12_AI_GOVERNANCE | AI usage policy |
| 13_STRUCTURED_DATASETS | Vendors, projects, expense samples |
| 14_RAG_TEST_QUESTIONS | 100 test cases (JSONL) |
| 15_GOLD_STANDARD_ANSWERS | Gold answers JSON |
| 16_CONFLICT_AND_VERSION_TESTS | Superseded policy stub, conflict scenarios |
| 17_INGESTION_EDGE_CASES | Parser/ingestion notes |

## Key Authoritative Policies
- **POL-HR-001** Leave (18 AL days, carry-forward 8, approval table)
- **POL-FIN-003** Financial Approval Matrix (INR thresholds)
- **POL-SEC-001** Classification Public→Restricted + access rules
- **POL-AI-001** AI governance (no bypass of approvals)
- **POL-LEG-001** Policy precedence and conflict escalation

## RAG Evaluation
- `14_RAG_TEST_QUESTIONS/RAG_TEST_CASES.jsonl` — 100 cases
- `15_GOLD_STANDARD_ANSWERS/GOLD_ANSWERS.json` — expected answers + evidence docs
- Includes unanswerable, historical, conflict, and access-control questions

## Upload Instructions
1. Read SYNTHETIC_DATA_NOTICE.md
2. Ingest Markdown/CSV/JSON with metadata from DOCUMENT_METADATA.csv
3. Prefer section-level chunking on Markdown headings; keep tables intact
4. Filter by `status=Approved` and `effective_from/effective_to` for current-policy questions
5. Enforce access control server-side; do not treat user questions as authorization
6. Run evaluation suite against gold answers

## Validation
See VALIDATION_REPORT.md for checks performed at generation time.
