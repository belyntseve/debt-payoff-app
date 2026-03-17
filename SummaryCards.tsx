import React from 'react';
import { Calendar, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { ComparisonResult, formatCurrency } from '../lib/calculateDebt';

interface SummaryCardsProps {
  result: ComparisonResult;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ result }) => {
  if (!result.isPayoffPossible) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Payoff Warning</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{result.warningMessage || "Your payment is too low to cover the interest."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const payoffMonthStr = result.payoffDate.toLocaleString('default', { month: 'short', year: 'numeric' });
  const interestSaved = result.savedInterest;
  const timeSaved = result.savedMonths;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Payoff Date */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Calendar size={18} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Payoff Date</span>
        </div>
        <div className="text-xl font-bold text-gray-900">{payoffMonthStr}</div>
        <div className="text-xs text-gray-500 mt-1">In {result.months} months</div>
      </div>

      {/* Total Interest */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <TrendingDown size={18} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Interest</span>
        </div>
        <div className="text-xl font-bold text-gray-900">{formatCurrency(result.totalInterest)}</div>
        <div className="text-xs text-gray-500 mt-1">Cost of borrowing</div>
      </div>

      {/* Savings (Conditional) */}
      {(interestSaved > 0 || timeSaved > 0) && (
        <div className="col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                You're Saving
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(interestSaved)}
                </span>
                {timeSaved > 0 && (
                  <span className="text-sm font-medium text-emerald-600">
                    & {timeSaved} months
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards;
