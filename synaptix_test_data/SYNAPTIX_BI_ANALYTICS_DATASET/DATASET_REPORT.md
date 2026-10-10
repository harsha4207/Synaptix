# Synthetic BI Dataset Report — Aether Dynamics Corp

**Document ID:** BI-RPT-001  
**Status:** Synthetic prototype  
**Aligned with:** SYNAPTIX_DUMMY_DATA/Finance (Revenue_History_2010_2026.xlsx)

## 1. Purpose
Provide a coherent multi-dimensional financial fact set for testing analytics engines, dashboard generation, anomaly detection, and grounded Q&A in SYNAPTIX COMMAND.

## 2. Observed Trajectory (facts in the data)
| Phase | Years | Observed pattern |
|-------|-------|------------------|
| Growth | 2010–2018 | Revenue rises from 42.5 to **118.9** USD M (peak) |
| Decline | 2019–2021 | Revenue falls to **68.5** USD M (trough in 2021) |
| Recovery | 2022–2023 | Revenue recovers to 95.8 USD M |
| Anomaly | **2024** | Revenue **88.1** USD M (−8.0% YoY) despite prior recovery |
| Expansion | 2025–2026 | Revenue rises to **124.7** USD M |

**Largest single-year decline:** 2019→2020, from 97.4 to 71.2 USD M (**−26.9%**).

## 3. Planted anomalies (documented)
| ID | Observation in data |
|----|---------------------|
| ANOM-BI-001 | 2020 largest YoY revenue decline |
| ANOM-BI-002 | 2024 revenue dip during recovery |
| ANOM-BI-003 | 2024 Jul–Sep monthly revenue shares compressed |
| ANOM-BI-004 | 2024 elevated COGS and OpEx ratios (lower margins) |
| ANOM-BI-005 | Multi-year 2019–2021 contraction from peak |

## 4. What the data does *not* claim
The dataset records **observed** synthetic values only. It does **not** encode a verified real-world causal model.  
Any narrative about “market shock,” “inventory write-down,” or “project delays” is a **hypothesis label** carried from the Finance workspace notes for test continuity—not a fact proven by external evidence inside this BI pack.

Analytics answers should:
1. State the measured trend or variance from the tables.
2. Label interpretation beyond the numbers as hypothesis or cross-reference, not as proven cause.

## 5. Structural assumptions
- Calendar year reporting (not fiscal April–March).
- Monthly revenues are a seasonal allocation of the annual total; 2024 uses a deliberately distorted Q3 pattern.
- Segment and region mixes are synthetic allocations that always reconcile to annual revenue.
- Units = Revenue_USD × 1e6 / ASP; ASP is an assumption schedule, not a SKU-level fact table.
- Net income uses a simplified 0.76 × operating income proxy for demo KPIs—not a full tax/interest model.

## 6. Consistency guarantees
- Σ segments (year) = yearly revenue  
- Σ regions (year) = yearly revenue  
- Σ months (year) = yearly revenue  
- Gross profit = Revenue − COGS  
- Operating income = Gross profit − OpEx  

## 7. Files
- `BI_Financials_2010_2026.xlsx` — Yearly_PnL, Monthly_Revenue, Segment_Revenue, Region_Revenue, KPI_Summary, Anomalies_Log  
- `Yearly_PnL.csv`, `Monthly_Revenue.csv`, `Segment_Revenue.csv`, `Region_Revenue.csv`  
- `DATA_DICTIONARY.md`, `DASHBOARD_SPEC.md`, `ANALYTICS_TEST_QA.json`  
- `BI_Executive_Summary.pdf`

## 8. Notice
All figures are synthetic prototype data for SYNAPTIX COMMAND. Not for investment, audit, or operational decisions.
