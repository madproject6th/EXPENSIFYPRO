import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { AnimatedCounter } from '../common/AnimatedCounter';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit2,
  PieChart,
  Plus,
  ShieldCheck,
  TrendingDown,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const BudgetsScreen: React.FC = () => {
  const {
    categories,
    budgets,
    saveBudget,
    selectedMonth,
    budgetStatus,
    categorySpending,
    formatMoney,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTotalBudget, setModalTotalBudget] = useState(budgetStatus.totalBudget.toString());
  const [modalCategoryBudgets, setModalCategoryBudgets] = useState<Record<string, string>>(() => {
    const current = budgets.find((b) => b.month === selectedMonth)?.categoryBudgets || {};
    const res: Record<string, string> = {};
    Object.keys(current).forEach((k) => {
      res[k] = current[k].toString();
    });
    return res;
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleOpenEdit = () => {
    const current = budgets.find((b) => b.month === selectedMonth);
    setModalTotalBudget((current?.totalBudget || 2800).toString());
    const catMap: Record<string, string> = {};
    expenseCategories.forEach((cat) => {
      catMap[cat.id] = (current?.categoryBudgets?.[cat.id] ?? cat.budgetLimit ?? 200).toString();
    });
    setModalCategoryBudgets(catMap);
    setIsEditModalOpen(true);
  };

  const handleSaveBudgetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(modalTotalBudget) || 0;
    const catBudgets: Record<string, number> = {};
    Object.entries(modalCategoryBudgets).forEach(([id, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) catBudgets[id] = num;
    });

    saveBudget(selectedMonth, total, catBudgets);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure monthly targets, category limits, and proactive burn alerts
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Budgets</span>
        </button>
      </div>

      {/* Primary Overview Budget Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          {/* Circular Progress Ring */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray="364.4"
                  strokeDashoffset={
                    364.4 - (364.4 * Math.min(100, budgetStatus.percentageUsed)) / 100
                  }
                  strokeLinecap="round"
                  className={`transition-all duration-700 ${
                    budgetStatus.isExceeded
                      ? 'text-rose-500'
                      : budgetStatus.isWarning
                      ? 'text-amber-500'
                      : 'text-emerald-400'
                  }`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {budgetStatus.percentageUsed.toFixed(0)}%
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Consumed
                </span>
              </div>
            </div>
          </div>

          {/* Core Numbers */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Total Budget
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                {formatMoney(budgetStatus.totalBudget)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Actual Spent
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {formatMoney(budgetStatus.totalSpent)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Remaining Balance
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  budgetStatus.remainingBudget < 0 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {formatMoney(budgetStatus.remainingBudget)}
              </span>
            </div>

            {/* Daily Burn Rate */}
            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{budgetStatus.daysRemainingInMonth} calendar days left</span>
              <span>
                Recommended daily allowance:{' '}
                <strong className="text-white font-mono">
                  {formatMoney(budgetStatus.dailyAllowanceRemaining)}/day
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Category Limits & Utilization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorySpending.map((cat) => {
            const limit = cat.budgetLimit || 300;
            const pct = limit > 0 ? (cat.totalSpent / limit) * 100 : 0;
            const remaining = limit - cat.totalSpent;
            const isExceeded = cat.totalSpent > limit;
            const isWarning = pct >= 80 && !isExceeded;

            return (
              <div
                key={cat.categoryId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon
                        iconName={cat.icon}
                        color={cat.color}
                        size={20}
                        className="w-9 h-9 p-2 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cat.categoryName}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Limit: {formatMoney(limit)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatMoney(cat.totalSpent)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          isExceeded
                            ? 'text-rose-600 dark:text-rose-400'
                            : isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {pct.toFixed(0)}% used
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: isExceeded ? '#EF4444' : isWarning ? '#F59E0B' : cat.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span>
                    {isExceeded ? 'Exceeded by:' : 'Remaining:'}
                  </span>
                  <span
                    className={`font-semibold font-mono ${
                      isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isExceeded ? `+${formatMoney(Math.abs(remaining))}` : formatMoney(remaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Edit Monthly Budgets ({selectedMonth})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudgetConfig} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Total Monthly Budget Cap
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={modalTotalBudget}
                  onChange={(e) => setModalTotalBudget(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category Limits
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                  {expenseCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon
                          iconName={cat.icon}
                          color={cat.color}
                          size={16}
                          className="w-7 h-7 p-1.5 shrink-0"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </div>
                      <div className="w-28 shrink-0">
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={modalCategoryBudgets[cat.id] || ''}
                          onChange={(e) =>
                            setModalCategoryBudgets({
                              ...modalCategoryBudgets,
                              [cat.id]: e.target.value,
                            })
                          }
                          placeholder="Limit"
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                >
                  Save Budget Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
