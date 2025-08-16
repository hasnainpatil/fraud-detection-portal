import React from 'react';
// --- NEW: Import chart components ---
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- NEW: Register the components we need for a pie chart ---
ChartJS.register(ArcElement, Tooltip, Legend);

// This is our existing StatCard component, no changes needed here.
const StatCard = ({ label, value, unit }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-bold text-white mt-2">
      {value}
      <span className="text-xl text-blue-400">{unit}</span>
    </p>
  </div>
);

// The main Dashboard component
export default function Dashboard({ results }) {
  // --- NEW: Prepare the data for our Pie Chart ---
  const chartData = {
    labels: ['Not Flagged', 'Flagged as Fraud'],
    datasets: [
      {
        label: '# of Transactions',
        data: [results.total_rows - results.flagged_count, results.flagged_count],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // Blue-500 with 70% opacity
          'rgba(239, 68, 68, 0.7)',  // Red-500 with 70% opacity
        ],
        borderColor: [
          '#3B82F6', // Blue-500
          '#EF4444', // Red-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#D1D5DB', // text-gray-300
        }
      }
    },
    maintainAspectRatio: false,
  };

  // --- UPDATED: New layout with the pie chart ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Transactions" value={results.total_rows} />
        <StatCard label="Flagged as Fraud" value={results.flagged_count} />
        <StatCard label="Flagged Rate" value={(results.flagged_rate * 100).toFixed(2)} unit="%" />
      </div>
      <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-center h-64 lg:h-auto">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}