# Data Dictionary — SYNAPTIX BI Analytics Dataset

**Entity:** Aether Dynamics Corp (fictional)  
**Package:** SYNAPTIX_BI_ANALYTICS_DATASET  
**Currency:** USD millions unless noted  
**Period:** Calendar years 2010–2026  
**Synthetic:** Yes — prototype data only

## Yearly_PnL (sheet / Yearly_PnL.csv)

| Column | Type | Description | Unit |
|--------|------|-------------|------|
| year | integer | Calendar year | YYYY |
| revenue_usd_m | decimal | Total recognized revenue | USD millions |
| cogs_usd_m | decimal | Cost of goods sold | USD millions |
| gross_profit_usd_m | decimal | Revenue − COGS | USD millions |
| gross_margin_pct | decimal | Gross profit / Revenue × 100 | Percent |
| opex_usd_m | decimal | Operating expenses | USD millions |
| operating_income_usd_m | decimal | Gross profit − OpEx | USD millions |
| net_income_usd_m | decimal | Simplified net income after interest/tax proxy | USD millions |
| units_sold | integer | Estimated units (Revenue × 1e6 / ASP) | Count |
| asp_usd | decimal | Average selling price assumption | USD |

## Monthly_Revenue

| Column | Type | Description |
|--------|------|-------------|
| year | integer | Calendar year |
| month | integer | Month 1–12 |
| period | string | YYYY-MM |
| revenue_usd_m | decimal | Monthly revenue (sums to yearly) |
| cogs_usd_m | decimal | Monthly COGS |
| gross_profit_usd_m | decimal | Monthly gross profit |
| opex_usd_m | decimal | Monthly OpEx |
| operating_income_usd_m | decimal | Monthly operating income |
| units_sold | integer | Monthly units estimate |

**Integrity rule:** For each year, Σ monthly revenue = yearly revenue (within 0.02).

## Segment_Revenue

| Column | Type | Description |
|--------|------|-------------|
| year | integer | Calendar year |
| segment | string | Industrial Sensors \| IoT Gateways \| Software & Analytics \| Professional Services |
| revenue_usd_m | decimal | Segment revenue (sums to yearly) |
| units_sold | integer | Segment units estimate |

## Region_Revenue

| Column | Type | Description |
|--------|------|-------------|
| year | integer | Calendar year |
| region | string | North America \| Europe \| Asia-Pacific \| Rest of World |
| revenue_usd_m | decimal | Regional revenue (sums to yearly) |

## KPI definitions (canonical)

| KPI | Formula |
|-----|---------|
| YoY Revenue Growth % | (Rev_t − Rev_t−1) / Rev_t−1 × 100 |
| Gross Margin % | Gross Profit / Revenue × 100 |
| OpEx Ratio % | OpEx / Revenue × 100 |
| Units | Revenue_USD × 1,000,000 / ASP_USD |

## Related identifiers from Finance workspace
- Company: Aether Dynamics Corp
- Vendors (contextual): VND-1001 NovaForge, VND-1002 Quantum Parts, VND-1003 Horizon Logistics
- Anomaly cross-ref: ANOM-FIN-004 (2024 Q3 / inventory) aligns with ANOM-BI-002/003
