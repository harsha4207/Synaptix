# SYNAPTIX_INGESTION_TEST_PACK

Document-ingestion test pack for **SYNAPTIX COMMAND**.

All content is **synthetic** and labelled as such. It reuses entity IDs from the primary dummy datasets (Aether Dynamics Finance, Meridian Healthcare, Apex Operations, Asterion roles) so cross-file entity resolution can be tested.

## Contents by format

| Format | Files | Focus |
|--------|-------|--------|
| PDF | 2 | Clean multi-page report with headers/footers; invoice with tax line items |
| DOCX | 2 | Form with labelled fields + missing cell; cross-entity ops digest |
| XLSX | 2 | Dirty sheet (mixed dates, duplicates, nulls); clean budget sheet |
| CSV | 2 | Dirty events (duplicate + missing + mixed dates); clean vendor list |
| TXT | 1 | Plain shift handover with abbreviations and synthetic PII |
| Markdown | 2 | Policy excerpt with table; abbreviation glossary |
| JPG/PNG | 4 | Scanned invoice; form; poor-quality inspection scan; image table |

## Intentional difficulty cases (documented)

1. **Inconsistent date formats** — ING-XLSX-001, ING-CSV-001  
2. **Duplicate records** — ING-XLSX-001 (duplicate Invoice_Ref), ING-CSV-001 (exact row duplicate)  
3. **Missing values** — XLSX amount/vendor name; DOCX checklist empty cell; CSV metric_value  
4. **Abbreviations** — OTIF, QMS, CMMS, HIS, HRIS, GST, WO, INC, AL, CFO, etc.  
5. **Cross-file entities** — VND-1001/1002/1003, EQ-SYN-CT-02, EQ-OP-CNV-02, PAT-SYN-1142, EMP-SYN-88421, WO-OP-9072  
6. **Sensitive synthetic fields** — `*@*.example.com` emails and `+91-...` phones for redaction detection  
7. **OCR stress** — ING-IMG-001 (scan noise), ING-IMG-003 (poor quality)  
8. **Headers/footers** — ING-PDF-001  
9. **Tax math** — Invoice PDFs/JPG with 18% GST on subtotal  

## Manifest

See `MANIFEST.csv` columns:  
`Filename | Format | Expected_extraction | Difficulty | Known_issue | Expected_result`

## Related parent corpora

- `SYNAPTIX_DUMMY_DATA/` (Finance, Healthcare, Custom_Operations, …)  
- `ASTERION_ENTERPRISE_RAG_DATASET/` (policies, roles, approval matrix)

## Notice

No real personal data, real patient records, real bank details, or real credentials.  
Emails use `example.com`. Phone numbers are fictional.

Generated for SYNAPTIX COMMAND document-ingestion, OCR, parsing, redaction, and entity-linking evaluation.
