import React from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { PAYMENT_METHOD_CONFIG } from '../../constants/defaultCategories';
import {
  Calendar,
  CreditCard,
  Edit3,
  FileText,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const TransactionDetailModal: React.FC = () => {
  const {
    selectedDetailTx,
    setSelectedDetailTx,
    categories,
    deleteTransaction,
    setEditingTransaction,
    setIsAddModalOpen,
    formatMoney,
  } = useApp();

  if (!selectedDetailTx) return null;

  const category = categories.find((c) => c.id === selectedDetailTx.categoryId);
  const paymentMethodLabel =
    PAYMENT_METHOD_CONFIG[selectedDetailTx.paymentMethod]?.label || selectedDetailTx.paymentMethod;

  const formattedDate = new Date(selectedDetailTx.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleEdit = () => {
    const tx = selectedDetailTx;
    setSelectedDetailTx(null);
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = () => {
    deleteTransaction(selectedDetailTx.id);
    setSelectedDetailTx(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedDetailTx(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transaction Details
            </span>
            <button
              onClick={() => setSelectedDetailTx(null)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Body */}
          <div className="p-6 flex flex-col items-center text-center">
            <CategoryIcon
              iconName={category?.icon || 'Tag'}
              color={category?.color || '#10B981'}
              size={28}
              className="w-16 h-16 rounded-2xl mb-4 p-3 shadow-inner"
            />

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedDetailTx.title}
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{category?.name || 'General'}</span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>

            {/* Big Amount */}
            <div
              className={`text-3xl sm:text-4xl font-extrabold font-mono mt-4 ${
                selectedDetailTx.type === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {selectedDetailTx.type === 'income' ? '+' : '-'}
              {formatMoney(selectedDetailTx.amount)}
            </div>

            {/* Metadata Ledger */}
            <div className="w-full mt-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Payment Channel</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  {paymentMethodLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedDetailTx.id}
                </span>
              </div>

              {selectedDetailTx.isRecurring && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Recurrence</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Automated Subscription
                  </span>
                </div>
              )}

              {selectedDetailTx.notes && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Notes & Memo
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{selectedDetailTx.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Receipt Attachment preview if available */}
            {selectedDetailTx.receiptUrl && (
              <div className="w-full mt-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left mb-1.5">
                  Attached Receipt
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                  <img
                    src={selectedDetailTx.receiptUrl}
                    alt="Receipt"
                    className="max-h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setSelectedDetailTx(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
