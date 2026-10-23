import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppNotification,
  BudgetConfig,
  Category,
  NavigationTab,
  RecurringBill,
  SavingsGoal,
  Transaction,
  TransactionType,
  UserSettings,
} from '../types';
import {
  StorageService,
  generateSeedData,
} from '../services/storageService';
import {
  calculateBudgetStatus,
  calculateCategorySpending,
  calculateTotals,
  filterTransactionsByMonth,
  formatCurrency,
  processDueBills,
  roundCurrency,
} from '../services/financialCalculator';
import { ApiService, DatabaseStatusResponse } from '../services/apiService';
import confetti from 'canvas-confetti';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

interface AppContextType {
  // Core state
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetConfig[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  settings: UserSettings;
  notifications: AppNotification[];
  
  // Database status & sync
  dbStatus: DatabaseStatusResponse;
  refreshDbStatus: () => Promise<void>;
  pushFullSyncToDatabase: () => Promise<void>;
  
  // Navigation & UI state
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  
  // Modal states
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  modalDefaultType: TransactionType;
  setModalDefaultType: (type: TransactionType) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  selectedDetailTx: Transaction | null;
  setSelectedDetailTx: (tx: Transaction | null) => void;
  
  // Security
  isLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  
  // Toasts
  toasts: ToastItem[];
  showToast: (title: string, message: string, type?: 'info' | 'warning' | 'success' | 'alert') => void;
  removeToast: (id: string) => void;
  
  // Calculated metrics for selected month
  currentMonthTransactions: Transaction[];
  totals: ReturnType<typeof calculateTotals>;
  categorySpending: ReturnType<typeof calculateCategorySpending>;
  budgetStatus: ReturnType<typeof calculateBudgetStatus>;
  
  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  
  saveBudget: (month: string, total: number, categoryBudgets: Record<string, number>) => void;
  
  addBill: (data: Omit<RecurringBill, 'id'>) => void;
  updateBill: (bill: RecurringBill) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (billId: string) => void;
  
  addGoal: (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    note?: string,
    deductFromBalance?: boolean
  ) => void;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Reset & restore
  resetToSampleData: () => void;
  clearAllData: () => void;
  formatMoney: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage once
  useState(() => {
    StorageService.initStorage();
    return true;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.loadCategories());
  const [budgets, setBudgets] = useState<BudgetConfig[]>(() => StorageService.loadBudgets());
  const [bills, setBills] = useState<RecurringBill[]>(() => StorageService.loadBills());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => StorageService.loadGoals());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.loadSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.loadNotifications());

