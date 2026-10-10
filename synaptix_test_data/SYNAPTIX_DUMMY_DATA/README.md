# SYNAPTIX_DUMMY_DATA — Multi-Workspace Prototype Dataset

**Purpose:** Realistic, interconnected, entirely fictional documents and datasets for testing the SYNAPTIX COMMAND domain-isolated enterprise AI platform.

**Contents:** Six isolated workspaces (Finance, Research, Healthcare, Education, Business, Custom_Operations) plus root-level manifest, test-case documentation, and synthetic-data notice.

## Quick Start
1. Read `SYNTHETIC_DATA_NOTICE.md` — all data is fictional.
2. Review `TEST_CASES.md` for planted anomalies and expected detection results.
3. Use `DATASET_MANIFEST.csv` for a machine-readable inventory of every file.
4. Each workspace folder contains its own `README.md` describing local files.

## Workspaces

| Workspace | Fictional Entity | Primary Focus |
|-----------|------------------|---------------|
| Finance | Aether Dynamics Corp | Revenue 2010–2026, invoices, budgets, duplicates |
| Research | SYNAPTIX-PM project | Edge ML predictive maintenance experiments |
| Healthcare | Meridian Synthetic Medical Center | Appointments, utilization, equipment maintenance |
| Education | Northbridge Synthetic University | Student performance, attendance, completion |
| Business | LumenForge Products Inc. | Sales, inventory, customer segments, supply chain |
| Custom_Operations | Apex Continuity Operations Center | Work orders, incidents, SOPs, shift handover |

## File Format Coverage
- **xlsx** — multi-sheet workbooks with realistic records and summaries
- **csv** — structured analytic datasets
- **pdf** — formatted reports and sample invoices
- **docx** — formal reports, policies, reviews
- **md / txt** — policies, notes, investigations, SOPs
- **json** — knowledge bases, findings, enrollment, workflows
- **jpg / png** — scanned-style invoices, forms, charts (OCR targets)

## Cross-Document Consistency
Within each workspace identifiers, dates, totals, and narratives are kept consistent. Deliberate anomalies are documented in TEST_CASES.md and in each workspace Knowledge_Base.json.

## Validation Checklist (performed at generation)
- [x] All listed files exist on disk
- [x] Excel workbooks contain data and open cleanly
- [x] CSV files have headers and records
- [x] Markdown and text files are readable
- [x] PDFs and images contain meaningful content
- [x] Cross-file consistency maintained within workspaces
- [x] Each workspace is self-contained

## Usage
Upload individual files or entire workspace folders into SYNAPTIX COMMAND to exercise document intelligence, RAG, analytics, anomaly detection, and workflow features.

**Generated for SYNAPTIX COMMAND prototype testing. Not for operational use.**
