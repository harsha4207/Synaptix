# TEST_CASES.md — Intentionally Planted Anomalies

This document lists deliberate synthetic anomalies embedded in the dataset for detection, RAG, and analytics testing. Expected results are described so that test harnesses can validate platform behavior.

---

## Finance Workspace (Aether Dynamics Corp)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-FIN-001 | Duplicate Invoice | Expense_Transactions.csv, Invoice_Register.xlsx, Duplicate_Invoice_Investigation.md | INV-2023-1087 appears twice with identical amount | Exact match on Invoice_Number + Vendor + Amount |
| ANOM-FIN-002 | Near-Duplicate Invoice | Expense_Transactions.csv | INV-2024-1112 appears twice with ~2% amount variance | Near-match on Invoice_Number + Vendor within amount tolerance |
| ANOM-FIN-003 | Budget Overrun | Budget_Variance_Report.docx, Expense_Transactions.csv | Manufacturing OpEx +11.4% vs budget 2024; elevated consulting >$85k | Variance >8% threshold; unusual expense amount |
| ANOM-FIN-004 | Revenue / Inventory Anomaly | Revenue_History, Quarterly_Financial_Statements | 2024 Q3 revenue share ~18% (vs normal 25–28%); inventory $28.4M | YoY / QoQ anomaly; balance-sheet spike |

**Supporting questions the data can answer:**
- How did revenue change from 2010 to 2026?
- When did the largest decline occur? (2020, −26.9%)
- Which expense categories contributed to the 2024 issues?
- Find duplicate invoices.
- Identify budget overruns.

---

## Research Workspace (SYNAPTIX-PM-2023-2025)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-RES-001 | Underperforming Experiment | Experimental_Results.xlsx, Research_Findings.json, Limitations_and_Future_Work.md | EXP-PM-006 (Acoustic-only) F1=0.71, FPR=0.14 | Outlier relative to other experiments; limitation narrative |

**Supporting questions:**
- Summarize research findings.
- Compare experimental results.
- Identify anomalies and limitations.
- Generate charts from the dataset (Research_Chart.png already provided).

---

## Healthcare Workspace (Meridian Synthetic Medical Center)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-HC-001 | Overdue Maintenance | Equipment_Maintenance_Log.xlsx | EQ-SYN-CT-02 (CT Scanner B) Status=Overdue | Query for overdue equipment returns this asset |
| ANOM-HC-002 | Overdue Maintenance | Equipment_Maintenance_Log.xlsx | EQ-SYN-VENT-05 (Ventilator Bank 5) Status=Overdue | Same |

**Supporting questions:**
- Analyze waiting-time trends (Emergency highest).
- Find departments with high utilization.
- Identify overdue equipment maintenance.

---

## Education Workspace (Northbridge Synthetic University)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-EDU-001 | Declining Completion | Student_Performance_Synthetic.xlsx, Course_Enrollment.json, Examination_Analysis.md | CS-410 completion rate drops markedly in 2024-25 (~35% non-completion) | Year-over-year completion comparison flags CS-410 |

**Supporting questions:**
- Compare attendance and performance.
- Identify courses with declining completion rates.
- Generate academic performance dashboard.

---

## Business Workspace (LumenForge Products Inc.)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-BUS-001 | Declining Product Sales | Sales_Transactions.xlsx, Inventory_Operations.xlsx, Quarterly_Business_Review.docx | PRD-LF-500 (PulseMonitor Industrial) unit volume drops sharply from 2025; Overstock status | Sales trend + inventory days-of-supply |
| ANOM-BUS-002 | Delivery Delays | Supply_Chain_Incidents.txt | Multiple incidents with 5–12 day delays | Incident log analysis by delay length / region |

**Supporting questions:**
- Identify declining product sales.
- Analyze inventory and delivery delays.
- Compare customer segments.

---

## Custom Operations Workspace (Apex Continuity Operations Center)

| ID | Type | Location | Description | Expected Detection |
|----|------|----------|-------------|--------------------|
| ANOM-OPS-001 | Overdue Maintenance | Maintenance_Records.xlsx, Shift_Handover_Notes.txt | Multiple Overdue WOs on EQ-OP-CNV-02 and EQ-OP-CMP-05 | Status=Overdue filter |
| ANOM-OPS-002 | Recurring Incident | Incident_Register.csv, Equipment_Inspection_Form.png | Five related INC-OP records for conveyor belt misalignment on EQ-OP-CNV-02 | Same Equipment_ID + similar description within time window |

**Supporting questions:**
- Find recurring incidents.
- Identify overdue maintenance.
- Generate an operational performance report.

---

## Cross-Cutting Validation
- Identifiers are consistent within each workspace.
- Spreadsheet totals and report narratives agree on key figures.
- Charts (Research_Chart.png) reflect Experimental_Results.xlsx data.
- Knowledge_Base.json files list the anomaly IDs for programmatic discovery.
