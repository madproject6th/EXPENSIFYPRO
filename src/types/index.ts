export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'cash' 
  | 'easypaisa'
  | 'jazzcash'
  | 'raast'
  | 'nayapay_sadapay'
  | 'bank_transfer' 
  | 'debit_card' 
  | 'credit_card' 
  | 'other';

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  title: string;
  amount: number; // in standard currency units (PKR)
  categoryId: string;
  date: string; // ISO string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptUrl?: string; // base64 or URL
  isRecurring?: boolean;
  recurringBillId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu?: string;
  type: TransactionType;
  icon: string; // Lucide icon identifier
  color: string; // Hex color code
  isDefault: boolean;
  budgetLimit?: number; // optional individual monthly budget in PKR
}

export interface BudgetConfig {
  month: string; // format 'YYYY-MM'
  totalBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> budget amount in PKR
  alertThreshold: number; // e.g. 0.8 (80%)
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  frequency: RecurringFrequency;
  nextDueDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  autoProcess: boolean;
  lastProcessedDate: string | null;
  status: 'active' | 'paused';
  notes?: string;
}

export interface GoalContribution {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  date: string;
  note?: string;
  deductFromBalance?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
  icon: string;
  description?: string;
  contributions: GoalContribution[];
  createdAt: string;
  isCompleted?: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
}

export type AppTheme = 'light' | 'dark' | 'system';
export type DateFormat = 'DD-MM-YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  avatarUrl: string;
  occupation: string;
  monthlyIncomeTarget?: number;
  role?: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  registeredAt?: string;
}

export interface UserSettings {
  currency: CurrencyConfig;
  theme: AppTheme;
  dateFormat: DateFormat;
  openingBalance: number;
  enableNotifications: boolean;
  enableHaptics: boolean;
  profile: UserProfile;
  onboardingCompleted: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
  language?: 'en' | 'ur';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  date: string;
  read: boolean;
  actionScreen?: NavigationTab;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'budgets' 
  | 'reports' 
  | 'bills' 
  | 'goals' 
  | 'categories' 
  | 'settings'
  | 'admin';

// Admin-specific interfaces
export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  registeredAt: string;
  lastLoginAt: string;
  totalTransactions: number;
  totalSpentPkr: number;
  totalIncomePkr: number;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AdminPlatformStats {
  totalRegisteredUsers: number;
  activeUsersMonthly: number;
  activeUsersDaily: number;
  totalPlatformVolumePkr: number;
  totalExpensesPkr: number;
  totalIncomePkr: number;
  totalTransactionsCount: number;
  averageTransactionPkr: number;
  cityDistribution: { city: string; count: number }[];
  serverHealth: {
    status: 'OPTIMAL' | 'DEGRADED';
    uptime: string;
    avgLatencyMs: number;
    errorRate: string;
  };
}
