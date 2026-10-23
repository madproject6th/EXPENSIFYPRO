import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { StorageService } from '../../services/storageService';
import { calculateCategorySpending, calculateTotals } from '../../services/financialCalculator';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  PieChart,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { transactions, categories, selectedMonth, formatMoney, settings } = useApp();

  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  // Filter transactions according to selected timeframe
  const reportTransactions = useMemo(() => {
    const now = new Date(`${selectedMonth}-15T00:00:00`);
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth();

    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      if (timeframe === 'month') {
        return t.date.startsWith(selectedMonth);
      } else if (timeframe === 'quarter') {
        const txQuarter = Math.floor(txDate.getMonth() / 3);
        const currentQuarter = Math.floor(currentMonthNum / 3);
        return txDate.getFullYear() === currentYear && txQuarter === currentQuarter;
      } else if (timeframe === 'year') {
        return txDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [transactions, selectedMonth, timeframe]);

  // Compute metrics
  const totals = useMemo(() => {
    return calculateTotals(reportTransactions, 0);
  }, [reportTransactions]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategorySpending(reportTransactions, categories);
  }, [reportTransactions, categories]);

  // Top 5 highest expenses
  const topExpenses = useMemo(() => {
    return reportTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [reportTransactions]);

  // Weekly aggregate distribution (Week 1 to Week 4)
  const weeklyDistribution = useMemo(() => {
    const weeks = [
      { label: 'Week 1 (1-7)', income: 0, expense: 0 },
      { label: 'Week 2 (8-14)', income: 0, expense: 0 },
      { label: 'Week 3 (15-21)', income: 0, expense: 0 },
      { label: 'Week 4 (22+)', income: 0, expense: 0 },
    ];

    reportTransactions.forEach((t) => {
      const day = new Date(t.date).getDate();
      let index = 0;
      if (day <= 7) index = 0;
      else if (day <= 14) index = 1;
      else if (day <= 21) index = 2;
      else index = 3;

      if (t.type === 'income') weeks[index].income += t.amount;
      else weeks[index].expense += t.amount;
    });

    const maxVal = Math.max(...weeks.flatMap((w) => [w.income, w.expense]), 100);

    return { weeks, maxVal };
  }, [reportTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    StorageService.exportTransactionsCsv(reportTransactions, categories);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep insights into income streams, spending velocity, and savings efficiency
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setTimeframe('month')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            timeframe === 'month'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Selected Month
        </button>
        <button
          onClick={() => setTimeframe('quarter')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            timeframe === 'quarter'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Quarterly
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            timeframe === 'year'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Year-to-Date
        </button>
        <button
          onClick={() => setTimeframe('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            timeframe === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Period Inflow
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {formatMoney(totals.totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recorded revenue streams</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Period Outflow
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {formatMoney(totals.totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Operating expenses & bills</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Net Surplus / Savings
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              totals.netCashFlow >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {totals.netCashFlow >= 0 ? '+' : ''}
            {formatMoney(totals.netCashFlow)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Effective Savings Rate:{' '}
            <strong className="text-slate-700 dark:text-slate-300 font-mono">
              {totals.savingsRate.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Weekly Velocity Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Weekly Inflow vs Outflow Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bi-weekly comparisons of income and expenditure
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300">Expenses</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 pt-4 h-48 items-end border-b border-slate-100 dark:border-slate-800 pb-2">
          {weeklyDistribution.weeks.map((week, idx) => {
            const incHeight = (week.income / weeklyDistribution.maxVal) * 100;
            const expHeight = (week.expense / weeklyDistribution.maxVal) * 100;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end gap-2 group">
                <div className="flex items-end gap-1.5 sm:gap-3 w-full justify-center h-full">
                  {/* Income bar */}
                  <div
                    style={{ height: `${Math.max(4, incHeight)}%` }}
                    className="w-3 sm:w-6 rounded-t-lg bg-emerald-500 hover:bg-emerald-400 transition-all duration-300 relative"
                    title={`Income: ${formatMoney(week.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(4, expHeight)}%` }}
                    className="w-3 sm:w-6 rounded-t-lg bg-rose-500 hover:bg-rose-400 transition-all duration-300 relative"
                    title={`Expenses: ${formatMoney(week.expense)}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center truncate w-full">
                  {week.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Category Distribution & Largest Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
            Category Expenditure Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Spending allocation ranked by volume
          </p>

          <div className="space-y-3.5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      iconName={cat.icon}
                      color={cat.color}
                      size={16}
                      className="w-6 h-6 p-1 shrink-0"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.categoryName}
                    </span>
                  </div>
                  <div className="font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatMoney(cat.totalSpent)}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
            Top Outflows & Major Charges
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            The largest recorded single transactions in this interval
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topExpenses.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon
                      iconName={cat?.icon || 'Tag'}
                      color={cat?.color || '#EF4444'}
                      size={18}
                      className="w-9 h-9 p-2 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{cat?.name || 'Expense'}</span>
                        <span>·</span>
                        <span>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {formatMoney(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
