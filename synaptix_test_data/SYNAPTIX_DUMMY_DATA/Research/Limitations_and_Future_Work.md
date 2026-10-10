# Limitations and Future Work
**Project:** SYNAPTIX-PM-2023-2025

## Limitations
1. **Acoustic data scarcity** — EXP-PM-006 demonstrated that acoustic-only models suffer from high false-positive rates when labeled failure events are sparse. Multi-modal fusion mitigates but does not eliminate this constraint.
2. **Synthetic / controlled data** — All experiments used synthetic sensor streams with known degradation profiles. Real-world noise, sensor drift, and rare failure modes are underrepresented.
3. **Energy savings estimation** — Savings percentages are derived from duty-cycle models rather than continuous power measurement on deployed hardware.
4. **Lead time shortfall** — Peak median lead time reached 9.8 days against a 10-day target. The difference is small but formally means the lead-time criterion was not fully met.
5. **Single industrial domain** — Results are specific to the synthetic sensor-network environment modeled; transfer to other equipment classes is untested.

## Future Work Recommendations
- Collect and label additional real acoustic failure events.
- Conduct a field pilot with continuous power metering.
- Explore transfer learning / domain adaptation for new equipment types.
- Investigate online / continual learning to handle concept drift.

## Relation to Test Cases
The acoustic underperformance (ANOM-RES-001) is intentionally retained so that analytics and RAG systems can surface the limitation when queried about model weaknesses or experiment anomalies.
