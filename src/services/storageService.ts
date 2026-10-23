import { ALL_DEFAULT_CATEGORIES, DEFAULT_USER_SETTINGS } from '../constants/defaultCategories';
import {
  AdminAuditLog,
  AdminPlatformStats,
  AdminUserRecord,
  AppNotification,
  BudgetConfig,
  Category,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expensify_pro_transactions_v2_pkr',
  CATEGORIES: 'expensify_pro_categories_v2_pkr',
  BUDGETS: 'expensify_pro_budgets_v2_pkr',
  BILLS: 'expensify_pro_bills_v2_pkr',
  GOALS: 'expensify_pro_goals_v2_pkr',
  SETTINGS: 'expensify_pro_settings_v2_pkr',
  NOTIFICATIONS: 'expensify_pro_notifications_v2_pkr',
  ADMIN_USERS: 'expensify_admin_users_v1',
  ADMIN_LOGS: 'expensify_admin_logs_v1',
  CURRENT_ADMIN_SESSION: 'expensify_admin_session_v1',
};

/**
 * Generate rich, realistic seed data for October 2026 configured for Pakistan (PKR)
 */
export function generateSeedData(): {
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetConfig[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  settings: UserSettings;
  notifications: AppNotification[];
  adminUsers: AdminUserRecord[];
  adminLogs: AdminAuditLog[];
} {
  const categories = [...ALL_DEFAULT_CATEGORIES];

  const transactions: Transaction[] = [
    // Income
    {
      id: 'tx-pak-1',
      type: 'income',
      title: 'Monthly Tech Salary (Systems Lead)',
      amount: 225000.0,
      categoryId: 'cat-salary',
      date: '2026-10-01T10:00:00',
      paymentMethod: 'bank_transfer',
      notes: 'Direct 1Link IBFT into HBL Account from Tech Horizon Labs',
      createdAt: '2026-10-01T10:00:00',
      updatedAt: '2026-10-01T10:00:00',
    },
    {
      id: 'tx-pak-2',
      type: 'income',
      title: 'US Client UI Design Project (Upwork)',
      amount: 85000.0,
      categoryId: 'cat-freelance',
      date: '2026-10-08T16:30:00',
      paymentMethod: 'nayapay_sadapay',
      notes: 'Remittance converted into SadaPay PKR account',
      createdAt: '2026-10-08T16:30:00',
      updatedAt: '2026-10-08T16:30:00',
    },
    {
      id: 'tx-pak-3',
      type: 'income',
      title: 'Gulberg Commercial Floor Rental',
      amount: 40000.0,
      categoryId: 'cat-rent-income',
      date: '2026-10-15T11:00:00',
      paymentMethod: 'raast',
      notes: 'Tenant transferred rent via Raast ID',
      createdAt: '2026-10-15T11:00:00',
      updatedAt: '2026-10-15T11:00:00',
    },

    // Expenses
    {
      id: 'tx-pak-4',
      type: 'expense',
      title: 'House Rent (DHA Phase 5, Lahore)',
      amount: 45000.0,
      categoryId: 'cat-rent',
      date: '2026-10-01T12:00:00',
      paymentMethod: 'bank_transfer',
      notes: 'October residential rent transfer to landlord',
      isRecurring: true,
      recurringBillId: 'bill-rent',
      createdAt: '2026-10-01T12:00:00',
      updatedAt: '2026-10-01T12:00:00',
    },
    {
      id: 'tx-pak-5',
      type: 'expense',
      title: 'Monthly Rashan & Meat (Al-Fatah / Metro)',
      amount: 18450.0,
      categoryId: 'cat-groceries',
      date: '2026-10-03T18:20:00',
      paymentMethod: 'raast',
      notes: 'Atta 20kg, Daal, Cooking Oil, Basmati Rice, and chicken',
      createdAt: '2026-10-03T18:20:00',
      updatedAt: '2026-10-03T18:20:00',
    },
    {
      id: 'tx-pak-6',
      type: 'expense',
      title: 'LESCO Electricity Bill',
      amount: 22800.0,
      categoryId: 'cat-electricity',
      date: '2026-10-05T14:10:00',
      paymentMethod: 'easypaisa',
      notes: 'Paid online via Easypaisa Bill Payment without surcharge',
      isRecurring: true,
      recurringBillId: 'bill-electricity',
      createdAt: '2026-10-05T14:10:00',
      updatedAt: '2026-10-05T14:10:00',
    },
    {
      id: 'tx-pak-7',
      type: 'expense',
      title: 'Nayatel 50Mbps Fiber Internet',
      amount: 4200.0,
      categoryId: 'cat-internet',
      date: '2026-10-07T09:15:00',
      paymentMethod: 'jazzcash',
      notes: 'Monthly unlimited home fiber package',
      isRecurring: true,
      recurringBillId: 'bill-internet',
      createdAt: '2026-10-07T09:15:00',
      updatedAt: '2026-10-07T09:15:00',
    },
    {
      id: 'tx-pak-8',
      type: 'expense',
      title: 'Fuel Top-up at PSO (Hi-Octane)',
      amount: 7500.0,
      categoryId: 'cat-fuel',
      date: '2026-10-09T17:40:00',
      paymentMethod: 'nayapay_sadapay',
      notes: 'Full tank fuel for weekly office commute',
      createdAt: '2026-10-09T17:40:00',
      updatedAt: '2026-10-09T17:40:00',
    },
    {
      id: 'tx-pak-9',
      type: 'expense',
      title: 'Family Dinner at Monal Lahore & Chai',
      amount: 8600.0,
      categoryId: 'cat-dining',
      date: '2026-10-11T21:30:00',
      paymentMethod: 'debit_card',
      notes: 'Weekend mutton karahi and Kashmiri chai with family',
      createdAt: '2026-10-11T21:30:00',
      updatedAt: '2026-10-11T21:30:00',
    },
    {
      id: 'tx-pak-10',
      type: 'expense',
      title: 'School Monthly Fee & Books',
      amount: 15000.0,
      categoryId: 'cat-school',
      date: '2026-10-13T10:00:00',
      paymentMethod: 'bank_transfer',
      notes: 'Beaconhouse school tuition fee voucher',
      createdAt: '2026-10-13T10:00:00',
      updatedAt: '2026-10-13T10:00:00',
    },
    {
      id: 'tx-pak-11',
      type: 'expense',
      title: 'Sui Northern Gas Bill (SNGPL)',
      amount: 2850.0,
      categoryId: 'cat-gas',
      date: '2026-10-16T11:45:00',
      paymentMethod: 'easypaisa',
      notes: 'Kitchen stove and water geyser bill',
      createdAt: '2026-10-16T11:45:00',
      updatedAt: '2026-10-16T11:45:00',
    },
    {
      id: 'tx-pak-12',
      type: 'expense',
      title: 'Jazz Super 4G Monthly Bundles',
      amount: 2400.0,
      categoryId: 'cat-mobile',
      date: '2026-10-18T13:10:00',
      paymentMethod: 'jazzcash',
      notes: 'Monthly Max data bundle for personal and work SIMs',
      createdAt: '2026-10-18T13:10:00',
      updatedAt: '2026-10-18T13:10:00',
    },
    {
      id: 'tx-pak-13',
      type: 'expense',
      title: 'Monthly Sadaqah & Ration Pack Distribution',
      amount: 6000.0,
      categoryId: 'cat-charity',
      date: '2026-10-20T15:00:00',
      paymentMethod: 'cash',
      notes: 'Direct financial assistance to needy families in area',
      createdAt: '2026-10-20T15:00:00',
      updatedAt: '2026-10-20T15:00:00',
    },
  ];

  const budgets: BudgetConfig[] = [
    {
      month: '2026-10',
      totalBudget: 175000.0, // Rs. 175,000 monthly total budget
      categoryBudgets: {
        'cat-rent': 45000,
        'cat-groceries': 35000,
        'cat-electricity': 25000,
        'cat-school': 20000,
        'cat-fuel': 18000,
        'cat-dining': 12000,
        'cat-healthcare': 10000,
        'cat-charity': 8000,
        'cat-internet': 4500,
        'cat-gas': 4000,
        'cat-mobile': 3000,
      },
      alertThreshold: 0.8,
    },
  ];

  const bills: RecurringBill[] = [
    {
      id: 'bill-rent',
      title: 'House Rent (DHA Phase 5)',
      amount: 45000.0,
      categoryId: 'cat-rent',
      frequency: 'monthly',
      nextDueDate: '2026-11-01',
      paymentMethod: 'bank_transfer',
      autoProcess: true,
      lastProcessedDate: '2026-10-01',
      status: 'active',
      notes: 'Transferred on the 1st of every month via HBL IBFT',
    },
    {
      id: 'bill-electricity',
      title: 'LESCO Electricity Bill',
      amount: 22800.0,
      categoryId: 'cat-electricity',
      frequency: 'monthly',
      nextDueDate: '2026-11-05',
      paymentMethod: 'easypaisa',
      autoProcess: true,
      lastProcessedDate: '2026-10-05',
      status: 'active',
    },
    {
      id: 'bill-internet',
      title: 'Nayatel Unlimited Fiber',
      amount: 4200.0,
      categoryId: 'cat-internet',
      frequency: 'monthly',
      nextDueDate: '2026-11-07',
      paymentMethod: 'jazzcash',
      autoProcess: true,
      lastProcessedDate: '2026-10-07',
      status: 'active',
    },
    {
      id: 'bill-gas',
      title: 'Sui Gas Bill (SNGPL)',
      amount: 2850.0,
      categoryId: 'cat-gas',
      frequency: 'monthly',
      nextDueDate: '2026-11-16',
      paymentMethod: 'easypaisa',
      autoProcess: true,
      lastProcessedDate: '2026-10-16',
      status: 'active',
    },
  ];

  const goals: SavingsGoal[] = [
    {
      id: 'goal-emergency',
      name: 'Emergency Fund (6 Months Expenses)',
      targetAmount: 900000.0, // Rs. 9 Lakhs
      currentAmount: 640000.0, // Rs. 6.4 Lakhs
      targetDate: '2027-06-30',
      category: 'Family Security',
      color: '#10B981',
      icon: 'ShieldCheck',
      description: 'Emergency cash reserve in Meezan Bank Islamic saving account.',
      contributions: [
        {
          id: 'con-1',
          amount: 50000,
          type: 'deposit',
          date: '2026-09-01T10:00:00',
          note: 'September monthly savings',
          deductFromBalance: false,
        },
        {
          id: 'con-2',
          amount: 35000,
          type: 'deposit',
          date: '2026-10-02T14:00:00',
          note: 'From freelancing milestone earnings',
          deductFromBalance: false,
        },
      ],
      createdAt: '2026-01-10T08:00:00',
    },
    {
      id: 'goal-hajj',
      name: 'Hajj & Umrah Pilgrimage Fund',
      targetAmount: 1800000.0, // Rs. 18 Lakhs
      currentAmount: 1250000.0, // Rs. 12.5 Lakhs
      targetDate: '2027-04-15',
      category: 'Pilgrimage',
      color: '#059669',
      icon: 'Target',
      description: 'Dedicated fund for parents and self Hajj package.',
      contributions: [
        {
          id: 'con-3',
          amount: 40000,
          type: 'deposit',
          date: '2026-10-09T18:00:00',
          note: 'October regular contribution',
          deductFromBalance: false,
        },
      ],
      createdAt: '2025-06-15T12:00:00',
    },
    {
      id: 'goal-car',
      name: 'Solar Panel System (10kW Hybrid)',
      targetAmount: 1100000.0, // Rs. 11 Lakhs
      currentAmount: 780000.0,
      targetDate: '2026-12-31',
      category: 'Energy Independence',
      color: '#F59E0B',
      icon: 'Zap',
      description: '10kW Tier-1 solar inverter & lithium battery to eliminate electric bills.',
      contributions: [],
      createdAt: '2026-04-20T11:00:00',
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'October Budget on Track',
      message: 'You have consumed 74% of your Rs. 175,000 monthly allowance with 8 days remaining.',
      type: 'info',
      date: '2026-10-23T08:00:00',
      read: false,
      actionScreen: 'budgets',
    },
    {
      id: 'notif-2',
      title: 'Upcoming Bill Due Reminder',
      message: 'LESCO Electricity Bill (Rs. 22,800) is scheduled for automated payment.',
      type: 'warning',
      date: '2026-10-23T06:00:00',
      read: false,
      actionScreen: 'bills',
    },
  ];

  // Admin user directory
  const adminUsers: AdminUserRecord[] = [
    {
      id: 'usr-pak-001',
      name: 'Usman Tariq',
      email: 'usman.tariq@expensify.pk',
      phone: '+92 300 1234567',
      city: 'Lahore',
      role: 'USER',
      status: 'ACTIVE',
      registeredAt: '2026-01-15T09:30:00Z',
      lastLoginAt: '2026-10-23T04:15:00Z',
      totalTransactions: 142,
      totalSpentPkr: 890450,
      totalIncomePkr: 1450000,
    },
    {
      id: 'usr-pak-002',
      name: 'Fatima Zahra',
      email: 'fatima.zahra@khi.pk',
      phone: '+92 321 9876543',
      city: 'Karachi',
      role: 'USER',
      status: 'ACTIVE',
      registeredAt: '2026-02-10T11:20:00Z',
      lastLoginAt: '2026-10-22T19:40:00Z',
      totalTransactions: 98,
      totalSpentPkr: 640100,
      totalIncomePkr: 980000,
    },
    {
      id: 'usr-pak-003',
      name: 'Bilal Ahmad',
      email: 'bilal.ahmad@isb.pk',
      phone: '+92 333 5551212',
      city: 'Islamabad',
      role: 'USER',
      status: 'ACTIVE',
      registeredAt: '2026-03-04T14:10:00Z',
      lastLoginAt: '2026-10-21T08:12:00Z',
      totalTransactions: 76,
      totalSpentPkr: 412000,
      totalIncomePkr: 720000,
    },
    {
      id: 'usr-pak-004',
      name: 'Ayesha Khan',
      email: 'ayesha.khan@psh.pk',
      phone: '+92 345 8889900',
      city: 'Peshawar',
      role: 'USER',
      status: 'SUSPENDED',
      registeredAt: '2026-04-18T10:00:00Z',
      lastLoginAt: '2026-09-12T16:20:00Z',
      totalTransactions: 24,
      totalSpentPkr: 115000,
      totalIncomePkr: 180000,
    },
    {
      id: 'usr-pak-005',
      name: 'Zainab Siddiqui',
      email: 'zainab.siddiqui@rwp.pk',
      phone: '+92 301 4443322',
      city: 'Rawalpindi',
      role: 'USER',
      status: 'ACTIVE',
      registeredAt: '2026-05-22T15:45:00Z',
      lastLoginAt: '2026-10-23T02:00:00Z',
      totalTransactions: 110,
      totalSpentPkr: 745000,
      totalIncomePkr: 1100000,
    },
    {
      id: 'usr-admin-001',
      name: 'System Admin (Pakistan Operations)',
      email: 'admin@expensify.pk',
      phone: '+92 42 111 222 333',
      city: 'Islamabad',
      role: 'ADMIN',
      status: 'ACTIVE',
      registeredAt: '2025-01-01T00:00:00Z',
      lastLoginAt: '2026-10-23T04:20:00Z',
      totalTransactions: 0,
      totalSpentPkr: 0,
      totalIncomePkr: 0,
    },
  ];

  const adminLogs: AdminAuditLog[] = [
    {
      id: 'log-1',
      adminEmail: 'admin@expensify.pk',
      action: 'UPDATE_GLOBAL_CATEGORY',
      target: 'Electricity (LESCO/KE/IESCO)',
      timestamp: '2026-10-22T14:15:00Z',
      details: 'Updated budget threshold guidelines for peak summer tariffs.',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      adminEmail: 'admin@expensify.pk',
      action: 'USER_STATUS_CHANGE',
      target: 'Ayesha Khan (usr-pak-004)',
      timestamp: '2026-10-20T11:00:00Z',
      details: 'Account temporarily suspended pending KYC mobile verification.',
      status: 'WARNING',
    },
    {
      id: 'log-3',
      adminEmail: 'system-automated',
      action: 'RECURRING_BILL_RUN',
      target: 'LESCO / Utility Schedules',
      timestamp: '2026-10-15T00:00:00Z',
      details: 'Processed automated scheduled batch for 8,420 registered Pakistani households.',
      status: 'SUCCESS',
    },
    {
      id: 'log-4',
      adminEmail: 'admin@expensify.pk',
      action: 'BACKUP_SNAPSHOT_TRIGGER',
      target: 'Database Cluster (PostgreSQL)',
      timestamp: '2026-10-10T03:00:00Z',
      details: 'Automated encrypted snapshot verified across Islamabad DC.',
      status: 'SUCCESS',
    },
  ];

  return {
    transactions,
    categories,
    budgets,
    bills,
    goals,
    settings: DEFAULT_USER_SETTINGS,
    notifications,
    adminUsers,
    adminLogs,
  };
}

export class StorageService {
  static loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return ALL_DEFAULT_CATEGORIES;
      return JSON.parse(data);
    } catch {
      return ALL_DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static loadBudgets(): BudgetConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveBudgets(budgets: BudgetConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  static loadBills(): RecurringBill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveBills(bills: RecurringBill[]): void {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }

  static loadGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  static loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_USER_SETTINGS;
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static loadNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveNotifications(notifs: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // Admin users & audit logs
  static loadAdminUsers(): AdminUserRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAdminUsers(users: AdminUserRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
  }

  static loadAdminLogs(): AdminAuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAdminLogs(logs: AdminAuditLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(logs));
  }

  static getAdminSession(): { isAuthenticated: boolean; email: string; role: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static setAdminSession(session: { isAuthenticated: boolean; email: string; role: string } | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
    }
  }

  /**
   * Initializes persistent storage. Seeds rich Pakistan sample data if first run.
   */
  static initStorage(): boolean {
    const hasExistingData = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!hasExistingData) {
      const seed = generateSeedData();
      this.saveTransactions(seed.transactions);
      this.saveCategories(seed.categories);
      this.saveBudgets(seed.budgets);
      this.saveBills(seed.bills);
      this.saveGoals(seed.goals);
      this.saveSettings(seed.settings);
      this.saveNotifications(seed.notifications);
      this.saveAdminUsers(seed.adminUsers);
      this.saveAdminLogs(seed.adminLogs);
      return true;
    }
    return false;
  }

  /**
   * Export complete app data as a JSON file
   */
  static exportFullJson(): void {
    const backup = {
      version: '2.0.0-pkr',
      country: 'PK',
      currency: 'PKR',
      exportedAt: new Date().toISOString(),
      transactions: this.loadTransactions(),
      categories: this.loadCategories(),
      budgets: this.loadBudgets(),
      bills: this.loadBills(),
      goals: this.loadGoals(),
      settings: this.loadSettings(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expensify_pro_pakistan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export transactions as CSV with PKR currency labels
   */
  static exportTransactionsCsv(transactions: Transaction[], categories: Category[]): void {
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const headers = ['Date (PKT)', 'Type', 'Title', 'Category', 'Amount (PKR)', 'Payment Method', 'Notes', 'Is Recurring'];
    
    const rows = transactions.map((t) => [
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${catMap.get(t.categoryId) || 'Other'}"`,
      t.amount.toFixed(2),
      `"${t.paymentMethod}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.isRecurring ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expensify_pro_pakistan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Restore state from JSON
   */
  static restoreFromJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (Array.isArray(data.budgets)) this.saveBudgets(data.budgets);
      if (Array.isArray(data.bills)) this.saveBills(data.bills);
      if (Array.isArray(data.goals)) this.saveGoals(data.goals);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset all data to empty slate
   */
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    const freshSettings = { ...DEFAULT_USER_SETTINGS, onboardingCompleted: true };
    this.saveSettings(freshSettings);
  }
}
