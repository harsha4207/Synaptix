# Standard Operating Procedure — Maintenance & Incident Management
**Apex Continuity Operations Center**  
**Document ID:** OPS-SOP-001  
**Version:** 1.3  
**Effective:** 2025-01-01

## 1. Work Order Lifecycle
1. Request logged → Work_Order_ID assigned (WO-OP-####).
2. Scheduling within priority SLA:
   - Critical: 4 hours
   - High: 24 hours
   - Medium: 72 hours
   - Low: 7 days
3. Execution by Assigned_Team.
4. Completion requires Resolution_Hours and Failure_Code.
5. Overdue status is automatic when Scheduled_Date passes without completion.

## 2. Incident Management
- All incidents receive Incident_ID (INC-OP-####).
- Severity drives escalation path.
- Linked_WO field connects incidents to corrective work orders.
- Recurring incidents on the same Equipment_ID within 90 days trigger root-cause review.

## 3. Shift Handover
- Outgoing shift documents open critical/high items and any Overdue work orders.
- Incoming shift acknowledges via Shift_Handover_Notes format.

## 4. Approval Requirements
- Critical priority work orders require Operations Supervisor sign-off before close.
- Any equipment returned to service after Critical failure requires dual verification.

## 5. Synthetic Data Notice
This SOP and all linked records are fictional and exist solely for SYNAPTIX COMMAND workflow and analytics testing.
