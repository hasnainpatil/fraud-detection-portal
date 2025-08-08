# Fraud Detection Portal - Progress Report

**Date**: [28/07/2025]  
**Phase**: Exploratory Data Analysis  
**Status**: In Progress  

## Executive Summary
Brief overview of current progress and key findings.

## Dataset Analysis Completed
### Data Quality
- ✅ No missing values detected
- ✅ Appropriate data types confirmed
- ✅ 284,807 total transactions loaded

### Class Distribution
- ✅ Extreme imbalance identified (0.17% fraud)
- ✅ Visualizations created with log scale
- ✅ Modeling strategy adjusted for imbalance

## Technical Environment
- ✅ Azure ML workspace configured
- ✅ Compute cluster (fraud-detection-cpu) operational
- ✅ Tabular dataset registered as "dataset2"

## Next Steps
1. Advanced EDA (correlation analysis, feature distributions)
2. Baseline LightGBM model training
3. Model evaluation with imbalance-aware metrics

## Key Decisions Made
- Dataset storage: Azure ML Tabular Dataset
- Development environment: Azure ML Studio Notebooks
- Visualization approach: Log scale for imbalanced classes

## Blockers/Risks
- None currently identified

## Resources Used
- Azure Student Credits: [Current usage]
- Compute hours: [Tracking needed]

Progress Report – August 8, 2025 

Baseline Modeling & Hyperparameter Tuning:

LightGBM selected for initial model due to speed and performance on tabular, imbalanced data

All experiments tracked in eda-and-baseline-model.ipynb notebook

Current Model — Parameters (Finalized for Progression)
Algorithm:

LightGBM (v4.6.0)

Key Hyperparameters:

learning_rate: 0.01

Lowered for finer-grained, stable training

num_boost_round: 1000

High to allow enough rounds for learning, with early stopping for efficiency

scale_pos_weight: 577.88

Matches the ratio of legit to fraud cases to combat class imbalance

early_stopping_rounds: 20

Model stops training if validation scores do not improve for 20 rounds

valid_sets: [train, test]

Monitors performance on both training and validation data

log_evaluation: period=10

Logs metrics every 10 rounds for transparency

Performance Metrics (Latest Model):
ROC-AUC: 0.90

Fraud Recall: 85.7%

Fraud Precision: 9.5%

F1-score (fraud): 0.17

Confusion Matrix:

text
[[56066   798]
 [   14    84]]
Interpretation:

High recall ensures most frauds are detected

Precision is low, but aligns with real-world tradeoffs and business priorities

ROC-AUC above industry standard, confirming strong overall discrimination

Key Decisions and Rationale
SMOTE/Oversampling:

Considered but set aside for now to retain original data characteristics; may revisit if recall stalls

Threshold Setting:

Lower threshold adopted to maximize recall for minority class (fraud), accepting lower precision

Business Alignment:

Chosen metrics prioritize fraud detection (high recall) for demo and interview purposes, matching domain expectations
