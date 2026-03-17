import { useState, useEffect, useMemo } from 'react';
import { calculatePayoffDetails, DebtInput } from './lib/calculateDebt';
import CircularProgress from './components/CircularProgress';
import InputForm from './components/InputForm';
import SummaryCards from './components/SummaryCards';
import AmortizationTable from './components/AmortizationTable';
import { PiggyBank, RotateCcw, Moon, Sun } from 'lucide-react';

const DEFAULT_DEBT: DebtInput = {
  totalDebt: 25000,
  currentBalance: 25000,
  interestRate: 19.99,
  minPayment: 500,
  extraPayment: 200,
  oneTimePayment: 0
};

function App() {
  const [debtData, setDebtData] = useState<DebtInput>(() => {
    const saved = localStorage.getItem('debtData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DEBT;
      }
    }
    return DEFAULT_DEBT;
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('debtData', JSON.stringify(debtData));
  }, [debtData]);

  const results = useMemo(() => calculatePayoffDetails(debtData), [debtData]);

  // Calculate percentage paid based on original total vs current balance
  // If one-time payment is made, it reduces balance effectively.
  // We should probably display the effective balance after one-time payment?
  // For now, let's just stick to the input balance to avoid confusion, 
  // or maybe subtract one-time payment for the visual if it's "applied".
  // The simulation applies it.
  
  const effectiveBalance = Math.max(0, debtData.currentBalance - debtData.oneTimePayment);
  const percentPaid = Math.max(0, Math.min(100, ((debtData.totalDebt - effectiveBalance) / debtData.totalDebt) * 100));

  const handleReset = () => {
    if (confirm('Reset all values to default?')) {
      setDebtData(DEFAULT_DEBT);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <PiggyBank size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">DebtPayoff</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Table */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm overflow-hidden`}>
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                 <h3 className="text-lg font-bold text-gray-800">
                   Plan Configuration
                 </h3>
               </div>
               <InputForm data={debtData} onChange={setDebtData} />
            </div>

            <AmortizationTable schedule={results.schedule} />
          </div>

          {/* Right Column: Visualization & Summary (Sticky on Desktop) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl shadow-lg border p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
              {/* Decorative background gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              <h2 className="text-sm font-semibold text-gray-400 mb-8 uppercase tracking-widest">
                Payoff Progress
              </h2>
              
              <CircularProgress 
                percentage={percentPaid}
                balance={effectiveBalance} 
                originalDebt={debtData.totalDebt}
                color={results.isPayoffPossible ? '#10B981' : '#EF4444'}
                size={300}
                strokeWidth={24}
              />
              
              <div className="mt-8 w-full">
                <SummaryCards result={results} />
              </div>
            </div>

            {/* Insight Card */}
            {results.isPayoffPossible && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <h4 className="text-lg font-bold mb-2">Financial Insight</h4>
                <p className="opacity-90 text-sm leading-relaxed">
                  By paying <span className="font-bold text-yellow-300">${debtData.extraPayment}</span> extra per month, 
                  you will be debt-free <span className="font-bold text-yellow-300">{results.savedMonths} months sooner</span> 
                  and save <span className="font-bold text-yellow-300">${results.savedInterest.toFixed(0)}</span> in interest!
                </p>
              </div>
            )}
          </div>
        
        </div>
      </main>
    </div>
  );
}

export default App;
