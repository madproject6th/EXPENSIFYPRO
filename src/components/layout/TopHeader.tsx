import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Calendar,
  CheckCheck,
  ChevronDown,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const TopHeader: React.FC = () => {
  const {
    settings,
    updateSettings,
    selectedMonth,
    setSelectedMonth,
    notifications,
    markNotificationRead,
    clearNotifications,
    setIsAddModalOpen,
    setModalDefaultType,
    setActiveTab,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  // Available month choices for quick jumping
  const months = [
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
  ];

  const currentMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark with Custom Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs ring-1 ring-emerald-500/20 shrink-0">
            <img
              src="/assets/aistudio/images_29a856f5.jfif"
              alt="Expensify Pro Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Expensify <span className="text-emerald-600 dark:text-emerald-400">Pro</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links for Desktop & Month Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Active Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">{currentMonthLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isMonthPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMonthPickerOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-40">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Period
                  </div>
                  {months.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setSelectedMonth(m.value);
                        setIsMonthPickerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                        selectedMonth === m.value
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zone 3: Actions (Theme Toggle, Notifications Bell, Primary Quick Action) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Pakistan Currency Marker */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80">
            <span>🇵🇰</span>
            <span>PKR (Rs.)</span>
          </div>

          {/* Admin Console Switcher */}
          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="Open Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell with Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-40">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="py-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionScreen) {
                              setActiveTab(n.actionScreen);
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`py-3 px-2 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                            !n.read ? 'bg-slate-50/70 dark:bg-slate-800/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Primary Add CTA */}
          <button
            onClick={() => {
              setModalDefaultType('expense');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
