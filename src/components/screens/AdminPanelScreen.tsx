import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Database,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Trash2,
  Terminal,
  Play,
  UserPlus,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Server,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { ApiService, AdminOverviewResponse, DatabaseStatusResponse } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../services/financialCalculator';

export const AdminPanelScreen: React.FC = () => {
  const { settings, showToast } = useApp();

  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [adminUser, setAdminUser] = useState<any>({
    name: 'Muhammad Tariq',
    email: 'admin@expensifypro.pk',
    role: 'admin',
  });

  // Login form states
  const [loginEmail, setLoginEmail] = useState('admin@expensifypro.pk');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Data states
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatusResponse | null>(null);
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'users' | 'transactions' | 'sql'>('overview');

  // Transactions filter
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Users list
  const [usersList, setUsersList] = useState<any[]>([]);

  // New user registration modal inside admin
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [isRegistering, setIsRegistering] = useState(false);

  // SQL Console
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryError, setQueryError] = useState('');
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  // Fetch live overview and DB status
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [status, data, users] = await Promise.all([
        ApiService.getDatabaseStatus(),
        ApiService.getAdminOverview().catch(() => null),
        ApiService.getUsers().catch(() => []),
      ]);
      setDbStatus(status);
      if (data) setOverview(data);
      if (users) setUsersList(users);
    } catch (err: any) {
      showToast('Error', 'Failed to refresh admin data from PostgreSQL', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const res = await ApiService.loginUser(loginEmail, loginPassword);
      if (res.user.role !== 'admin') {
        throw new Error('Access denied: You do not have administrator permissions');
      }
      setAdminUser(res.user);
      setIsAdminLoggedIn(true);
      showToast('Authenticated', `Welcome back, ${res.user.name}`, 'success');
      refreshData();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      showToast('Validation Error', 'All fields are required', 'warning');
      return;
    }
    setIsRegistering(true);
    try {
      await ApiService.registerUser(newUserName, newUserEmail, newUserPassword, newUserRole);
      showToast('User Created', `User ${newUserName} successfully added to PostgreSQL`, 'success');
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      refreshData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create user', 'alert');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteTransaction = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete transaction "${title}" from the PostgreSQL database?`)) {
      return;
    }
    try {
      await ApiService.deleteTransaction(id);
      showToast('Deleted', 'Transaction removed from PostgreSQL table', 'success');
      refreshData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete transaction', 'alert');
    }
  };

  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecutingSql(true);
    setQueryError('');
    setQueryResult(null);
    try {
      const res = await ApiService.executeAdminQuery(sqlQuery);
      setQueryResult(res);
      showToast('Query Executed', `Returned ${res.rowCount} rows in ${res.durationMs}ms`, 'success');
    } catch (err: any) {
      setQueryError(err.message || 'Query execution error');
    } finally {
      setIsExecutingSql(false);
    }
  };

  // If not logged in, show Admin Login Portal
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Console Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Expensify Pro Pakistan &bull; PostgreSQL Database Management
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Admin Email Address
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="admin@expensifypro.pk"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Sign In to Admin Panel</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Default credentials: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">admin@expensifypro.pk</code> / <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">admin123</code>
          </p>
        </div>
      </div>
    );
  }

  // Filter transactions for explorer
  const filteredTransactions = (overview?.recentTransactions || []).filter((tx: any) => {
    const matchesSearch = tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Expensify Pro &bull; Admin Console</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                PostgreSQL Live
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Logged in as <span className="font-semibold text-white">{adminUser.name}</span> ({adminUser.email}) &bull; PKT Timezone (UTC+05:00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-medium rounded-xl border border-red-800/40 flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* PostgreSQL Database Health Indicator */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Database Engine:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                {dbStatus?.engine || 'postgresql'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Database Name:</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold">
                {dbStatus?.databaseName || 'EXPENSIFYPRO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified Schema Tables ({dbStatus?.existingTables?.length || 0}):{' '}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {dbStatus?.existingTables?.join(', ') || 'users, transactions, categories, budgets, recurring_bills, savings_goals, goal_contributions, user_settings'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right ml-auto">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 dark:text-slate-400">
            Latency: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{dbStatus?.latencyMs ?? 1} ms</strong>
          </span>
        </div>
      </div>

      {/* Aggregate Financial & System Metrics (PKR) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {overview?.totalUsers ?? usersList.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">PostgreSQL `users` table</div>
        </div>

        {/* Total Transactions */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Transactions</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {overview?.totalTransactions ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">PostgreSQL rows</div>
        </div>

        {/* Total Income */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(overview?.totalIncome ?? 0, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sum of income rows</div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-lg font-bold font-mono tracking-tight text-red-600 dark:text-red-400">
            {formatCurrency(overview?.totalExpense ?? 0, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sum of expense rows</div>
        </div>

        {/* Net Volume / Balance */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Net Balance</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-lg font-bold font-mono tracking-tight ${(overview?.netBalance ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(overview?.netBalance ?? 0, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active ledger reserve</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeAdminTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System Overview</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeAdminTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('transactions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeAdminTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Transactions Table ({overview?.totalTransactions ?? 0})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('sql')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeAdminTab === 'sql'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SQL Query Verification</span>
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Stored Transactions in DB */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Recent Database Transactions</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Top 10 rows</span>
            </div>

            {overview?.recentTransactions && overview.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="pb-2 font-medium">Title</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Payment</th>
                      <th className="pb-2 font-medium text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {overview.recentTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                          {tx.title}
                          <div className="text-[10px] text-slate-400 font-mono">{tx.id}</div>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500 capitalize">{tx.paymentMethod}</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No transactions currently in PostgreSQL database table. Create an expense or income to persist!
              </div>
            )}
          </div>

          {/* Registered Users Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Registered Application Users</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg flex items-center gap-1 font-medium hover:bg-emerald-700 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                        {u.name}
                        <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: USERS MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">User Directory</h3>
              <p className="text-xs text-slate-500">
                Accounts registered in PostgreSQL `users` table with hashed passwords and role authorization.
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">User ID</th>
                  <th className="pb-2.5 font-semibold">Full Name</th>
                  <th className="pb-2.5 font-semibold">Email</th>
                  <th className="pb-2.5 font-semibold">Role</th>
                  <th className="pb-2.5 font-semibold">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {usersList.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-500">{u.id}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) : 'Initial Seed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TRANSACTIONS TABLE */}
      {activeAdminTab === 'transactions' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">PostgreSQL Transactions Explorer</h3>
              <p className="text-xs text-slate-500">
                Inspect, verify, and manage all financial rows stored in the database.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">ID</th>
                  <th className="pb-2.5 font-semibold">Title</th>
                  <th className="pb-2.5 font-semibold">Type</th>
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 font-semibold">Payment</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold text-right">Amount (PKR)</th>
                  <th className="pb-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{tx.title}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono">{tx.categoryId || tx.category_id}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 capitalize">{tx.paymentMethod}</td>
                    <td className="py-3 text-slate-400 font-mono">{tx.date}</td>
                    <td className="py-3 text-right font-mono font-semibold">
                      <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id, tx.title)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 rounded transition"
                        title="Delete from PostgreSQL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SQL QUERY VERIFICATION CONSOLE */}
      {activeAdminTab === 'sql' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Direct PostgreSQL Verification Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute live read SQL queries directly on the PostgreSQL database to inspect raw rows and schema records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 self-center">Quick Templates:</span>
            <button
              onClick={() => setSqlQuery('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              SELECT * FROM transactions
            </button>
            <button
              onClick={() => setSqlQuery('SELECT * FROM users;')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              SELECT * FROM users
            </button>
            <button
              onClick={() => setSqlQuery('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              information_schema.tables
            </button>
            <button
              onClick={() => setSqlQuery('SELECT type, COUNT(*) as count, SUM(amount)::float as total_pkr FROM transactions GROUP BY type;')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Aggregate by Type
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="SELECT * FROM transactions;"
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Connected: <strong className="text-slate-700 dark:text-slate-300">{dbStatus?.databaseName || 'EXPENSIFYPRO'}</strong>
              </span>
              <button
                onClick={handleRunSql}
                disabled={isExecutingSql}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
              >
                {isExecutingSql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Execute Query</span>
              </button>
            </div>
          </div>

          {queryError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-mono">
              Error: {queryError}
            </div>
          )}

          {queryResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>Returned {queryResult.rowCount} rows</span>
                <span>Execution: {queryResult.durationMs}ms</span>
              </div>
              <div className="overflow-x-auto max-h-72">
                {queryResult.rows && queryResult.rows.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-emerald-400">
                        {Object.keys(queryResult.rows[0]).map((key) => (
                          <th key={key} className="pb-1.5 pr-4 font-semibold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {queryResult.rows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, colIdx: number) => (
                            <td key={colIdx} className="py-1.5 pr-4 whitespace-nowrap">
                              {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-slate-500 py-3 text-center">0 rows returned</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold mb-1">Add New PostgreSQL User</h3>
            <p className="text-xs text-slate-500 mb-4">
              Directly creates an account record in the database `users` table.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Bilal Khan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="bilal@expensifypro.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  {isRegistering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
