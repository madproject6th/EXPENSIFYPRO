import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import {
  initDatabase,
  checkDbStatus,
  registerUser,
  loginUser,
  getAllUsers,
  getAllTransactions,
  getTransactionById,
  insertTransaction,
  updateTransaction,
  deleteTransactionById,
  getAllCategories,
  upsertCategory,
  deleteCategoryById,
  getAllBudgets,
  upsertBudget,
  getAllBills,
  upsertBill,
  deleteBillById,
  getAllGoals,
  upsertGoal,
  addGoalContributionToDb,
  deleteGoalById,
  getUserSettingsFromDb,
  saveUserSettingsToDb,
  getAdminOverview,
  executeSafeQuery,
  bulkSyncData,
} from './src/server/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize and inspect PostgreSQL database connection
initDatabase().then((status) => {
  console.log('[Expensify Pro DB]', status.message);
}).catch((err) => {
  console.warn('[Expensify Pro DB Warning]', err.message);
});

// --- DATABASE STATUS & HEALTH API ---
app.get('/api/db/status', async (_req: Request, res: Response) => {
  const status = await checkDbStatus();
  res.json(status);
});

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDbStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Karachi (PKT, UTC+05:00)',
    currency: 'PKR (Rs.)',
    database: {
      connected: dbStatus.connected,
      engine: dbStatus.engine,
      databaseName: dbStatus.databaseName,
      tables: dbStatus.existingTables,
      latencyMs: dbStatus.latencyMs,
    },
  });
});

// --- AUTHENTICATION & USERS API ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await registerUser(name, email, password, role || 'user');
    res.status(201).json({
      success: true,
      user,
      token: `token_${user.id}_${Date.now()}`,
      message: 'User registered successfully in PostgreSQL',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await loginUser(email, password);
    res.json({
      success: true,
      user,
      token: `token_${user.id}_${Date.now()}`,
      message: 'Authentication successful',
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

// --- TRANSACTIONS API (CRUD WITH POSTGRESQL) ---
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || undefined;
    const txs = await getAllTransactions(userId);
    res.json(txs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch transactions', message: err.message });
  }
});

app.get('/api/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tx = await getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }
    res.json(tx);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch transaction', message: err.message });
  }
});

app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const tx = req.body;
    if (!tx || !tx.title || tx.amount === undefined || !tx.type || !tx.categoryId) {
      return res.status(400).json({ error: 'Validation failed: title, amount, type, and categoryId are required' });
    }
    const numAmount = Number(tx.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Validation failed: amount must be a positive number' });
    }

    const userId = (req.query.userId as string) || tx.userId || 'usr-pak-001';
    const saved = await insertTransaction(tx, userId);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save transaction to PostgreSQL', message: err.message });
  }
});

app.put('/api/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || req.body.userId || 'usr-pak-001';
    const updated = await updateTransaction(id, req.body, userId);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update transaction', message: err.message });
  }
});

app.delete('/api/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || undefined;
    await deleteTransactionById(id, userId);
    res.json({ success: true, id, message: 'Transaction deleted from PostgreSQL' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete transaction', message: err.message });
  }
});

// --- ADMIN PANEL API ---
app.get('/api/admin/overview', async (_req: Request, res: Response) => {
  try {
    const overview = await getAdminOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load admin overview', message: err.message });
  }
});

app.post('/api/admin/query', async (req: Request, res: Response) => {
  try {
    const { sql, params } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query string required' });
    }
    const result = await executeSafeQuery(sql, params || []);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'SQL execution failed' });
  }
});

// --- CATEGORIES API ---
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const cats = await getAllCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories', message: err.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const cat = req.body;
    if (!cat || !cat.name || !cat.type) {
      return res.status(400).json({ error: 'Category name and type are required' });
    }
    const saved = await upsertCategory(cat);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save category', message: err.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCategoryById(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category', message: err.message });
  }
});

// --- BUDGETS API ---
app.get('/api/budgets', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const budgets = await getAllBudgets(userId);
    res.json(budgets);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch budgets', message: err.message });
  }
});

app.post('/api/budgets', async (req: Request, res: Response) => {
  try {
    const budget = req.body;
    if (!budget || !budget.month || budget.totalBudget === undefined) {
      return res.status(400).json({ error: 'Budget month and totalBudget are required' });
    }
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const saved = await upsertBudget(budget, userId);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save budget', message: err.message });
  }
});

// --- RECURRING BILLS API ---
app.get('/api/bills', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const bills = await getAllBills(userId);
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bills', message: err.message });
  }
});

app.post('/api/bills', async (req: Request, res: Response) => {
  try {
    const bill = req.body;
    if (!bill || !bill.title || bill.amount === undefined || !bill.nextDueDate) {
      return res.status(400).json({ error: 'Bill title, amount, and nextDueDate are required' });
    }
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const saved = await upsertBill(bill, userId);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save bill', message: err.message });
  }
});

app.delete('/api/bills/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'usr-pak-001';
    await deleteBillById(id, userId);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete bill', message: err.message });
  }
});

// --- SAVINGS GOALS API ---
app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const goals = await getAllGoals(userId);
    res.json(goals);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch goals', message: err.message });
  }
});

app.post('/api/goals', async (req: Request, res: Response) => {
  try {
    const goal = req.body;
    if (!goal || !goal.name || goal.targetAmount === undefined) {
      return res.status(400).json({ error: 'Goal name and targetAmount are required' });
    }
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const saved = await upsertGoal(goal, userId);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save goal', message: err.message });
  }
});

app.post('/api/goals/:id/contribute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contrib = req.body;
    if (!contrib || contrib.amount === undefined) {
      return res.status(400).json({ error: 'Contribution amount is required' });
    }
    const saved = await addGoalContributionToDb(id, contrib);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record contribution', message: err.message });
  }
});

app.delete('/api/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'usr-pak-001';
    await deleteGoalById(id, userId);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete goal', message: err.message });
  }
});

// --- SETTINGS API ---
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const settings = await getUserSettingsFromDb(userId);
    res.json(settings || {});
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
});

app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const saved = await saveUserSettingsToDb(settings, userId);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save settings', message: err.message });
  }
});

// --- BULK FULL SYNC API ---
app.post('/api/sync/pull', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const [transactions, categories, budgets, bills, goals, settings, dbStatus] = await Promise.all([
      getAllTransactions(userId),
      getAllCategories(),
      getAllBudgets(userId),
      getAllBills(userId),
      getAllGoals(userId),
      getUserSettingsFromDb(userId),
      checkDbStatus(),
    ]);

    res.json({
      transactions,
      categories,
      budgets,
      bills,
      goals,
      settings,
      dbStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync pull failed', message: err.message });
  }
});

app.post('/api/sync/push', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-pak-001';
    const result = await bulkSyncData(req.body, userId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Sync push failed', message: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expensify Pro Pakistan API & App running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
