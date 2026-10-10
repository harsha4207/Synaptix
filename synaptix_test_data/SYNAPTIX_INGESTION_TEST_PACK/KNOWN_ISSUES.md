# KNOWN_ISSUES.md — Intentional edge cases

| ID | File | Issue type | Detail | Expected system behavior |
|----|------|------------|--------|---------------------------|
| KI-01 | ING-XLSX-001 | Date formats | Five different date string formats in one column | Preserve raw string; optional normalize later |
| KI-02 | ING-XLSX-001 | Duplicate key | INV-SYN-2025-1001 on two txn rows | Flag duplicate invoice reference |
| KI-03 | ING-XLSX-001 | Null amount | TXN-ING-9006 Amount_INR empty | Null/empty not coerced to zero without rule |
| KI-04 | ING-XLSX-001 | Null name | TXN-ING-9007 Vendor_Name empty | Empty string retained |
| KI-05 | ING-CSV-001 | Exact duplicate | REC-001 identical to REC-004 | Detect duplicate records |
| KI-06 | ING-CSV-001 | Missing metric | REC-005 metric_value blank | Empty preserved |
| KI-07 | ING-DOCX-001 | Missing cell | Policy acknowledgment Completed blank | Empty cell visible in table extract |
| KI-08 | ING-PDF-001 | Header/footer | Repeated header/footer each page | Content extract without treating footer as body noise excessively |
| KI-09 | ING-PDF-002 / IMG-001 | Tax calc | GST 18% of subtotal | Extracted tax matches 18% within rounding |
| KI-10 | ING-IMG-003 | OCR hard | Blur + noise + low quality | Partial recovery acceptable; document difficulty Hard |
| KI-11 | All *example.com / +91 | Redaction | Synthetic email and phone | Detect as sensitive field candidates |
| KI-12 | Multiple files | Entity graph | Shared VND-*, EQ-*, PAT-*, EMP-*, WO-* | Entity resolution across formats |

No accidental contradictions were introduced between files; overlaps are deliberate cross-references.
