import {
  BudgetConfig,
  Category,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types';

export interface DatabaseStatusResponse {
  connected: boolean;
  engine: 'postgresql' | 'postgresql_embedded';
  databaseName?: string;
  host?: string;
  port?: number;
  existingTables: string[];
  latencyMs: number;
  message: string;
}

export interface AdminOverviewResponse {
  databaseName: string;
  engine: string;
  latencyMs: number;
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  recentTransactions: any[];
  recentUsers: any[];
}

export interface UserAuthResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  token: string;
  message: string;
}

export class ApiService {
  /**
   * Check live database connection status from server
   */
  static async getDatabaseStatus(): Promise<DatabaseStatusResponse> {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) throw new Error('Status endpoint unavailable');
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        engine: 'postgresql_embedded',
        existingTables: [],
        latencyMs: 0,
        message: err.message || 'Server connection error',
      };
    }
  }

  /**
   * Pull complete state from backend database
   */
  static async pullSync(): Promise<{
    transactions: Transaction[];
    categories: Category[];
    budgets: BudgetConfig[];
    bills: RecurringBill[];
    goals: SavingsGoal[];
    settings?: UserSettings;
    dbStatus: DatabaseStatusResponse;
  } | null> {
    try {
      const res = await fetch('/api/sync/pull', { method: 'POST' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Push complete local ledger to PostgreSQL database
   */
  static async pushSync(data: {
    transactions?: Transaction[];
    categories?: Category[];
    budgets?: BudgetConfig[];
    bills?: RecurringBill[];
    goals?: SavingsGoal[];
    settings?: UserSettings;
  }): Promise<{ success: boolean; count: number; engine: string } | null> {
    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Individual entity mutation endpoints
  static async saveTransaction(tx: Transaction): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save transaction' }));
      throw new Error(err.error || 'Failed to save transaction to PostgreSQL');
    }
    return await res.json();
  }

  static async getTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`);
    if (!res.ok) throw new Error(`Transaction ${id} not found`);
    return await res.json();
  }

  static async updateTransaction(tx: Transaction): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${tx.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update transaction' }));
      throw new Error(err.error || 'Failed to update transaction in PostgreSQL');
    }
    return await res.json();
  }

  static async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Failed to delete transaction from PostgreSQL');
    }
  }

  static async saveCategory(cat: Category): Promise<void> {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
    } catch {}
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    } catch {}
  }

  static async saveBudget(budget: BudgetConfig): Promise<void> {
    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });
    } catch {}
  }

  static async saveBill(bill: RecurringBill): Promise<void> {
    try {
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill),
      });
    } catch {}
  }

  static async deleteBill(id: string): Promise<void> {
    try {
      await fetch(`/api/bills/${id}`, { method: 'DELETE' });
    } catch {}
  }

  static async saveGoal(goal: SavingsGoal): Promise<void> {
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
    } catch {}
  }

  static async addGoalContribution(goalId: string, contrib: any): Promise<void> {
    try {
      await fetch(`/api/goals/${goalId}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contrib),
      });
    } catch {}
  }

  static async deleteGoal(id: string): Promise<void> {
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    } catch {}
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch {}
  }

  // --- AUTHENTICATION & ADMIN APIS ---

  static async registerUser(name: string, email: string, password: string, role = 'user'): Promise<UserAuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return await res.json();
  }

  static async loginUser(email: string, password: string): Promise<UserAuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid login' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    return await res.json();
  }

  static async getUsers(): Promise<any[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  }

  static async getAdminOverview(): Promise<AdminOverviewResponse> {
    const res = await fetch('/api/admin/overview');
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return await res.json();
  }

  static async executeAdminQuery(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number; durationMs: number; sql: string }> {
    const res = await fetch('/api/admin/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Query execution failed' }));
      throw new Error(err.error || 'Query execution failed');
    }
    return await res.json();
  }
}
