// ResultsTable.jsx (Updated)
import React from 'react';

export default function ResultsTable({ data, onRowClick, selectedTransaction }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400">No transactions were flagged as fraud.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-gray-800 border border-gray-700">
      <table className="w-full text-sm text-left text-gray-300">
        {/* ... table head is the same ... */}
        <thead className="text-xs text-blue-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Time</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">Fraud Probability</th>
            <th scope="col" className="px-6 py-3">Actual Class</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
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
}