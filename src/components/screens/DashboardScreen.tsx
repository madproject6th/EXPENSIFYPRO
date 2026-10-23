import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CreditCard,
  Plus,
  Receipt,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    totals,
    budgetStatus,
    categorySpending,
    currentMonthTransactions,
    setActiveTab,
    setIsAddModalOpen,
    setModalDefaultType,
    setSelectedDetailTx,
    formatMoney,
    selectedMonth,
    bills,
    markBillAsPaid,
  } = useApp();

  const recentTransactions = currentMonthTransactions.slice(0, 5);

  // Compute upcoming bills due in the next 10 days
  const upcomingBills = bills
    .filter((b) => b.status === 'active')
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time ledger overview for{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setModalDefaultType('income');
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => {
              setModalDefaultType('expense');
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 text-xs sm:text-sm font-semibold hover:bg-rose-100 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Metric Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={totals.availableBalance} formatter={formatMoney} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Net Cash Flow:</span>
              <span
                className={`font-semibold font-mono ${
                  totals.netCashFlow >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {totals.netCashFlow >= 0 ? '+' : ''}
                {formatMoney(totals.netCashFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              <AnimatedCounter value={totals.totalIncome} formatter={formatMoney} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Savings Rate: <span className="font-semibold text-emerald-600 font-mono">{totals.savingsRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={totals.totalExpenses} formatter={formatMoney} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across <span className="font-semibold font-mono">{currentMonthTransactions.filter((t) => t.type === 'expense').length}</span> recorded expenses
            </div>
          </div>
        </div>

        {/* Card 4: Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Budget Left</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                budgetStatus.isExceeded
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                  : budgetStatus.isWarning
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
            >
              {budgetStatus.isExceeded ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${
                budgetStatus.remainingBudget < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              <AnimatedCounter value={budgetStatus.remainingBudget} formatter={formatMoney} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold font-mono">{budgetStatus.percentageUsed.toFixed(0)}%</span> of {formatMoney(budgetStatus.totalBudget)} limit used
            </div>
          </div>
        </div>
      </div>

      {/* Budget Warning Callout if reaching 80% or exceeded */}
      {(budgetStatus.isWarning || budgetStatus.isExceeded) && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            budgetStatus.isExceeded
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                {budgetStatus.isExceeded
                  ? 'Monthly Budget Cap Exceeded!'
                  : 'Budget Alert: Over 80% Spent'}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                {budgetStatus.isExceeded
                  ? `You have surpassed your ${formatMoney(budgetStatus.totalBudget)} limit by ${formatMoney(
                      Math.abs(budgetStatus.remainingBudget)
                    )}.`
                  : `You have consumed ${budgetStatus.percentageUsed.toFixed(0)}% of your monthly allowance with ${
                      budgetStatus.daysRemainingInMonth
                    } days left.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Main 2-Column Split: Cashflow vs Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Cash Flow & Velocity */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Income vs Expense Balance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual ratio of cash inflows to outgoing expenditure
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Full Reports <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comparative Progress Bar */}
          <div className="my-2">
            <div className="h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
              <div
                style={{
                  width: `${
                    totals.totalIncome + totals.totalExpenses > 0
                      ? (totals.totalIncome / (totals.totalIncome + totals.totalExpenses)) * 100
                      : 50
                  }%`,
                }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Income: ${formatMoney(totals.totalIncome)}`}
              />
              <div
                style={{
                  width: `${
                    totals.totalIncome + totals.totalExpenses > 0
                      ? (totals.totalExpenses / (totals.totalIncome + totals.totalExpenses)) * 100
                      : 50
                  }%`,
                }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`Expenses: ${formatMoney(totals.totalExpenses)}`}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Income Inflow</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {formatMoney(totals.totalIncome)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Expenses Out</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {formatMoney(totals.totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Progress Meter */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Monthly Budget Utilization
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {formatMoney(budgetStatus.totalSpent)} / {formatMoney(budgetStatus.totalBudget)} (
                {budgetStatus.percentageUsed.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, budgetStatus.percentageUsed)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetStatus.isExceeded
                    ? 'bg-rose-600'
                    : budgetStatus.isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{budgetStatus.daysRemainingInMonth} days remaining in month</span>
              <span>
                Safe daily burn: {formatMoney(budgetStatus.dailyAllowanceRemaining)}/day
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Category Spending Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Top Spending
              </h3>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Categories
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              {categorySpending.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No expense records in this period
                </div>
              ) : (
                categorySpending.slice(0, 4).map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon
                          iconName={cat.icon}
                          color={cat.color}
                          size={14}
                          className="w-6 h-6 p-1 shrink-0"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatMoney(cat.totalSpent)}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {/* Tiny bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, cat.percentage)}%`,
                          backgroundColor: cat.color,
                        }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Categories:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {categorySpending.length} active
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Recurring Bills Strip */}
      {upcomingBills.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                Upcoming Recurring Bills & Subscriptions
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Manage Bills
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-slate-100">{bill.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Due: {new Date(bill.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-100 font-mono">
                    {formatMoney(bill.amount)}
                  </span>
                  <button
                    onClick={() => markBillAsPaid(bill.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold transition-colors"
                  >
                    Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest financial activity recorded in your ledger
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({currentMonthTransactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No transactions yet for this period
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Click Add Expense or Add Income to log your first record.
            </p>
            <button
              onClick={() => {
                setModalDefaultType('expense');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedDetailTx(tx)}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                      {tx.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
