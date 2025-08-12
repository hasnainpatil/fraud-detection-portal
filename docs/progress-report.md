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

# Progress Report – August 8, 2025

## Baseline Modeling & Hyperparameter Tuning

- **Model Choice:**  
  - *LightGBM* selected for initial modeling due to speed and strong performance on tabular, imbalanced data.
- **Experiment Tracking:**  
  - All experiments tracked in `eda-and-baseline-model.ipynb` notebook.

---

## Current Model — Parameters (Finalized for Progression)

**Algorithm:**  
- LightGBM (v4.6.0)

**Key Hyperparameters:**
- `learning_rate`: **0.01**  
  - Lowered for finer-grained, stable training
- `num_boost_round`: **1000**  
  - High to allow enough rounds for learning, with early stopping for efficiency
- `scale_pos_weight`: **577.88**  
  - Matches the ratio of legitimate to fraud cases to combat class imbalance
- `early_stopping_rounds`: **20**  
  - Training stops if validation scores do not improve for 20 rounds
- `valid_sets`: `[train, test]`  
  - Monitors performance on both training and validation data
- `log_evaluation`: **period=10**  
  - Logs metrics every 10 rounds for transparency

---

## Performance Metrics (Earlier Model)

- **ROC-AUC:** `0.90`
- **Fraud Recall:** `85.7%`
- **Fraud Precision:** `9.5%`
- **F1-score (fraud):** `0.17`

**Confusion Matrix:**
[[56066 798]
[ 14 84]]


---

### Interpretation

- **High recall** ensures most frauds are detected.
- **Precision is low,** which aligns with real-world tradeoffs and business priorities in fraud detection.
- **ROC-AUC above industry standard,** confirming strong overall discrimination ability.

---

## Key Decisions and Rationale

- **SMOTE/Oversampling:**  
  - Considered, but set aside for now to retain original data characteristics; may revisit if recall stalls.

- **Threshold Setting:**  
  - Lower threshold adopted to maximize recall for minority class (fraud), accepting lower precision.

- **Business Alignment:**  
  - Chosen metrics prioritize fraud detection (**high recall**) for demo and interview purposes, matching domain expectations.

# Troubleshooting Log: Resolving a Model Overfitting Incident

**Date:** August 12, 2025

**Author:** [Hasnain Patil]

### 1. Incident Summary

During local API testing, a critical issue was identified where the backend function, despite running without errors, returned the exact same `fraud_probability` score for every single transaction. This indicated that the model was not differentiating between inputs, rendering it ineffective.

---

### 2. Investigation & Root Cause Analysis

The investigation followed a systematic, two-step process to isolate the fault between the application code and the ML model itself.

**Step 1: Validate the Application Code**

The first hypothesis was that the Python code in our Azure Function was failing to process the input data correctly. To test this, we added `logging` statements to inspect the `pandas` DataFrame immediately before it was passed to the model for prediction.

* **Action:** Logged the `.shape` and `.head()` of the input DataFrame.
* **Result:** The logs confirmed the DataFrame had the correct dimensions and contained varied, valid numerical data.
* **Conclusion:** This step successfully **ruled out the application code as the source of the error**. The problem was isolated to the `model.txt` artifact itself.

**Step 2: Analyze the Model Training Logs**

With the focus shifted to the model artifact, the original training notebook logs were reviewed. The root cause was identified as a classic case of **severe overfitting**.

* **Finding:** The initial training log showed the message: `Early stopping, best iteration is: [1]`.
* **Analysis:** This meant the model had only trained for a **single round**. It had learned so aggressively on the training data that its performance on the unseen validation data immediately degraded, causing the `early_stopping` callback to halt the process. The resulting model was trivial and had not learned any generalizable patterns.

---

### 3. Resolution: Hyperparameter Tuning for Regularization

The solution was to make the model less aggressive by introducing **regularization**—a set of techniques designed to prevent overfitting by adding constraints and randomness to the learning process. This was achieved by tuning the model's hyperparameters.

The following key changes were made to the `params` dictionary before retraining:

* **Reduced `learning_rate`:** Forced the model to take smaller, more conservative steps.
* **Introduced `feature_fraction` and `bagging_fraction`:** In each training round, the model was now forced to learn from a random subset of both the features (columns) and the data (rows).
* **Simplified Model Complexity (reduced `num_leaves`):** Limited the complexity of the individual decision trees, making it harder for them to memorize noise.

