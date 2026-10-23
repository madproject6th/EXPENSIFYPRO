import { BudgetConfig, Category, RecurringBill, Transaction } from '../types';

/**
 * Utility to safely round financial values to 2 decimal places to avoid floating point anomalies
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Format currency with symbol, commas, and position (e.g. Rs. 125,000.00)
 */
export function formatCurrency(
  amount: number,
  currency: { symbol: string; position?: 'prefix' | 'suffix'; code?: string }
): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const symbol = currency.symbol === 'PKR' ? 'Rs. ' : currency.symbol.endsWith(' ') || currency.symbol === 'Rs.' ? `${currency.symbol} ` : currency.symbol;

  const formatted =
    currency.position === 'suffix'
      ? `${absVal} ${currency.symbol}`
      : `${symbol}${absVal}`;

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format date in Pakistan Standard Time (PKT, UTC+05:00) with DD-MM-YYYY default
 */
export function formatPakistanDate(
  dateInput: string | Date,
  format: 'DD-MM-YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' = 'DD-MM-YYYY'
): string {
  const d = new Date(dateInput);
  // Adjust or format in PKT (UTC+5)
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'DD-MM-YYYY') {
    return `${day}-${month}-${year}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Filter transactions by month string ('YYYY-MM')
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  yearMonth: string // e.g. "2026-10"
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(yearMonth));
}

/**
 * Calculate totals for a given list of transactions
 */
export function calculateTotals(
  transactions: Transaction[],
  openingBalance: number = 0
): {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  availableBalance: number;
  savingsRate: number; // percentage
} {
  let income = 0;
  let expenses = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      income += Number(t.amount) || 0;
    } else if (t.type === 'expense') {
      expenses += Number(t.amount) || 0;
    }
  }

  income = roundCurrency(income);
  expenses = roundCurrency(expenses);
  const netCashFlow = roundCurrency(income - expenses);
  const availableBalance = roundCurrency(openingBalance + netCashFlow);
  const savingsRate = income > 0 ? Math.max(0, roundCurrency(((income - expenses) / income) * 100)) : 0;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netCashFlow,
    availableBalance,
    savingsRate,
  };
}

/**
 * Calculate spending breakdown by category
 */
export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  totalSpent: number;
  percentage: number;
  budgetLimit?: number;
  isOverBudget?: boolean;
}

export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[],
  categoryBudgets: Record<string, number> = {}
): CategorySpending[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const spendMap = new Map<string, number>();
  for (const t of expenseTransactions) {
    const current = spendMap.get(t.categoryId) || 0;
    spendMap.set(t.categoryId, current + (Number(t.amount) || 0));
  }

  const results: CategorySpending[] = [];
  spendMap.forEach((spent, categoryId) => {
    const cat = categoryMap.get(categoryId);
    const roundedSpent = roundCurrency(spent);
    const percentage = totalExpense > 0 ? roundCurrency((roundedSpent / totalExpense) * 100) : 0;
    const budgetLimit = categoryBudgets[categoryId] ?? cat?.budgetLimit;

    results.push({
      categoryId,
      categoryName: cat ? cat.name : 'Uncategorized',
      color: cat ? cat.color : '#64748B',
      icon: cat ? cat.icon : 'Tag',
      totalSpent: roundedSpent,
      percentage,
      budgetLimit,
      isOverBudget: budgetLimit ? roundedSpent > budgetLimit : false,
    });
  });

  return results.sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Calculate Monthly Budget Progress
 */
export interface BudgetStatus {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  isWarning: boolean; // >= 80%
  isExceeded: boolean; // >= 100%
  dailyAllowanceRemaining: number;
  daysRemainingInMonth: number;
}

export function calculateBudgetStatus(
  transactions: Transaction[],
  budget: BudgetConfig,
  currentDate: Date = new Date()
): BudgetStatus {
  const totalSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const roundedSpent = roundCurrency(totalSpent);
  const totalBudget = budget.totalBudget || 0;
  const remainingBudget = roundCurrency(totalBudget - roundedSpent);
  const percentageUsed = totalBudget > 0 ? roundCurrency((roundedSpent / totalBudget) * 100) : 0;

  // Days left in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemainingInMonth = Math.max(1, lastDayOfMonth - currentDay + 1);

  const dailyAllowanceRemaining =
    remainingBudget > 0 ? roundCurrency(remainingBudget / daysRemainingInMonth) : 0;

  const threshold = (budget.alertThreshold || 0.8) * 100;

  return {
    totalBudget,
    totalSpent: roundedSpent,
    remainingBudget,
    percentageUsed,
    isWarning: percentageUsed >= threshold && percentageUsed < 100,
    isExceeded: percentageUsed >= 100,
    dailyAllowanceRemaining,
    daysRemainingInMonth,
  };
}

/**
 * Group transactions by formatted date string
 */
export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  
  // Sort descending by date
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const t of sorted) {
    const dateKey = t.date.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(t);
  }

  return groups;
}

/**
 * Format relative friendly date (e.g. "Today", "Yesterday", or "Oct 21, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  const target = new Date(dateStr);
  const today = new Date();
  
  const isSameDay =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();

  if (isSameDay) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    target.getFullYear() === yesterday.getFullYear() &&
    target.getMonth() === yesterday.getMonth() &&
    target.getDate() === yesterday.getDate();

  if (isYesterday) return 'Yesterday';

  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Check recurring bills that are due and auto-process if enabled
 */
export function processDueBills(
  bills: RecurringBill[],
  currentDate: Date = new Date()
): {
  dueBills: RecurringBill[];
  newTransactions: Transaction[];
  updatedBills: RecurringBill[];
} {
  const todayIso = currentDate.toISOString().split('T')[0];
  const newTransactions: Transaction[] = [];
  const updatedBills: RecurringBill[] = [];
  const dueBills: RecurringBill[] = [];

  for (const bill of bills) {
    if (bill.status !== 'active') {
      updatedBills.push(bill);
      continue;
    }

    const dueDate = bill.nextDueDate.split('T')[0];
    const isDue = dueDate <= todayIso;

    if (isDue) {
      dueBills.push(bill);

      // Check if already processed for this due date to prevent duplicate transactions
      const alreadyProcessed = bill.lastProcessedDate === dueDate;

      if (bill.autoProcess && !alreadyProcessed) {
        // Create corresponding transaction
        newTransactions.push({
          id: `rec-tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'expense',
          title: bill.title,
          amount: bill.amount,
          categoryId: bill.categoryId,
          date: new Date().toISOString(),
          paymentMethod: bill.paymentMethod,
          notes: `Auto-processed recurring bill (${bill.frequency})`,
          isRecurring: true,
          recurringBillId: bill.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Compute next due date
        const nextDate = computeNextDueDate(new Date(bill.nextDueDate), bill.frequency);
        updatedBills.push({
          ...bill,
          lastProcessedDate: dueDate,
          nextDueDate: nextDate.toISOString().split('T')[0],
        });
      } else {
        updatedBills.push(bill);
      }
    } else {
      updatedBills.push(bill);
    }
  }

  return { dueBills, newTransactions, updatedBills };
}

export function computeNextDueDate(fromDate: Date, frequency: RecurringBill['frequency']): Date {
  const next = new Date(fromDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}
