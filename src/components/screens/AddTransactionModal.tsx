import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, PaymentMethod, Transaction, TransactionType } from '../../types';
import { PAYMENT_METHOD_CONFIG } from '../../constants/defaultCategories';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Camera,
  Check,
  CreditCard,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editingTx?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  editingTx = null,
}) => {
  const {
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settings,
    formatMoney,
  } = useApp();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or load initial values when opened
  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setTitle(editingTx.title);
      setAmountStr(editingTx.amount.toString());
      setCategoryId(editingTx.categoryId);
      setDateStr(editingTx.date.split('T')[0]);
      setPaymentMethod(editingTx.paymentMethod);
      setNotes(editingTx.notes || '');
      setReceiptUrl(editingTx.receiptUrl);
      setIsRecurring(!!editingTx.isRecurring);
    } else {
      setType(defaultType);
      setTitle('');
      setAmountStr('');
      // Default to first category matching type
      const firstCat = categories.find((c) => c.type === defaultType);
      setCategoryId(firstCat ? firstCat.id : '');
      setDateStr(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
      setReceiptUrl(undefined);
      setIsRecurring(false);
    }
    setErrors({});
  }, [editingTx, defaultType, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  // If type changes and current category doesn't match, select first available
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCat = categories.find((c) => c.type === newType);
    if (validCat) setCategoryId(validCat.id);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = (current + addValue).toFixed(2);
    setAmountStr(next);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Title / Payee name is required';
    }
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!categoryId) {
      errs.category = 'Please choose a category';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amount = parseFloat(amountStr);

    if (editingTx) {
      updateTransaction({
        ...editingTx,
        type,
        title: title.trim(),
        amount,
        categoryId,
        date: new Date(dateStr).toISOString(),
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptUrl,
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        title: title.trim(),
        amount,
        categoryId,
        date: new Date(dateStr).toISOString(),
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptUrl,
        isRecurring,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingTx) {
      deleteTransaction(editingTx.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {editingTx ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Segmented Type Picker */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Income</span>
              </button>
            </div>

            {/* Big Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Amount ({settings.currency.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 font-mono">
                  {settings.currency.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus={!editingTx}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.amount}</p>
              )}

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] font-semibold text-slate-400">Quick +:</span>
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Payee */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {type === 'expense' ? 'Expense Title / Merchant' : 'Income Title / Source'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'expense' ? 'e.g. Al-Fatah Rashan, LESCO Bill, PSO Petrol' : 'e.g. Monthly Salary, Upwork Client'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.title}</p>
              )}
            </div>

            {/* Category Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CategoryIcon
                        iconName={cat.icon}
                        color={cat.color}
                        size={18}
                        className="p-1.5 shrink-0"
                      />
                      <span className="text-xs truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.category}</p>
              )}
            </div>

            {/* Date and Payment Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  {(Object.keys(PAYMENT_METHOD_CONFIG) as PaymentMethod[]).map((method) => (
                    <option key={method} value={method}>
                      {PAYMENT_METHOD_CONFIG[method].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add any specific details, project tags, or tax memo..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            {/* Receipt Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Receipt Attachment
              </label>
              {receiptUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 w-full max-h-40 bg-slate-950 flex items-center justify-center group">
                  <img src={receiptUrl} alt="Receipt preview" className="object-contain max-h-40 w-full" />
                  <button
                    type="button"
                    onClick={() => setReceiptUrl(undefined)}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Upload receipt photo or invoice
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Recurring Transaction
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Schedule as a repeat subscription or monthly bill
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 focus:ring-2 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {editingTx ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTx ? 'Save Changes' : 'Record Transaction'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
