# Frontend Architecture: Component Hierarchy

The frontend is built using **React** and follows a *component-based architecture*.

**Data flows unidirectionally** from parent components to child components via props.

This hierarchy ensures clear separation of concerns, modularity, and maintainability.

## Component Tree
App.jsx
├── Dashboard.jsx
│ ├── StatCard.jsx
│ ├── ThresholdSlider.jsx
│ └── Pie (Chart.js)
├── ResultsTable.jsx
└── TransactionDetail.jsx (conditional)

## Component Descriptions

### **`App.jsx`** *(Root Component)*

**Description:** 
The main application component. Manages overall application state (e.g., `idle`, `loading`, `success`, `error`), handles the API call to the backend, and stores prediction results. Acts as the central controller for the entire UI.

**State Managed:** 
`status`, `results`, `threshold`, `selectedTransaction`, etc.

### **`Dashboard.jsx`**

**Description:** 
Child of `App`. Receives the full list of predictions and current threshold. Responsible for displaying the high-level summary of the results.

**Props Received:**
- `predictions`
- `threshold`
- `onThresholdChange`

**Composes:**
- `StatCard.jsx`: Displays a single statistic
- `ThresholdSlider.jsx`: Interactive slider for fraud threshold
- `Pie` (from Chart.js): Visualizes the fraud rate

### **`ResultsTable.jsx`**

**Description:** 
Child of `App`. Receives the full list of predictions and the current threshold. Filters this data to display only the top 20 flagged transactions in a table. Handles user clicks on rows.

**Props Received:**
- `predictions`
- `threshold`
- `onRowClick`
- `selectedTransaction`

### **`TransactionDetail.jsx`**

**Description:** 
Child of `App`. Conditionally rendered only when a user selects a transaction. Receives data for a single transaction and displays all its features, highlighting any values outside a predefined "normal" range.

**Props Received:**
- `transaction`

## Design Principle

This structure ensures a clean separation of concerns:

- The main `App` component manages all logic and data fetching
- Child components focus solely on rendering their designated UI sections
