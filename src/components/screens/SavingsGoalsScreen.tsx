import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SavingsGoal } from '../../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  History,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';

export const SavingsGoalsScreen: React.FC = () => {
  const { goals, addGoal, deleteGoal, contributeToGoal, formatMoney } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(false);

  // Add goal form states
  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [initialAmountStr, setInitialAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState('Emergency Fund');
  const [color, setColor] = useState('#10B981');
  const [description, setDescription] = useState('');

  const handleOpenAction = (goal: SavingsGoal, type: 'deposit' | 'withdraw') => {
    setSelectedGoalForAction(goal);
    setActionType(type);
    setAmountStr('');
    setNote('');
    setDeductFromBalance(false);
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForAction) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    contributeToGoal(
      selectedGoalForAction.id,
      amount,
      actionType,
      note.trim() || undefined,
      deductFromBalance
    );

    setSelectedGoalForAction(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmountStr);
    const initial = parseFloat(initialAmountStr) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: initial,
      targetDate,
      category,
      color,
      icon: 'Target',
      description: description.trim() || undefined,
      contributions: initial > 0 ? [
        {
          id: `con-init-${Date.now()}`,
          amount: initial,
          type: 'deposit',
          date: new Date().toISOString(),
          note: 'Initial balance',
          deductFromBalance: false,
        }
      ] : [],
    });

    setIsAddModalOpen(false);
    setName('');
    setTargetAmountStr('');
    setInitialAmountStr('0');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals & Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track capital allocation toward emergency reserves, travel, and major life milestones
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          const daysLeft = Math.ceil(
            (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {goal.name}
                    </h3>
                  </div>
                  {isComplete && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {/* Progress Visualizer */}
                <div className="my-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatMoney(goal.currentAmount)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      of {formatMoney(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                      className="h-full rounded-full transition-all duration-700"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="font-semibold">{pct.toFixed(0)}% reached</span>
                    <span>
                      {isComplete ? (
                        <strong className="text-emerald-600 font-mono">Target Reached!</strong>
                      ) : (
                        `${formatMoney(remaining)} left`
                      )}
                    </span>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                    {goal.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAction(goal, 'withdraw')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => handleOpenAction(goal, 'deposit')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit / Withdraw Action Modal */}
      {selectedGoalForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setSelectedGoalForAction(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {actionType} to {selectedGoalForAction.name}
              </h3>
              <button
                onClick={() => setSelectedGoalForAction(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Memo / Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. October paycheck transfer"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {actionType === 'deposit'
                    ? 'Deduct from available cash balance'
                    : 'Credit back to available cash balance'}
                </span>
                <input
                  type="checkbox"
                  checked={deductFromBalance}
                  onChange={(e) => setDeductFromBalance(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                >
                  Confirm {actionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Create New Savings Goal
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Electric Vehicle, House Downpayment"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Initial Deposit
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={initialAmountStr}
                    onChange={(e) => setInitialAmountStr(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category Theme
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Emergency Reserve">Emergency Reserve</option>
                    <option value="Travel & Vacation">Travel & Vacation</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Tech & Hardware">Tech & Hardware</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description / Milestone Purpose
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Notes on timeline and purpose..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
