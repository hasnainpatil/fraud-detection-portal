#  Fraud Detection Portal - A Full-Stack MLOps Project

**An end-to-end, cloud-native web application that provides real-time fraud predictions for credit card transactions, built with a production-minded MLOps approach on Microsoft Azure.**

---

### ► [Live Demo Link](https://your-live-app-url.azurewebsites.net) 

*(Replace with the URL of your deployed React app, which will be an Azure Static Web App)*

---

![Demo GIF](https://github.com/hasnainpatil/fraud-detection-portal/blob/main/frontend/_assets/frauddetection.gif?raw=true) 
*(It's highly recommended to record a short GIF of your app in action and embed it here.)*

## Overview

This project is a comprehensive demonstration of a modern, full-stack machine learning system. It is a web portal where users can upload a CSV file of credit card transactions and instantly receive a detailed analysis, including a summary dashboard, a list of the most suspicious transactions, and interactive tools to explore the model's predictions.

The entire system is built on a serverless, event-driven architecture and incorporates best practices in MLOps, cloud infrastructure, and frontend development to create a scalable, reliable, and cost-efficient service.

## Key Features

- **Interactive Dashboard:** Visualizes prediction results with summary cards and a dynamic pie chart.
- **Real-Time Prediction Thresholding:** An interactive "Suspicion Knob" slider allows users to adjust the model's fraud threshold and see the impact on the flagged transaction count in real-time, visually demonstrating the precision-recall trade-off.
- **Prediction Explainability:** A detail view for flagged transactions highlights the specific features that deviated from the "normal" range, providing simple, rule-based explanations for the model's predictions.
- **Drag-and-Drop File Upload:** A modern, user-friendly interface for uploading transaction data.
- **Serverless Backend:** A highly scalable and cost-effective API built with Azure Functions that serves the ML model.

## Technology Stack

| Category              | Technology / Service                               |
| --------------------- | -------------------------------------------------- |
| **Frontend** | React, Vite, Tailwind CSS, Chart.js                |
| **Backend** | Python, Azure Functions                            |
| **Machine Learning** | Scikit-learn, Pandas, LightGBM                     |
| **Cloud Platform** | Microsoft Azure                                    |
| **Data Storage** | Azure Blob Storage (for model artifacts)           |
| **Dev Environment** | GitHub Codespaces                                  |
| **Source Control** | Git & GitHub                                       |

## Architecture

The application follows a decoupled, three-tier architecture:
1.  **Frontend:** A static React single-page application (SPA) provides the user interface. It is responsible for all client-side logic and rendering.
2.  **Backend:** A serverless Azure Function acts as the API gateway. It receives user data, loads the ML model from storage, performs inference, and returns the prediction results.
3.  **ML Model Storage:** The trained LightGBM model artifact is stored in Azure Blob Storage, decoupling it from the application code for independent updates and versioning.

**[► View Detailed Frontend Architecture](./docs/FRONTEND_ARCHITECTURE.md)**

## Technical Highlights & Lessons Learned

This project involved solving several real-world engineering challenges:

- **Model Overfitting:** Diagnosed and resolved a severe overfitting issue by applying regularization techniques (hyperparameter tuning), which was confirmed by analyzing the model's performance metrics (AUC, Precision, Recall).
- **Infrastructure Debugging:** Troubleshooted a persistent platform-level failure by isolating the issue to the hosting plan (`Flex Consumption` vs. `Consumption`) and re-provisioning the infrastructure on a more stable service tier.
- **API Contract Versioning:** Resolved a full-stack integration issue by identifying a mismatch between the data format expected by the frontend and the one served by the backend, demonstrating the importance of maintaining a consistent API contract.

## How to Run Locally

1.  **Clone the repository.**
2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    # Add your STORAGE_CONNECTION_STRING to local.settings.json
    func start
    ```
3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
