import React from 'react';
import { featureRanges } from '../utils/featureRanges';

export default function TransactionDetail({ transaction }) {
  if (!transaction) return null;

  const isAnomalous = (feature, value) => {
    if (!featureRanges[feature]) return false;
    const { min, max } = featureRanges[feature];
    return value < min || value > max;
  };

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
}