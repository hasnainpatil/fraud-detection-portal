# 🏗️ Frontend Architecture: Component Hierarchy

The frontend is built with **React** and follows a modern, component-based architecture. This design promotes a clean separation of concerns and a unidirectional data flow (from parent to child components via props), making the application modular, scalable, and easy to maintain.

---

## Component Tree

### 👑 `App.jsx` (Root Component)

> **Description:** This is the primary controller for the entire application. It manages the overall UI state, handles all communication with the backend API, and serves as the single source of truth for the prediction data.

```js
// State Managed:
{
  status: 'idle' | 'loading' | 'success' | 'error',
  results: { ... },
  threshold: 0.2,
  selectedTransaction: { ... }
}

↳ Children of App.jsx
📊 Dashboard.jsx
Description: Receives the full list of predictions and the current threshold from App. Its sole responsibility is to display the high-level summary dashboard with statistics and interactive controls.

// Props Received:
{
  predictions: [],
  threshold: 0.2,
  onThresholdChange: Function
}

Composes:

StatCard.jsx: A small, reusable component for displaying a single statistic.

ThresholdSlider.jsx: The interactive "Suspicion Knob" for adjusting the fraud threshold.

Pie (from Chart.js): The chart for visualizing the fraud rate.

📋 ResultsTable.jsx
Description: Receives the prediction data and threshold from App. It filters this data on the client-side to display a sorted list of the top 20 most suspicious transactions. It also handles user clicks to select a row for detailed inspection.

// Props Received:
{
  predictions: [],
  threshold: 0.2,
  onRowClick: Function,
  selectedTransaction: { ... }
}

🔍 TransactionDetail.jsx
Description: This component is only rendered when a user selects a transaction from the table. It receives the data for that single transaction and displays all of its features, visually highlighting any values that fall outside a predefined "normal" range to provide simple explainability.

// Props Received:
{
  transaction: { ... }
}
