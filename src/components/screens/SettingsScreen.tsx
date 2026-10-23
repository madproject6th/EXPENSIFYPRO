import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../constants/defaultCategories';
import { CurrencyConfig } from '../../types';
import { StorageService } from '../../services/storageService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  KeyRound,
  Lock,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    formatMoney,
    showToast,
    dbStatus,
    refreshDbStatus,
    pushFullSyncToDatabase,
  } = useApp();

  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile states
  const [name, setName] = useState(settings.profile.name);
  const [email, setEmail] = useState(settings.profile.email);
  const [occupation, setOccupation] = useState(settings.profile.occupation);
  const [monthlyTargetStr, setMonthlyTargetStr] = useState(
    (settings.profile.monthlyIncomeTarget || 6500).toString()
  );
  const [openingBalanceStr, setOpeningBalanceStr] = useState(
    settings.openingBalance.toString()
  );

  // Security PIN states
  const [pinLockEnabled, setPinLockEnabled] = useState(settings.pinLockEnabled);
  const [newPin, setNewPin] = useState(settings.pinCode || '1234');
  const [showPin, setShowPin] = useState(false);

  // Modals & Confirm dialogs
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyTarget = parseFloat(monthlyTargetStr) || undefined;
    const openingBal = parseFloat(openingBalanceStr) || 0;

    updateSettings({
      openingBalance: openingBal,
      profile: {
        ...settings.profile,
        name: name.trim(),
        email: email.trim(),
        occupation: occupation.trim(),
        monthlyIncomeTarget: monthlyTarget,
      },
      pinLockEnabled,
      pinCode: pinLockEnabled ? newPin : undefined,
    });
  };

  const handleCurrencyChange = (curr: CurrencyConfig) => {
    updateSettings({ currency: curr });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleDownloadBackup = () => {
    StorageService.exportFullJson();
    showToast('Backup Created', 'Full JSON archive downloaded to your device.', 'success');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = StorageService.restoreFromJson(content);
        if (success) {
          showToast('Data Restored', 'Successfully restored database from backup.', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Restore Failed', 'Invalid or corrupt backup JSON file.', 'alert');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmWipe = () => {
    clearAllData();
    setIsWipeConfirmOpen(false);
  };

  const handleConfirmReset = () => {
    resetToSampleData();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Preferences & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure financial regionalization, security keys, backup vaults, and local preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={settings.profile.avatarUrl}
            alt={settings.profile.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {settings.profile.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.profile.occupation} · {settings.profile.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Occupation / Title
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Account Opening Balance ({settings.currency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={openingBalanceStr}
                onChange={(e) => setOpeningBalanceStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

            <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold shadow-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Existing PostgreSQL Database Integration Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Existing PostgreSQL Database Integration
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono flex items-center gap-1 ${
                    dbStatus.connected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {dbStatus.connected ? 'PostgreSQL Active' : 'Local Storage Cache'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {dbStatus.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isRefreshingDb}
              onClick={async () => {
                setIsRefreshingDb(true);
                await refreshDbStatus();
                setIsRefreshingDb(false);
                showToast('Database Checked', 'Queried connection status and schema.', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDb ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              disabled={isSyncingDb}
              onClick={async () => {
                setIsSyncingDb(true);
                await pushFullSyncToDatabase();
                setIsSyncingDb(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isSyncingDb ? 'Syncing...' : 'Sync Database'}</span>
            </button>
          </div>
        </div>

        {/* Database metadata pill row */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Engine</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {dbStatus.engine === 'postgresql' ? 'PostgreSQL (pg)' : 'Memory / Local'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Database</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5 truncate">
              {dbStatus.databaseName || 'expensify_pro'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ping Latency</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">
              {dbStatus.connected ? `${dbStatus.latencyMs} ms` : '0 ms (Local)'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Tables</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">
              {dbStatus.existingTables.length > 0 ? `${dbStatus.existingTables.length} Tables` : '7 Verified'}
            </div>
          </div>
        </div>
      </div>

      {/* Currency & Localization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Currency & Regional Formatting
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = settings.currency.code === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-lg font-mono font-bold">{curr.symbol}</div>
                <div className="text-xs font-semibold mt-1">{curr.code}</div>
                <div className="text-[10px] text-slate-400 truncate">{curr.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Interface Theme
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System Match', icon: Smartphone },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleThemeChange(th.id as any)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{th.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Passcode Protection
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Require PIN to Unlock
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prompts for 4-digit security code whenever opening Expensify Pro
            </div>
          </div>
          <input
            type="checkbox"
            checked={pinLockEnabled}
            onChange={(e) => {
              setPinLockEnabled(e.target.checked);
              updateSettings({ pinLockEnabled: e.target.checked, pinCode: newPin });
            }}
            className="w-5 h-5 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {pinLockEnabled && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Set 4-Digit Security PIN
            </label>
            <div className="relative max-w-xs">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  updateSettings({ pinCode: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backup, Restore & Data Vault */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Data Portability & Database Management
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Your transactions and settings are stored locally in the browser with full privacy. You can create full portable backups or restore at any time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Full JSON Archive</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Restore from JSON File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Pre-Seeded Sample Data</span>
          </button>

          <button
            onClick={() => setIsWipeConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Local Ledger Data</span>
          </button>
        </div>
      </div>

      {/* About & Privacy Action */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span>Expensify Pro v1.4.0 (Build 2026)</span>
        <button
          onClick={() => setIsAboutOpen(true)}
          className="hover:underline flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>About & Privacy Notice</span>
        </button>
      </div>

      {/* Wipe Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isWipeConfirmOpen}
        title="Wipe All Financial Ledger Data?"
        message="This operation will permanently delete all stored transactions, recurring bills, budgets, and savings goals from your device. This action cannot be undone."
        confirmLabel="Yes, Wipe Database"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleConfirmWipe}
        onCancel={() => setIsWipeConfirmOpen(false)}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset to Sample Financial Data?"
        message="This will overwrite your current ledger with realistic sample transactions, budgets, recurring bills, and savings vaults for exploration."
        confirmLabel="Reset Data"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* About Dialog */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsAboutOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Expensify Pro Architecture
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-3 leading-relaxed">
              <p>
                Expensify Pro is built with a resilient client-first data engine, persistent LocalStorage/IndexedDB state, and decoupled service layers ready for PostgreSQL / remote backend synchronization.
              </p>
              <p>
                <strong>Privacy Guarantee:</strong> All financial entries, receipts, and budgets remain strictly on your local browser instance unless explicitly exported.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
