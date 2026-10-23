import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { StorageService } from '../../services/storageService';
import { formatFriendlyDate, groupTransactionsByDate } from '../../services/financialCalculator';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Download,
  Filter,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    categories,
    selectedMonth,
    setSelectedDetailTx,
    setIsAddModalOpen,
    setModalDefaultType,
    formatMoney,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'month' | 'all'>('month');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter
      if (periodFilter === 'month' && !tx.date.startsWith(selectedMonth)) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query);
        const cat = categories.find((c) => c.id === tx.categoryId);
        const matchesCat = cat?.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, selectedMonth, periodFilter, typeFilter, categoryFilter, searchQuery, sortBy, categories]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    StorageService.exportTransactionsCsv(filteredTransactions, categories);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed ledger history with itemized audit records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setModalDefaultType('expense');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by payee, category, notes, or tags..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Segmented Type Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown, Period & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period filter */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as 'month' | 'all')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="month">Current Month</option>
              <option value="all">All Time</option>
            </select>

            {/* Category select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500/50 max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List with Daily Groups */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching transactions found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or switching the time period to see more entries.
          </p>
          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || periodFilter !== 'month') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setPeriodFilter('month');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateKey, dayTxs]) => {
            const dayExpenses = dayTxs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);
            const dayIncome = dayTxs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Daily Group Header */}
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{formatFriendlyDate(dateKey)}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {dayIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatMoney(dayIncome)}
                      </span>
                    )}
                    {dayExpenses > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatMoney(dayExpenses)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Rows Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                  {dayTxs.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedDetailTx(tx)}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CategoryIcon
                            iconName={cat?.icon || 'Tag'}
                            color={cat?.color || '#10B981'}
                            size={18}
                            className="w-10 h-10 p-2.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {tx.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{cat?.name || 'General'}</span>
                              <span>·</span>
                              <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                              {tx.notes && (
                                <>
                                  <span>·</span>
                                  <span className="truncate max-w-[140px] italic">"{tx.notes}"</span>
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
                          {tx.receiptUrl && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Has Receipt
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