  const [dbStatus, setDbStatus] = useState<DatabaseStatusResponse>({
    connected: false,
    engine: 'memory_fallback',
    existingTables: [],
    latencyMs: 0,
    message: 'Checking database connectivity...',
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDetailTx, setSelectedDetailTx] = useState<Transaction | null>(null);

  const [isLocked, setIsLocked] = useState(() => !!settings.pinLockEnabled);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Function to refresh live DB status
  const refreshDbStatus = async () => {
    const status = await ApiService.getDatabaseStatus();
    setDbStatus(status);
  };

  // Push local ledger to backend database
  const pushFullSyncToDatabase = async () => {
    const res = await ApiService.pushSync({
      transactions,
      categories,
      budgets,
      bills,
      goals,
      settings,
    });
    if (res?.success) {
      showToast('Database Synchronized', `Synchronized ${res.count} ledger items with backend database.`, 'success');
      await refreshDbStatus();
    } else {
      showToast('Sync Notice', 'Backend sync complete with local cache.', 'info');
    }
  };

  // On initial mount: sync with backend database
  useEffect(() => {
    let isMounted = true;

    async function initialBackendSync() {
      try {
        const status = await ApiService.getDatabaseStatus();
        if (isMounted) setDbStatus(status);

        const serverData = await ApiService.pullSync();
        if (serverData && isMounted) {
          if (serverData.dbStatus) setDbStatus(serverData.dbStatus);

          // If backend returned existing records from PostgreSQL, merge them
          if (serverData.transactions && serverData.transactions.length > 0) {
            setTransactions(serverData.transactions);
            StorageService.saveTransactions(serverData.transactions);
          } else {
            // Push our initial seeded data to the database
            ApiService.pushSync({
              transactions: StorageService.loadTransactions(),
              categories: StorageService.loadCategories(),
              budgets: StorageService.loadBudgets(),
              bills: StorageService.loadBills(),
              goals: StorageService.loadGoals(),
              settings: StorageService.loadSettings(),
            });
          }

          if (serverData.categories && serverData.categories.length > 0) {
            setCategories(serverData.categories);
            StorageService.saveCategories(serverData.categories);
          }
          if (serverData.budgets && serverData.budgets.length > 0) {
            setBudgets(serverData.budgets);
            StorageService.saveBudgets(serverData.budgets);
          }
          if (serverData.bills && serverData.bills.length > 0) {
            setBills(serverData.bills);
            StorageService.saveBills(serverData.bills);
          }
          if (serverData.goals && serverData.goals.length > 0) {
            setGoals(serverData.goals);
            StorageService.saveGoals(serverData.goals);
          }
          if (serverData.settings) {
            setSettings(serverData.settings);
            StorageService.saveSettings(serverData.settings);
          }
        }
      } catch (e) {
        console.warn('Initial sync error:', e);
      }
    }

    initialBackendSync();
    return () => {
      isMounted = false;
    };
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Check recurring bills on start
  useEffect(() => {
    if (bills.length > 0) {
      const { newTransactions, updatedBills } = processDueBills(bills);
      if (newTransactions.length > 0) {
        const nextTxs = [...newTransactions, ...transactions];
        setTransactions(nextTxs);
        setBills(updatedBills);
        StorageService.saveTransactions(nextTxs);
        StorageService.saveBills(updatedBills);

        for (const tx of newTransactions) {
          ApiService.saveTransaction(tx);
        }

        showToast(
          'Recurring Bills Processed',
          `${newTransactions.length} scheduled bill(s) processed automatically.`,
          'info'
        );
      }
    }
  }, []);

  const showToast = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'alert' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unlockWithPin = (pin: string): boolean => {
    if (!settings.pinLockEnabled || !settings.pinCode || settings.pinCode === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const formatMoney = (amount: number): string => {
    return formatCurrency(amount, settings.currency);
  };

  // Filtered transactions for selected month
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Overall calculations for selected month
  const totals = useMemo(() => {
    return calculateTotals(currentMonthTransactions, settings.openingBalance);
  }, [currentMonthTransactions, settings.openingBalance]);

  // Category spending breakdown for selected month
  const currentBudget = useMemo(() => {
    return (
      budgets.find((b) => b.month === selectedMonth) || {
        month: selectedMonth,
        totalBudget: 175000,
        categoryBudgets: {},
        alertThreshold: 0.8,
      }
    );
  }, [budgets, selectedMonth]);

  const categorySpending = useMemo(() => {
    return calculateCategorySpending(
      currentMonthTransactions,
      categories,
      currentBudget.categoryBudgets
    );
  }, [currentMonthTransactions, categories, currentBudget]);

  const budgetStatus = useMemo(() => {
    return calculateBudgetStatus(currentMonthTransactions, currentBudget);
  }, [currentMonthTransactions, currentBudget]);

  // CRUD Transaction Actions
  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...data,
      amount: roundCurrency(Number(data.amount)),
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);

    try {
      const savedRow = await ApiService.saveTransaction(newTx);
      showToast(
        data.type === 'expense' ? 'Expense Saved to PostgreSQL' : 'Income Saved to PostgreSQL',
        `${savedRow.title} (${formatMoney(savedRow.amount)}) verified in database.`,
        'success'
      );
      await refreshDbStatus();
    } catch (err: any) {
      showToast('Saved Locally', `${data.title} saved in local buffer (${err.message}).`, 'info');
    }
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    const safeTx = {
      ...updatedTx,
      amount: roundCurrency(Number(updatedTx.amount)),
      updatedAt: new Date().toISOString(),
    };
    const nextList = transactions.map((t) => (t.id === safeTx.id ? safeTx : t));
    setTransactions(nextList);
    StorageService.saveTransactions(nextList);

    try {
      await ApiService.updateTransaction(safeTx);
      showToast('Updated in PostgreSQL', `${safeTx.title} updated in database.`, 'info');
      await refreshDbStatus();
    } catch (err: any) {
      showToast('Updated Locally', `${safeTx.title} updated in local cache.`, 'info');
    }
  };

  const deleteTransaction = async (id: string) => {
    const nextList = transactions.filter((t) => t.id !== id);
    setTransactions(nextList);
    StorageService.saveTransactions(nextList);

    try {
      await ApiService.deleteTransaction(id);
      showToast('Removed from PostgreSQL', 'The transaction was deleted from database table.', 'alert');
      await refreshDbStatus();
    } catch (err: any) {
      showToast('Deleted Locally', 'Transaction deleted from local view.', 'alert');
    }
  };

  // Category Actions
  const addCategory = (data: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...data,
      id: `cat-custom-${Date.now()}`,
    };
    const nextList = [...categories, newCat];
    setCategories(nextList);
    StorageService.saveCategories(nextList);
    ApiService.saveCategory(newCat);

    showToast('Category Created', `${newCat.name} is now available.`, 'success');
  };

  const updateCategory = (cat: Category) => {
    const nextList = categories.map((c) => (c.id === cat.id ? cat : c));
    setCategories(nextList);
    StorageService.saveCategories(nextList);
    ApiService.saveCategory(cat);

    showToast('Category Updated', `${cat.name} updated.`, 'info');
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat?.isDefault) {
      showToast('Action Blocked', 'Default system categories cannot be deleted.', 'alert');
      return;
    }
    const nextList = categories.filter((c) => c.id !== id);
    setCategories(nextList);
    StorageService.saveCategories(nextList);
    ApiService.deleteCategory(id);

    showToast('Category Deleted', `${cat?.name || 'Category'} removed.`, 'info');
  };

  // Budget Actions
  const saveBudget = (month: string, total: number, categoryBudgets: Record<string, number>) => {
    const existingIndex = budgets.findIndex((b) => b.month === month);
    let targetBudget: BudgetConfig;
    let nextBudgets: BudgetConfig[];

    if (existingIndex >= 0) {
      targetBudget = {
        ...budgets[existingIndex],
        totalBudget: roundCurrency(total),
        categoryBudgets,
      };
      nextBudgets = [...budgets];
      nextBudgets[existingIndex] = targetBudget;
    } else {
      targetBudget = {
        month,
        totalBudget: roundCurrency(total),
        categoryBudgets,
        alertThreshold: 0.8,
      };
      nextBudgets = [...budgets, targetBudget];
    }

    setBudgets(nextBudgets);
    StorageService.saveBudgets(nextBudgets);
    ApiService.saveBudget(targetBudget);

    showToast('Budget Saved', `Monthly budget updated for ${month}.`, 'success');
  };

  // Bill Actions
  const addBill = (data: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...data,
      amount: roundCurrency(Number(data.amount)),
      id: `bill-${Date.now()}`,
    };
    const nextList = [...bills, newBill];
    setBills(nextList);
    StorageService.saveBills(nextList);
    ApiService.saveBill(newBill);

    showToast('Recurring Bill Added', `${newBill.title} scheduled.`, 'success');
  };

