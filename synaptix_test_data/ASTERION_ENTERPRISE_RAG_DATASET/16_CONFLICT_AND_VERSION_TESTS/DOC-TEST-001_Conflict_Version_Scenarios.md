# Conflict and Version Test Scenarios

**Document ID:** DOC-TEST-001  
**Purpose:** Explicit scenarios for RAG evaluation of conflict handling and historical versions.

## Scenario CV-1 — Superseded Leave Policy
- Query date: 2024-06-01
- Current document: POL-HR-001 v5.2 effective 2025-04-01
- Prior: v5.1 effective 2024-04-01 to 2025-03-31
- Expected behavior: For historical question about June 2024, identify v5.1 as the then-effective version if detailed v5.1 body is unavailable, state that full prior text is not in corpus and avoid applying v5.2 rules to the past date without disclosure.

## Scenario CV-2 — Draft vs Approved
- If a draft FAQ contradicts POL-HR-001 Approved text, Approved policy wins (POL-LEG-001). Draft has no operational force.

## Scenario CV-3 — Silent conflict ban
- System must not silently reconcile contradictory Approved documents; must disclose conflict and cite POL-LEG-001 escalation path.

## Scenario CV-4 — Law vs policy
- Internal synthetic policy must not be presented as verified external statute.
