import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  PieChart,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen, setModalDefaultType } = useApp();
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const mainTabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleOpenAdd = (type: 'expense' | 'income') => {
    setIsFabMenuOpen(false);
    setModalDefaultType(type);
    setIsAddModalOpen(true);
  };

  return (
    <>
      {/* Floating Action Menu Overlay */}
      <AnimatePresence>
        {isFabMenuOpen && (
          <div className="fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFabMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50">
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                onClick={() => handleOpenAdd('income')}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <span>Add New Income</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                onClick={() => handleOpenAdd('expense')}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <span>Add New Expense</span>
              </motion.button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Container */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg shadow-slate-950/5"
      >
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* First two tabs */}
          {mainTabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] tracking-tight mt-1">{tab.label}</span>
              </button>
            );
          })}

          {/* Center Floating Quick Action Button */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
              className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-90 ${
                isFabMenuOpen
                  ? 'bg-slate-800 rotate-45'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:shadow-emerald-500/25'
              }`}
              aria-label="Add transaction"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Budgets Tab */}
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-colors ${
              activeTab === 'budgets'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className={`w-5 h-5 ${activeTab === 'budgets' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] tracking-tight mt-1">Budgets</span>
          </button>

          {/* Reports or Settings */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-colors ${
              activeTab === 'reports'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px] tracking-tight mt-1">Reports</span>
          </button>
        </div>
      </nav>
    </>
  );
};
