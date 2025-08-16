import React, { useState, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- Chart.js Registration ---
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Helper Components (Now included in this file) ---

const UploadIcon = () => ( <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>);
const Spinner = () => (<div className="flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>);
const ErrorToast = ({ message, onDismiss }) => (<div className="fixed bottom-5 right-5 bg-red-500 text-white py-3 px-5 rounded-lg shadow-lg flex items-center animate-fade-in-up"><span className="mr-3">{message}</span><button onClick={onDismiss} className="text-xl font-bold">&times;</button></div>);

// --- UI Components (Now included in this file) ---

const StatCard = ({ label, value, unit }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-bold text-white mt-2">
      {value}
      <span className="text-xl text-blue-400">{unit}</span>
    </p>
  </div>
);

const ThresholdSlider = ({ threshold, onThresholdChange }) => (
  <div className="bg-gray-700 p-4 rounded-lg">
    <label htmlFor="threshold" className="block mb-2 text-sm font-medium text-gray-300">
      Fraud Threshold: <span className="font-bold text-blue-400">{(threshold * 100).toFixed(0)}%</span>
    </label>
    <input
      id="threshold"
      type="range"
      min="0.01"
      max="0.99"
      step="0.01"
      value={threshold}
      onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
    />
     <p className="text-xs text-gray-500 mt-1">Adjust the "suspicion level". A lower threshold flags more transactions.</p>
  </div>
);

const Dashboard = ({ predictions, threshold, onThresholdChange }) => {
  // Defensive check to prevent crashes if predictions is not an array
  if (!Array.isArray(predictions)) {
    return null; // Or return a loading/error state
  }

  const total_rows = predictions.length;
  const flagged_count = predictions.filter(p => p.fraud_probability > threshold).length;
  const flagged_rate = total_rows > 0 ? flagged_count / total_rows : 0;

  const chartData = {
    labels: ['Not Flagged', 'Flagged as Fraud'],
    datasets: [{
      label: '# of Transactions',
      data: [total_rows - flagged_count, flagged_count],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(239, 68, 68, 0.7)'],
      borderColor: ['#3B82F6', '#EF4444'],
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    plugins: { legend: { labels: { color: '#D1D5DB' }}},
    maintainAspectRatio: false,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Total Transactions" value={total_rows} />
          <StatCard label="Flagged as Fraud" value={flagged_count} />
          <StatCard label="Flagged Rate" value={(flagged_rate * 100).toFixed(2)} unit="%" />
        </div>
        <ThresholdSlider threshold={threshold} onThresholdChange={onThresholdChange} />
      </div>
      <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-center h-64 lg:h-auto">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const ResultsTable = ({ predictions, threshold, onRowClick, selectedTransaction }) => {
  // Defensive check
  if (!Array.isArray(predictions)) {
    return <p className="text-center text-gray-400">Waiting for prediction data...</p>;
  }

  const flaggedTransactions = predictions
    .filter(p => p.fraud_probability > threshold)
    .sort((a, b) => b.fraud_probability - a.fraud_probability)
    .slice(0, 20);

  if (flaggedTransactions.length === 0) {
    return <p className="text-center text-gray-400">No transactions were flagged with the current threshold.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-gray-800 border border-gray-700">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-blue-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Time</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">Fraud Probability</th>
            <th scope="col" className="px-6 py-3">Actual Class</th>
          </tr>
        </thead>
        <tbody>
          {flaggedTransactions.map((row, index) => (
            <tr 
              key={index} 
              className={`border-b border-gray-700 transition-colors cursor-pointer ${selectedTransaction && selectedTransaction.Time === row.Time ? 'bg-blue-900/50' : 'hover:bg-gray-600'}`}
              onClick={() => onRowClick(row)}
            >
              <td className="px-6 py-4">{row.Time}</td>
              <td className="px-6 py-4">${row.Amount.toFixed(2)}</td>
              <td className="px-6 py-4 font-medium text-yellow-400">
                {(row.fraud_probability * 100).toFixed(2)}%
              </td>
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  row.Class === 1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {row.Class === 1 ? 'Fraud' : 'Not Fraud'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TransactionDetail = ({ transaction }) => {
  const featureRanges = { V1: { min: -2.77, max: 2.08 }, V2: { min: -2.18, max: 1.81 }, V3: { min: -3.42, max: 2.06 }, V4: { min: -2.85, max: 2.57 }, V5: { min: -2.28, max: 2.10 }, V6: { min: -1.75, max: 3.16 }, V7: { min: -2.25, max: 1.41 }, V8: { min: -0.66, max: 1.05 }, V9: { min: -2.00, max: 1.78 }, V10: { min: -2.59, max: 1.40 }, V11: { min: -2.66, max: 2.68 }, V12: { min: -3.61, max: 1.62 }, V13: { min: -2.22, max: 2.22 }, V14: { min: -3.83, max: 2.40 }, V15: { min: -2.21, max: 2.14 }, V16: { min: -2.90, max: 1.70 }, V17: { min: -3.83, max: 2.02 }, V18: { min: -2.23, max: 1.73 }, V19: { min: -1.89, max: 2.03 }, V20: { min: -0.66, max: 0.84 }, V21: { min: -0.68, max: 0.54 }, V22: { min: -1.54, max: 1.13 }, V23: { min: -0.80, max: 0.49 }, V24: { min: -1.02, max: 0.87 }, V25: { min: -1.05, max: 0.76 }, V26: { min: -0.90, max: 0.92 }, V27: { min: -0.58, max: 0.39 }, V28: { min: -0.40, max: 0.26 }, Amount: { min: 1.00, max: 365.00 }};
  if (!transaction) return null;
  const isAnomalous = (feature, value) => { if (!featureRanges[feature]) return false; const { min, max } = featureRanges[feature]; return value < min || value > max; };
  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <h4 className="text-lg font-semibold text-blue-300 mb-4">Transaction Details (Anomalies Highlighted)</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
        {Object.entries(transaction).map(([key, value]) => (
          <div key={key}>
            <span className="text-gray-400">{key}: </span>
            <span className={isAnomalous(key, value) ? 'text-red-400 font-bold' : 'text-white'}>
              {typeof value === 'number' ? value.toFixed(4) : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SampleData = () => (
  <div className="mt-4 text-center">
    <p className="text-sm text-gray-400">Don't have a file? Use a sample:</p>
    <div className="flex justify-center gap-4 mt-2">
      <a href="/demo.csv" download="demo.csv" className="text-blue-400 hover:text-blue-300 underline transition-colors">Download Sample CSV</a>
    </div>
  </div>
)
// --- Main App Component ---
export default function App() {
  // --- State Management ---
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [threshold, setThreshold] = useState(0.2);
  const [errorMessage, setErrorMessage] = useState('');

  // --- API Interaction ---
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'text/csv') {
      setErrorMessage('Invalid file type. Please upload a .csv file.');
      setStatus('error');
      return;
    }
    setFileName(file.name);
    setStatus('loading');
    setErrorMessage('');
    setSelectedTransaction(null);
    setThreshold(0.2);

    const formData = new FormData();
    formData.append('file', file);
    
    // CRITICAL: Replace this with your actual deployed Function URL
    const API_ENDPOINT = "https://fraud-service-final-hp-cvhugedkcrhxdjby.centralindia-01.azurewebsites.net/api/predict?code=TUbtJF-G7_r5ysBNpzgo6OCrZvyVw_sBjxeVF6JOvYCvAzFuSZ2LJw%3D%3D";

    try {
      const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      setResults(data);
      setStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(error.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };
  
  // --- Event Handlers ---
  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileUpload(e.dataTransfer.files[0]); } }, [handleFileUpload]);
  const handleChange = (e) => { e.preventDefault(); if (e.target.files && e.target.files[0]) { handleFileUpload(e.target.files[0]); }};
  const resetState = () => { setStatus('idle'); setFileName(''); setResults(null); setErrorMessage(''); setSelectedTransaction(null); };

  return (
    <div className="bg-gray-900 text-white min-h-screen w-full flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-400">Fraud Detection Portal</h1>
          <p className="text-gray-400 mt-2">Upload transaction data to instantly receive fraud predictions.</p>
        </header>

        <main>
          {status === 'idle' && (
  <div>
    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="w-full">
      <label htmlFor="input-file-upload" className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon />
          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500">CSV files only</p>
        </div>
        <input id="input-file-upload" type="file" className="hidden" accept=".csv" onChange={handleChange} />
      </label>
      {dragActive && <div className="absolute w-full h-full top-0 left-0" onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </form>
    <SampleData />
  </div>
)}

          {status === 'loading' && (
            <div className="text-center p-10 bg-gray-800 rounded-lg">
              <Spinner />
              <p className="mt-4 text-lg">Analyzing "{fileName}"...</p>
              <p className="text-gray-400">This may take a moment.</p>
            </div>
          )}
          
          {status === 'success' && results && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-2xl font-semibold text-blue-400 mb-2 sm:mb-0">Analysis Complete</h2>
                <button onClick={resetState} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                  Analyze Another File
                </button>
              </div>
              <p className="mb-6 text-gray-400">Results for: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{fileName}</span></p>

              <div className="space-y-8">
                <Dashboard 
                  predictions={results.predictions} 
                  threshold={threshold}
                  onThresholdChange={setThreshold}
                />
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-200">Top Flagged Transactions (Click a row for details)</h3>
                  <ResultsTable 
                    predictions={results.predictions}
                    threshold={threshold}
                    onRowClick={setSelectedTransaction}
                    selectedTransaction={selectedTransaction}
                  />
                </div>

                {selectedTransaction && (
                  <TransactionDetail transaction={selectedTransaction} />
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500">
  <p>Built with modern MLOps principles on Microsoft Azure.</p>
  <a href="https://github.com/hasnainpatil/fraud-detection-portal" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline transition-colors">
    Show Me the Code
  </a>
</footer>
      </div>
      
      {status === 'error' && <ErrorToast message={errorMessage} onDismiss={resetState} />}
    </div>
  );
}
