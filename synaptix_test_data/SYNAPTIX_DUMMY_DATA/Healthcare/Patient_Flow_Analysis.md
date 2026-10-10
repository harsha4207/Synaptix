# Patient Flow Analysis
**Facility:** Meridian Synthetic Medical Center (MSMC)  
**Period:** 2024–2025 (Synthetic)  
**Document ID:** HC-FLOW-001

## 1. Scope
Analysis of appointment throughput, waiting times, and no-show patterns across six departments using the synthetic appointment extract (400 records).

## 2. Findings
- **Emergency** consistently records the longest waits; 90th-percentile waits exceed 100 minutes in the sample.
- **Radiology** shows bimodal wait distribution — most appointments under 30 minutes, with a secondary cluster of 60–120 minute waits associated with high-utilization days.
- **No-show rates** are highest in General Medicine and Orthopedics within this synthetic sample.
- **Utilization** (from Department_Utilization.csv) frequently exceeds 85% for Cardiology and Surgery in peak months, indicating limited spare capacity.

## 3. Overdue Equipment Impact
Two overdue assets (CT Scanner B, Ventilator Bank 5) are flagged. Prolonged downtime on CT would be expected to cascade into Radiology wait times; the dataset retains the overdue status for detection testing.

## 4. Data Sources
- Synthetic_Appointment_Data.xlsx
- Department_Utilization.csv
- Equipment_Maintenance_Log.xlsx
- Hospital_Operations_Report.pdf

## 5. Synthetic Notice
All identifiers (PAT-SYN-*, APT-SYN-*, EQ-SYN-*) are fictional. No real PHI is present.
