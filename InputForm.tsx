import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Percent, Calendar, Plus, Wallet, LucideIcon } from 'lucide-react';
import { DebtInput } from '../lib/calculateDebt';

interface InputFormProps {
  data: DebtInput;
  onChange: (data: DebtInput) => void;
}

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  icon?: LucideIcon;
  placeholder?: string;
  label: string;
  className?: string;
  iconColor?: string;
  helpText?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  icon: Icon, 
  placeholder, 
  label, 
  className,
  iconColor = "text-gray-400",
  helpText
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    const parsedLocal = parseFloat(localValue);

    // 1. Handle empty string case (NaN) matching value 0
    if (localValue === '' && value === 0) return;

    // 2. Handle single decimal point case (NaN) matching value 0
    if (localValue === '.' && value === 0) return;

    // 3. Handle cases where parsing ignores trailing decimals (e.g. "1." vs 1)
    // If the parsed local value matches the prop value, we assume the user is typing
    // and we should NOT overwrite their local string state.
    if (!Number.isNaN(parsedLocal) && parsedLocal === value) {
      return;
    }
    
    // Otherwise, the external value has changed significantly (or we are initializing),
    // so we must sync.
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Only allow digits and one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(val)) return;

    setLocalValue(val);

    if (val === '' || val === '.') {
      onChange(0);
    } else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={16} className={iconColor} />
          </div>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          className={`pl-9 block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors ${className}`}
          placeholder={placeholder}
        />
        {helpText && (
          <p className="text-xs mt-2 text-gray-500">{helpText}</p>
        )}
      </div>
    </div>
  );
};

const InputForm: React.FC<InputFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'extra'>('basic');

  const updateField = (field: keyof DebtInput, value: number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'basic' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard size={16} />
            <span>Debt Details</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('extra')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'extra' 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Wallet size={16} />
            <span>Extra Payments</span>
          </div>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'basic' ? (
          <div className="space-y-5">
            <NumberInput
              label="Original Total Debt"
              value={data.totalDebt}
              onChange={(val) => updateField('totalDebt', val)}
              icon={DollarSign}
              placeholder="25000"
            />

            <NumberInput
              label="Current Balance"
              value={data.currentBalance}
              onChange={(val) => updateField('currentBalance', val)}
              icon={DollarSign}
              placeholder="20000"
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Interest Rate (APR)"
                value={data.interestRate}
                onChange={(val) => updateField('interestRate', val)}
                icon={Percent}
                placeholder="19.99"
              />
              
              <NumberInput
                label="Min Monthly Pay"
                value={data.minPayment}
                onChange={(val) => updateField('minPayment', val)}
                icon={DollarSign}
                placeholder="500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <label className="flex items-center justify-between text-sm font-medium text-green-900 mb-2">
                <span>Extra Monthly Payment</span>
                <span className="text-green-700 font-bold">${data.extraPayment}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={data.extraPayment}
                onChange={(e) => updateField('extraPayment', parseFloat(e.target.value))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600 mb-4"
              />
              
              <NumberInput
                label="" 
                value={data.extraPayment}
                onChange={(val) => updateField('extraPayment', val)}
                icon={Plus}
                iconColor="text-green-500"
                className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500 text-green-900"
                placeholder="0"
              />
              <p className="text-xs text-green-600 mt-2">
                Adding extra payments drastically reduces interest paid.
              </p>
            </div>

            <NumberInput
              label="One-Time Lump Sum"
              value={data.oneTimePayment}
              onChange={(val) => updateField('oneTimePayment', val)}
              icon={Calendar}
              placeholder="0"
              helpText="Applied immediately to principal."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
