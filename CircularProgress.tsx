import React from 'react';
import { formatCurrency } from '../lib/calculateDebt';

interface CircularProgressProps {
  percentage: number; // 0 to 100
  balance: number;
  originalDebt: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  balance,
  originalDebt,
  size = 280,
  strokeWidth = 20,
  color = '#10B981' // Emerald-500
}) => {
  const safePercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 transition-all duration-1000 ease-out"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB" // Gray-200
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Remaining</span>
        <span className="text-4xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(balance)}
        </span>
        <span className="text-sm font-medium text-gray-400 mt-2">
          of {formatCurrency(originalDebt)}
        </span>
        <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          {safePercentage.toFixed(1)}% PAID
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
