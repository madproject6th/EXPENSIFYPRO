import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethod, RecurringBill, RecurringFrequency } from '../../types';
import { PAYMENT_METHOD_CONFIG } from '../../constants/defaultCategories';
import {
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

export const RecurringBillsScreen: React.FC = () => {
  const {
    bills,
    categories,
    addBill,
    updateBill,
    deleteBill,
    markBillAsPaid,
    formatMoney,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [autoProcess, setAutoProcess] = useState(true);
  const [notes, setNotes] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Total committed monthly recurring amount
  const committedMonthlyTotal = bills
    .filter((b) => b.status === 'active')
    .reduce((sum, b) => {
      let multiplier = 1;
      if (b.frequency === 'yearly') multiplier = 1 / 12;
      else if (b.frequency === 'weekly') multiplier = 4.33;
      else if (b.frequency === 'daily') multiplier = 30;
      return sum + b.amount * multiplier;
    }, 0);

  const handleOpenAdd = () => {
    setEditingBill(null);
    setTitle('');
    setAmountStr('');
    setCategoryId(expenseCategories[0]?.id || '');
    setFrequency('monthly');
    setNextDueDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('credit_card');
    setAutoProcess(true);
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bill: RecurringBill) => {
    setEditingBill(bill);
    setTitle(bill.title);
    setAmountStr(bill.amount.toString());
    setCategoryId(bill.categoryId);
    setFrequency(bill.frequency);
    setNextDueDate(bill.nextDueDate.split('T')[0]);
    setPaymentMethod(bill.paymentMethod);
    setAutoProcess(bill.autoProcess);
    setNotes(bill.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title.trim() || isNaN(amount) || amount <= 0 || !categoryId) return;

    if (editingBill) {
      updateBill({
        ...editingBill,
        title: title.trim(),
        amount,
        categoryId,
        frequency,
        nextDueDate,
        paymentMethod,
        autoProcess,
        notes: notes.trim() || undefined,
      });
    } else {
      addBill({
        title: title.trim(),
        amount,
        categoryId,
        frequency,
        nextDueDate,
        paymentMethod,
        autoProcess,
        lastProcessedDate: null,
        status: 'active',
        notes: notes.trim() || undefined,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recurring Bills & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage scheduled payments, monthly contracts, and automated billing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Committed Monthly Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Committed Monthly Overhead
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">
              {formatMoney(committedMonthlyTotal)}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ month</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          <div>
            <strong className="text-slate-200 font-mono">{bills.length}</strong> active scheduled items
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Auto-checks due dates on launch to prevent duplicate charges
          </div>
        </div>
      </div>

      {/* Bills Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No recurring bills configured
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your rent, utility bills, software subscriptions, or gym memberships to automate tracking.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold"
            >
              Add First Recurring Bill
            </button>
          </div>
        ) : (
          bills.map((bill) => {
            const cat = categories.find((c) => c.id === bill.categoryId);
            const isDueToday =
              bill.nextDueDate.split('T')[0] <= new Date().toISOString().split('T')[0];

            return (
              <div
                key={bill.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon
                        iconName={cat?.icon || 'Calendar'}
                        color={cat?.color || '#3B82F6'}
                        size={20}
                        className="w-10 h-10 p-2.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {bill.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                          <span>{bill.frequency}</span>
                          <span>·</span>
                          <span>{cat?.name || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatMoney(bill.amount)}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        per {bill.frequency.replace('ly', '')}
                      </span>
                    </div>
                  </div>

                  {/* Due Date & Auto-process Status */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">
                        Next Due:{' '}
                        <strong className="text-slate-900 dark:text-white font-mono">
                          {new Date(bill.nextDueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      {bill.autoProcess ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Auto-Log Enabled
                        </span>
                      ) : (
                        <span>Manual Pay</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(bill)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => markBillAsPaid(bill.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Paid</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editingBill ? 'Edit Recurring Bill' : 'New Recurring Bill'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Bill Name / Service
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Netflix, Apartment Lease, Electric Utility"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 truncate"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Auto-process on due date
                </span>
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
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
                  {editingBill ? 'Save Changes' : 'Schedule Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
