import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  ShieldCheck,
  Tag,
  Target,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'bills', label: 'Recurring Bills', icon: CalendarClock },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* User Mini Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
        <img
          src={settings.profile.avatarUrl}
          alt={settings.profile.name}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {settings.profile.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {settings.profile.occupation}
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Financial Health Summary Pill */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 ring-1 ring-emerald-500/30">
            <img src="/assets/aistudio/images_29a856f5.jfif" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span>Pakistan (PKT · PKR)</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 pl-7">
          PostgreSQL Database Sync
        </div>
      </div>
    </aside>
  );
};