  const updateBill = (bill: RecurringBill) => {
    const nextList = bills.map((b) => (b.id === bill.id ? bill : b));
    setBills(nextList);
    StorageService.saveBills(nextList);
    ApiService.saveBill(bill);

    showToast('Bill Updated', `${bill.title} updated.`, 'info');
  };

  const deleteBill = (id: string) => {
    const nextList = bills.filter((b) => b.id !== id);
    setBills(nextList);
    StorageService.saveBills(nextList);
    ApiService.deleteBill(id);

    showToast('Bill Removed', 'Recurring bill schedule removed.', 'alert');
  };

  const markBillAsPaid = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    // Record expense
    addTransaction({
      type: 'expense',
      title: `${bill.title} (Bill Payment)`,
      amount: bill.amount,
      categoryId: bill.categoryId,
      date: new Date().toISOString(),
      paymentMethod: bill.paymentMethod,
      notes: `Manual settlement of scheduled ${bill.frequency} bill`,
      isRecurring: true,
      recurringBillId: bill.id,
    });

    // Advance next due date
    const nextDue = computeNextDueDate(new Date(bill.nextDueDate), bill.frequency);
    const updatedBill: RecurringBill = {
      ...bill,
      nextDueDate: nextDue.toISOString().split('T')[0],
      lastProcessedDate: new Date().toISOString().split('T')[0],
    };

