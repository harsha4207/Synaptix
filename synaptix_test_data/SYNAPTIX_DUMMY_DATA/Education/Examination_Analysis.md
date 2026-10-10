# Examination & Completion Analysis
**Institution:** Northbridge Synthetic University  
**Period:** 2022-23 to 2024-25  
**Document ID:** EDU-EXAM-001

## 1. Overall Patterns
Student-level scores (Assessment 1, Assessment 2, Final Exam) produce overall percentages that map cleanly to letter grades. Aggregate course averages and completion rates are computed in the Course Summary sheet of Student_Performance_Synthetic.xlsx and in Course_Enrollment.json.

## 2. Declining Completion — CS-410
In academic year 2024-25 the synthetic dataset intentionally elevates the non-completion rate for CS-410 Distributed Systems to ~35%. Earlier years show substantially higher completion. This is the primary planted academic anomaly for detection testing.

## 3. Attendance Correlation
Attendance_Records.csv and the Attendance_Pct column in the student performance file support queries that compare attendance with final grades or completion status.

## 4. Consistency Notes
- Enrollment counts in Course_Enrollment.json match the student-course rows in the Excel file.
- Overall_Pct is a weighted combination (30/30/40) of the three assessments.
- Completed flag is 0 for non-completers (including the planted CS-410 cases).

## 5. Synthetic Notice
All student IDs (STU-SYN-*) and performance figures are fictional.
