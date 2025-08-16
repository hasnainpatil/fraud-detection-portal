Frontend Architecture: Component Hierarchy
The frontend is built using React and follows a component-based architecture. Data flows unidirectionally from parent components to child components via props. The hierarchy is designed to separate concerns, making the application modular and maintainable.

The component tree is as follows:

App.jsx (Root Component)

Description: The main application component. It manages the overall application state (e.g., idle, loading, success, error), handles the API call to the backend, and holds the prediction results. It acts as the central controller for the entire UI.

State Managed: status, results, threshold, selectedTransaction, etc.

Dashboard.jsx

Description: A child of App. It receives the full list of predictions and the current threshold. Its sole responsibility is to display the high-level summary of the results.

Props Received: predictions, threshold, onThresholdChange

Composes:

StatCard.jsx: A small, reusable component to display a single statistic.

ThresholdSlider.jsx: The interactive slider for adjusting the fraud threshold.

Pie (from Chart.js): The chart for visualizing the fraud rate.

ResultsTable.jsx

Description: A child of App. It receives the full list of predictions and the current threshold. It filters this data to display only the top 20 flagged transactions in a table. It also handles user clicks on rows.

Props Received: predictions, threshold, onRowClick, selectedTransaction

TransactionDetail.jsx

Description: A child of App. It is conditionally rendered only when a user selects a transaction. It receives the data for a single transaction and displays all of its features, highlighting any that fall outside a predefined "normal" range.

Props Received: transaction

This structure ensures a clean separation of concerns, where the main App component handles all logic and data fetching, and the child components are primarily responsible for rendering specific parts of the UI.