    updateBill(updatedBill);
    showToast('Bill Paid', `${bill.title} marked as paid. Next due date updated.`, 'success');
  };

  // Savings Goal Actions
  const addGoal = (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      currentAmount: roundCurrency(data.currentAmount || 0),
      targetAmount: roundCurrency(data.targetAmount),
      contributions: [],
      createdAt: new Date().toISOString(),
    };
    const nextList = [newGoal, ...goals];
    setGoals(nextList);
    StorageService.saveGoals(nextList);
    ApiService.saveGoal(newGoal);

    showToast('Savings Goal Set', `${newGoal.name} created.`, 'success');
  };

  const updateGoal = (goal: SavingsGoal) => {
    const isNowCompleted = goal.currentAmount >= goal.targetAmount;
    const updated = { ...goal, isCompleted: isNowCompleted };
    const nextList = goals.map((g) => (g.id === goal.id ? updated : g));
    setGoals(nextList);
    StorageService.saveGoals(nextList);
    ApiService.saveGoal(updated);

    showToast('Goal Updated', `${goal.name} updated.`, 'info');
  };

  const deleteGoal = (id: string) => {
    const nextList = goals.filter((g) => g.id !== id);
    setGoals(nextList);
    StorageService.saveGoals(nextList);
    ApiService.deleteGoal(id);

    showToast('Goal Deleted', 'Savings goal removed.', 'info');
  };

  const contributeToGoal = (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    note?: string,
    deductFromBalance: boolean = false
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const delta = type === 'deposit' ? amount : -amount;
    const newCurrent = roundCurrency(Math.max(0, goal.currentAmount + delta));
    const isNowCompleted = newCurrent >= goal.targetAmount;

    const contribution = {
      id: `con-${Date.now()}`,
      amount,
      type,
      date: new Date().toISOString(),
      note,
      deductFromBalance,
    };

    const updatedGoal: SavingsGoal = {
      ...goal,
      currentAmount: newCurrent,
      isCompleted: isNowCompleted,
      contributions: [contribution, ...goal.contributions],
    };

    updateGoal(updatedGoal);
    ApiService.addGoalContribution(goalId, contribution);

    // If requested to deduct or add to main transactions balance
    if (deductFromBalance) {
      if (type === 'deposit') {
        addTransaction({
          type: 'expense',
          title: `Savings: ${goal.name}`,
          amount,
          categoryId: 'cat-investments',
          date: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          notes: note || `Contribution to savings goal: ${goal.name}`,
        });
      } else {
        addTransaction({
          type: 'income',
          title: `Goal Withdrawal: ${goal.name}`,
          amount,
          categoryId: 'cat-investments',
          date: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          notes: note || `Withdrawal from savings goal: ${goal.name}`,
        });
      }
    }

    if (isNowCompleted && !goal.isCompleted) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('Goal Achieved!', `Congratulations on reaching your goal: ${goal.name}!`, 'success');
    } else {
      showToast(
        type === 'deposit' ? 'Deposit Recorded' : 'Withdrawal Recorded',
        `${formatMoney(amount)} ${type === 'deposit' ? 'added to' : 'withdrawn from'} ${goal.name}`,
        'success'
      );
    }
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    StorageService.saveSettings(next);
    ApiService.saveSettings(next);
    showToast('Preferences Saved', 'Your application settings were updated.', 'info');
  };

  const markNotificationRead = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(next);
    StorageService.saveNotifications(next);
  };

  const clearNotifications = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
  };

  const resetToSampleData = () => {
    const seed = generateSeedData();
    setTransactions(seed.transactions);
    setCategories(seed.categories);
    setBudgets(seed.budgets);
    setBills(seed.bills);
    setGoals(seed.goals);
    setSettings(seed.settings);
    setNotifications(seed.notifications);

    StorageService.saveTransactions(seed.transactions);
    StorageService.saveCategories(seed.categories);
    StorageService.saveBudgets(seed.budgets);
    StorageService.saveBills(seed.bills);
    StorageService.saveGoals(seed.goals);
    StorageService.saveSettings(seed.settings);
    StorageService.saveNotifications(seed.notifications);

    ApiService.pushSync({
      transactions: seed.transactions,
      categories: seed.categories,
      budgets: seed.budgets,
      bills: seed.bills,
      goals: seed.goals,
      settings: seed.settings,
    });

    showToast('Data Restored', 'Sample financial records populated and synced.', 'success');
  };

  const clearAllData = () => {
    StorageService.clearAllData();
    setTransactions([]);
    setCategories(StorageService.loadCategories());
    setBudgets([]);
    setBills([]);
    setGoals([]);
    setNotifications([]);
    showToast('Data Cleared', 'All financial transactions and custom data wiped.', 'alert');
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        bills,
        goals,
        settings,
        notifications,
        dbStatus,
        refreshDbStatus,
        pushFullSyncToDatabase,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        isAddModalOpen,
        setIsAddModalOpen,
        modalDefaultType,
        setModalDefaultType,
        editingTransaction,
        setEditingTransaction,
        selectedDetailTx,
        setSelectedDetailTx,
        isLocked,
        unlockWithPin,
        toasts,
        showToast,
        removeToast,
        currentMonthTransactions,
        totals,
        categorySpending,
        budgetStatus,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        saveBudget,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        updateSettings,
        markNotificationRead,
        clearNotifications,
        resetToSampleData,
        clearAllData,
        formatMoney,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function computeNextDueDate(fromDate: Date, frequency: RecurringBill['frequency']): Date {
  const next = new Date(fromDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}
