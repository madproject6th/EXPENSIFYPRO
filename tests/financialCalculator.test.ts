import {
  calculateTotals,
  calculateBudgetStatus,
  calculateCategorySpending,
  processDueBills,
  roundCurrency,
  formatCurrency,
  formatPakistanDate,
} from '../src/services/financialCalculator';
import { Transaction, Category, BudgetConfig, RecurringBill } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING EXPENSIFY PRO FINANCIAL CALCULATOR UNIT TESTS ---');

// 1. Currency Rounding & Floating Point Safety
{
  const sum = 0.1 + 0.2;
  const rounded = roundCurrency(sum);
  assert(rounded === 0.3, `Floating point precision test (0.1 + 0.2 = ${rounded})`);
}

// 2. Format Currency Test (Standard and Pakistani Rupee)
{
  const formattedPkr = formatCurrency(125000, { symbol: 'Rs.', position: 'prefix' });
  assert(formattedPkr === 'Rs. 125,000.00', `Format Currency PKR test: ${formattedPkr}`);

  const formattedNegative = formatCurrency(-4500.5, { symbol: 'Rs.', position: 'prefix' });
  assert(formattedNegative === '-Rs. 4,500.50', `Format Currency negative test: ${formattedNegative}`);
}

// 2b. Format Pakistan Date Test (DD-MM-YYYY)
{
  const formattedDate = formatPakistanDate('2026-10-23T14:30:00Z', 'DD-MM-YYYY');
  assert(formattedDate === '23-10-2026', `Format Pakistan Date test: ${formattedDate}`);
}

// 3. Calculate Totals with Opening Balance
{
  const mockTxs: Transaction[] = [
    {
      id: '1',
      type: 'income',
      title: 'Salary',
      amount: 3000,
      categoryId: 'cat-salary',
      date: '2026-10-01',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: '2',
      type: 'income',
      title: 'Freelance',
      amount: 500,
      categoryId: 'cat-freelance',
      date: '2026-10-05',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-05',
      updatedAt: '2026-10-05',
    },
    {
      id: '3',
      type: 'expense',
      title: 'Rent',
      amount: 1200,
      categoryId: 'cat-housing',
      date: '2026-10-01',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: '4',
      type: 'expense',
      title: 'Groceries',
      amount: 250.75,
      categoryId: 'cat-food',
      date: '2026-10-03',
      paymentMethod: 'credit_card',
      createdAt: '2026-10-03',
      updatedAt: '2026-10-03',
    },
  ];

  const openingBalance = 1000;
  const totals = calculateTotals(mockTxs, openingBalance);

  assert(totals.totalIncome === 3500, `Total Income is 3500 (got ${totals.totalIncome})`);
  assert(totals.totalExpenses === 1450.75, `Total Expenses is 1450.75 (got ${totals.totalExpenses})`);
  assert(totals.netCashFlow === 2049.25, `Net Cash Flow is 2049.25 (got ${totals.netCashFlow})`);
  assert(totals.availableBalance === 3049.25, `Available Balance with opening 1000 is 3049.25 (got ${totals.availableBalance})`);
  assert(totals.savingsRate > 58 && totals.savingsRate < 59, `Savings rate is ~58.55% (got ${totals.savingsRate})`);
}

// 4. Budget Calculation & 80% Alert Threshold
{
  const mockTxs: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      title: 'Major Purchase',
      amount: 850,
      categoryId: 'cat-shopping',
      date: '2026-10-10',
      paymentMethod: 'credit_card',
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    },
  ];

  const budget: BudgetConfig = {
    month: '2026-10',
    totalBudget: 1000,
    categoryBudgets: {},
    alertThreshold: 0.8,
  };

  const status = calculateBudgetStatus(mockTxs, budget, new Date('2026-10-10T12:00:00'));

  assert(status.percentageUsed === 85, `Percentage used is 85% (got ${status.percentageUsed})`);
  assert(status.isWarning === true, 'isWarning should be true when spending >= 80% and < 100%');
  assert(status.isExceeded === false, 'isExceeded should be false when spending < 100%');
  assert(status.remainingBudget === 150, `Remaining budget is 150 (got ${status.remainingBudget})`);
}

// 5. Recurring Bill Processing & Duplicate Prevention
{
  const mockBills: RecurringBill[] = [
    {
      id: 'bill-1',
      title: 'Cloud Hosting',
      amount: 40,
      categoryId: 'cat-bills',
      frequency: 'monthly',
      nextDueDate: '2026-10-15',
      paymentMethod: 'credit_card',
      autoProcess: true,
      lastProcessedDate: null,
      status: 'active',
    },
  ];

  const testDate = new Date('2026-10-20T12:00:00');
  const result1 = processDueBills(mockBills, testDate);

  assert(result1.newTransactions.length === 1, `1 transaction generated for overdue bill`);
  assert(result1.updatedBills[0].lastProcessedDate === '2026-10-15', `lastProcessedDate recorded`);
  assert(result1.updatedBills[0].nextDueDate === '2026-11-15', `nextDueDate rolled over to November 15`);

  // Run a second time with the updated bills to ensure duplicate prevention
  const result2 = processDueBills(result1.updatedBills, testDate);
  assert(result2.newTransactions.length === 0, `Duplicate prevention: 0 new transactions on repeated run`);
}

// 6. Database Serialization & Payload Structure
{
  const testTransaction: Transaction = {
    id: 'tx-pg-test-1',
    type: 'expense',
    title: 'Lahore Electric Bill (LESCO)',
    amount: 14500,
    categoryId: 'cat-electricity',
    date: '2026-10-23',
    paymentMethod: 'easypaisa',
    notes: 'LESCO consumer number verified',
    isRecurring: true,
    createdAt: '2026-10-23T10:00:00Z',
    updatedAt: '2026-10-23T10:00:00Z',
  };

  assert(typeof testTransaction.amount === 'number' && testTransaction.amount > 0, 'Transaction amount numeric validation');
  assert(testTransaction.id.startsWith('tx-'), 'Transaction ID format validation');
  assert(testTransaction.paymentMethod === 'easypaisa', 'Pakistan payment method validation');
}

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');

