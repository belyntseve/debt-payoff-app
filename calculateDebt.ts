export interface DebtInput {
  totalDebt: number; // Original total debt amount
  currentBalance: number;
  interestRate: number; // Annual %
  minPayment: number;
  extraPayment: number;
  oneTimePayment: number;
}

export interface MonthData {
  month: number;
  remainingBalance: number;
  interestPaid: number;
  principalPaid: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  paymentAmount: number;
}

export interface CalculationResult {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  schedule: MonthData[];
  isPayoffPossible: boolean;
  warningMessage?: string;
  totalPaid: number;
}

export interface ComparisonResult extends CalculationResult {
  savedInterest: number;
  savedMonths: number;
  baseline: CalculationResult;
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyPrecise = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

function simulatePayoff(
  startBalance: number, 
  interestRate: number, 
  minPayment: number, 
  monthlyExtra: number, 
  oneTime: number
): CalculationResult {
  let balance = startBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let totalPrincipal = 0;
  const schedule: MonthData[] = [];
  const monthlyRate = (interestRate / 100) / 12;
  
  // Apply one-time payment first? Usually one-time payment is an immediate reduction.
  if (oneTime > 0) {
    const payment = Math.min(balance, oneTime);
    balance -= payment;
    // We don't count one-time payment as "interest paid", just principal reduction
    totalPrincipal += payment;
    totalPaid += payment;
  }
  
  const totalMonthlyPayment = minPayment + monthlyExtra;
  
  // Check if payment covers interest
  // If balance became 0 due to one-time payment, we are done
  if (balance <= 0.01) {
    const today = new Date();
    return {
      months: 0,
      totalInterest: 0,
      payoffDate: today,
      schedule: [],
      isPayoffPossible: true,
      totalPaid
    };
  }

  // Initial interest check
  const firstMonthInterest = balance * monthlyRate;
  if (totalMonthlyPayment <= firstMonthInterest) {
     const today = new Date();
     return {
      months: 0,
      totalInterest: 0,
      payoffDate: today,
      schedule: [],
      isPayoffPossible: false,
      warningMessage: "Monthly payment is too low to cover interest charges.",
      totalPaid: 0
    };
  }
  
  let month = 0;
  const MAX_MONTHS = 1200; // 100 years
  
  while (balance > 0.01 && month < MAX_MONTHS) {
    month++;
    
    const interestCharge = balance * monthlyRate;
    let payment = totalMonthlyPayment;
    
    // If we can pay off the remainder
    if (balance + interestCharge <= payment) {
      payment = balance + interestCharge;
    }
    
    const principalComponent = payment - interestCharge;
    
    balance -= principalComponent;
    if (balance < 0) balance = 0;
    
    totalInterest += interestCharge;
    totalPrincipal += principalComponent;
    totalPaid += payment;
    
    schedule.push({
      month,
      remainingBalance: balance,
      interestPaid: interestCharge,
      principalPaid: principalComponent,
      totalInterestPaid: totalInterest,
      totalPrincipalPaid: totalPrincipal,
      paymentAmount: payment
    });
  }
  
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(today.getMonth() + month);
  
  return {
    months: month,
    totalInterest,
    payoffDate: futureDate,
    schedule,
    isPayoffPossible: month < MAX_MONTHS,
    warningMessage: month >= MAX_MONTHS ? "Payoff timeline exceeds 100 years" : undefined,
    totalPaid
  };
}

export function calculatePayoffDetails(input: DebtInput): ComparisonResult {
  const { currentBalance, interestRate, minPayment, extraPayment, oneTimePayment } = input;
  
  // 1. Calculate Baseline (No extra payments, no one-time payment)
  const baseline = simulatePayoff(currentBalance, interestRate, minPayment, 0, 0);
  
  // 2. Calculate Actual (With extra payments)
  const actual = simulatePayoff(currentBalance, interestRate, minPayment, extraPayment, oneTimePayment);
  
  // Calculate savings
  let savedInterest = 0;
  let savedMonths = 0;
  
  if (baseline.isPayoffPossible && actual.isPayoffPossible) {
    savedInterest = Math.max(0, baseline.totalInterest - actual.totalInterest);
    savedMonths = Math.max(0, baseline.months - actual.months);
  }
  
  return {
    ...actual,
    savedInterest,
    savedMonths,
    baseline
  };
}
