import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, TransactionType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Edit2,
  Lock,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

const ICON_OPTIONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Zap',
  'HeartPulse',
  'GraduationCap',
  'Film',
  'Home',
  'Plane',
  'Sparkles',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'Coins',
  'Gift',
  'ShieldCheck',
  'Coffee',
  'Book',
  'Music',
  'Smartphone',
  'Dumbbell',
  'Wrench',
];

const COLOR_OPTIONS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

export const CategoriesScreen: React.FC = () => {
  const {
    categories,
    categorySpending,
    addCategory,
    updateCategory,
    deleteCategory,
    formatMoney,
  } = useApp();

  const [filterType, setFilterType] = useState<TransactionType>('expense');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10B981');
  const [budgetLimitStr, setBudgetLimitStr] = useState('200');

  const filtered = categories.filter((c) => c.type === filterType);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(filterType);
    setIcon('Tag');
    setColor('#10B981');
    setBudgetLimitStr('200');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudgetLimitStr(cat.budgetLimit?.toString() || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const budgetLimit = parseFloat(budgetLimitStr) || undefined;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        type,
        icon,
        color,
        budgetLimit,
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
        icon,
        color,
        isDefault: false,
        budgetLimit,
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
            Category Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize transactions into custom labels with distinct icons, themes, and limits
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setFilterType('expense')}
          className={`px-4 py-1.5 rounded-lg transition-colors ${
            filterType === 'expense'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Expense Categories ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-4 py-1.5 rounded-lg transition-colors ${
            filterType === 'income'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Income Categories ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const spendingInfo = categorySpending.find((s) => s.categoryId === cat.id);
          const spent = spendingInfo ? spendingInfo.totalSpent : 0;
          const percentage = spendingInfo ? spendingInfo.percentage : 0;

          return (
            <div
              key={cat.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon
                      iconName={cat.icon}
                      color={cat.color}
                      size={20}
                      className="w-10 h-10 p-2.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {cat.isDefault ? (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Lock className="w-3 h-3" /> System Default
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Custom User Category
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {cat.type === 'expense' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Month Spending</span>
                    <div className="font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatMoney(spent)}
                      </span>
                      {percentage > 0 && (
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pet Care, Subscriptions, Side Business"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-lg transition-colors ${
                      type === 'expense'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-lg transition-colors ${
                      type === 'income'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Color Accent
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {ICON_OPTIONS.map((iconOpt) => (
                    <button
                      key={iconOpt}
                      type="button"
                      onClick={() => setIcon(iconOpt)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                        icon === iconOpt
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CategoryIcon iconName={iconOpt} size={18} />
                    </button>
                  ))}
                </div>
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
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