---

### 4. Validation & Outcome

After implementing the new hyperparameters, the model was retrained successfully.

* **Result:** The new training process ran for a healthy number of rounds (**29**), showing steady improvement on the validation set before stopping correctly.
* **Final Test:** The newly generated `model.txt` was re-uploaded to Azure Storage. A final local test using `curl` confirmed the fix: the API now returned varied and sensible `fraud_probability` scores.
* **Conclusion:** The incident was fully resolved, resulting in a robust and well-generalized model suitable for production.

---

### 5. Final Model Performance Metrics

The retrained model's performance was evaluated on the unseen test set, confirming its effectiveness.

* **ROC-AUC Score:** `0.978`

* **Classification Report:**
    ```
                  precision    recall  f1-score   support

               0     0.9998    0.9849    0.9923     56864
               1     0.0930    0.8980    0.1686        98

        accuracy                         0.9848     56962
       macro avg     0.5464    0.9414    0.5804     56962
    weighted avg     0.9983    0.9848    0.9909     56962
    ```

* **Confusion Matrix:**
    ```
    [[56006   858]
     [   10    88]]
    ```

These metrics confirm the model's high effectiveness, correctly identifying **~90% of actual fraud cases** (Recall) while demonstrating excellent overall discriminative power (AUC of ~0.98).

# Documentation: Model Insights & Behavior

This document explains the key behaviors and performance characteristics of the trained fraud detection model. Understanding these nuances is critical for interpreting its predictions and appreciating its real-world application.

---

### 1. The Precision-Recall Trade-off

The primary goal of this model is to catch as many fraudulent transactions as possible. This means we prioritize **high recall**.

* **Recall:** Our model achieves a recall of approximately **90%**. This means it successfully identifies 9 out of every 10 actual fraud cases in the dataset.
* **Precision:** To achieve this high recall, the model is intentionally designed to be very suspicious. A side effect of this is lower precision. Our model's precision is **9%**, meaning that for every 10 transactions it flags as fraud, roughly 1 is actual fraud and the other 9 are false alarms (False Positives).

This trade-off is a deliberate and standard practice in fraud detection, where the cost of missing a real fraud case is much higher than the cost of reviewing a false alarm.

---

### 2. The Role of the Prediction Threshold

We convert the model's raw probability scores into a final "Fraud" or "Not Fraud" decision using a **prediction threshold**.

* **Our Threshold:** We use a low threshold of `0.2`.
* **The Logic:** This tells the model, "If you are even 20% suspicious that a transaction is fraudulent, flag it." This low setting is the direct cause of the high recall and low precision mentioned above.
* **Business Alignment:** This "suspicion knob" is a business decision. A higher threshold (e.g., `0.9`) would result in fewer false alarms but would miss more real fraud. Our choice of `0.2` is optimized for minimizing missed fraud cases.

---

### 3. Understanding the Score Distribution

When analyzing the model's output, it was observed that the high-probability scores were varied, while the low-probability scores for non-fraudulent transactions were often very similar and close to zero.

This is expected and correct behavior.

* **Normal Transactions:** The vast majority (~99.8%) of transactions are not fraudulent and share common characteristics. The model confidently assigns them all a similar, very low probability score.
* **Fraudulent Transactions:** Fraudulent transactions are anomalous and differ from each other in unique ways. The model reflects this by assigning them a wider and more varied range of higher probability scores, reflecting their different levels of "suspiciousness."

---

### 4. How to Interpret the API Response

The JSON response from the prediction API is designed to be comprehensive. It's important to understand the meaning of each key field.

* `"Class"`: This field (`0` or `1`) is the **original, true label** from the input data. It is the "ground truth" and is included for easy comparison and validation. It is *not* a prediction from the model.
* `"fraud_probability"`: This is the model's raw output—a score from 0.0 to 1.0 representing the calculated probability of fraud.
* `"is_fraud_prediction"`: This is the model's final **yes/no decision**, derived by checking if the `fraud_probability` is greater than our `0.2` threshold.
* `"sample_top_flagged"`: This is a list of the top 20 most suspicious transactions. By definition, every transaction in this list has been flagged by the model and will therefore always have an `"is_fraud_prediction"` value of `1`.

