# Methodology — Edge ML Predictive Maintenance
**Project:** SYNAPTIX-PM-2023-2025  
**Document ID:** RES-METH-001  
**Version:** 2.1

## 1. Experimental Design
Ten sequential experiments (EXP-PM-001 to EXP-PM-010) were conducted. Each experiment increased either the feature set, sample size, or model sophistication.

| Experiment | Modalities | Primary Change |
|------------|------------|----------------|
| 001–002 | Vibration | Baseline + feature engineering |
| 003 | Temperature | New modality introduction |
| 004–005 | Vib + Temp | Fusion + edge quantization |
| 006 | Acoustic | Acoustic-only pilot |
| 007–010 | All three | Full multi-modal stack + retraining |

## 2. Data Collection
Synthetic industrial sensor streams were generated and labeled with failure-imminent flags based on controlled degradation profiles. Sample sizes ranged from 720 to 2,750 per experiment.

## 3. Model Architecture
- Backbone: quantized 1D CNN + temporal attention (edge-optimized)
- Input windows: 64-timestep sliding windows
- Output: binary probability of failure within next 10 operating days
- Training: 70/15/15 train/val/test splits, stratified

## 4. Evaluation Metrics
Precision, Recall, F1, False Positive Rate, estimated lead time (median days from first true positive to actual failure event), and modeled energy saving from reduced continuous sensing duty cycle.

## 5. Anomaly Handling
EXP-PM-006 was retained in the series despite underperformance to document modality limitations. No post-hoc exclusion was applied.

## 6. Reproducibility
All experiment identifiers, metrics, and the 500-row feature sample (Research_Dataset.csv) are provided for independent verification within the SYNAPTIX COMMAND test environment.
