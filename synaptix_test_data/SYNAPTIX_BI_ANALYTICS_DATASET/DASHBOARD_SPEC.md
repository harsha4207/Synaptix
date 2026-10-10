# Dashboard Specification — Aether Dynamics Synthetic BI

**Document ID:** BI-DASH-001  
**Audience:** AI dashboard generation / analytics layout testing  
**Data sources:** BI_Financials_2010_2026.xlsx and CSV extracts

## 1. Recommended KPI cards (top row)
| Card | Metric | Source | Format | Highlight rule |
|------|--------|--------|--------|----------------|
| Revenue (latest) | 2026 revenue | Yearly_PnL | 124.7 USD M | — |
| YoY Growth | 2025→2026 growth % | Yearly_PnL | +14.0% approx | Red if negative |
| Gross Margin | 2026 GM % | Yearly_PnL | % | — |
| Peak vs Latest | 2018 peak vs 2026 | Yearly_PnL | dual value | — |
| Anomaly flag | 2024 YoY % | Yearly_PnL | −8.0% | Always surface if filters include 2024 |

## 2. Time-series charts
1. **Revenue 2010–2026 (line)** — Yearly_PnL.revenue_usd_m  
   - Annotate peak (2018), trough (2021), anomaly (2024)
2. **Monthly revenue heatmap or line** — Monthly_Revenue for selected year(s)  
   - Default comparison: 2023 vs 2024 to show Q3 compression
3. **Gross margin % trend (line)** — Yearly_PnL.gross_margin_pct

## 3. Category comparisons
1. **Segment stacked bar or 100% stack by year** — Segment_Revenue  
2. **Region bar for latest year** — Region_Revenue filtered year=2026  
3. **Segment rank table** — top segments by revenue for selected year

## 4. Anomaly panels
| Panel | Content |
|-------|---------|
| Decline episode | 2019–2021 revenue path + YoY % |
| 2024 break | 2023 vs 2024 revenue, margin, Q3 monthly share |
| Anomaly log | Table from Anomalies_Log sheet |

**Behavior:** Panels should label values as *observed in synthetic data*. Optional hypothesis text must be visually secondary and sourced to DATASET_REPORT.md.

## 5. Supporting tables
1. Full Yearly_PnL sortable table  
2. Monthly detail for selected year  
3. Segment pivot (years × segments)  
4. Region pivot (years × regions)

## 6. Filters
- Year range (default 2010–2026)
- Segment multi-select
- Region multi-select
- Toggle “Highlight anomalies”

## 7. Non-goals
- Do not invent drill-through to real GL accounts  
- Do not present causal story as fact  
- Do not mix INR Asterion figures into this USD Aether pack without an explicit FX bridge (none provided)

## 8. Acceptance checks for generated dashboards
- [ ] 2026 revenue card = 124.7  
- [ ] Peak marker on 2018 = 118.9  
- [ ] 2020 YoY ≈ −26.9%  
- [ ] 2024 visible as negative YoY  
- [ ] Segment/region totals reconcile to yearly revenue for any selected year  
