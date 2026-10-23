import { Category, CurrencyConfig, PaymentMethod, UserSettings } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', position: 'prefix' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'prefix' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', position: 'prefix' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', position: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', position: 'prefix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'prefix' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-groceries', name: 'Groceries & Rashan', nameUrdu: 'راشن اور سودا سلف', type: 'expense', icon: 'ShoppingBag', color: '#10B981', isDefault: true, budgetLimit: 35000 },
  { id: 'cat-electricity', name: 'Electricity (LESCO/KE/IESCO)', nameUrdu: 'بجلی کا بل', type: 'expense', icon: 'Zap', color: '#F59E0B', isDefault: true, budgetLimit: 25000 },
  { id: 'cat-gas', name: 'Sui Gas (SSGC/SNGPL)', nameUrdu: 'سوئی گیس کا بل', type: 'expense', icon: 'Flame', color: '#EF4444', isDefault: true, budgetLimit: 4000 },
  { id: 'cat-water', name: 'Water & Tanker', nameUrdu: 'پانی اور ٹینکر', type: 'expense', icon: 'Droplets', color: '#06B6D4', isDefault: true, budgetLimit: 3500 },
  { id: 'cat-internet', name: 'Internet & Fiber (Nayatel/PTCL)', nameUrdu: 'انٹرنیٹ اور براڈ بینڈ', type: 'expense', icon: 'Wifi', color: '#3B82F6', isDefault: true, budgetLimit: 4500 },
  { id: 'cat-mobile', name: 'Mobile Load & Bundles', nameUrdu: 'موبائل کارڈ اور پیکیجز', type: 'expense', icon: 'Smartphone', color: '#8B5CF6', isDefault: true, budgetLimit: 3000 },
  { id: 'cat-fuel', name: 'Petrol & Fuel (PSO/Shell)', nameUrdu: 'پیٹرول اور فیول', type: 'expense', icon: 'Fuel', color: '#EA580C', isDefault: true, budgetLimit: 18000 },
  { id: 'cat-transport', name: 'Careem / Bykea / Public Bus', nameUrdu: 'ٹرانسپورٹ اور رائیڈز', type: 'expense', icon: 'Car', color: '#F97316', isDefault: true, budgetLimit: 6000 },
  { id: 'cat-rent', name: 'House Rent', nameUrdu: 'مکان کا کرایہ', type: 'expense', icon: 'Home', color: '#6366F1', isDefault: true, budgetLimit: 45000 },
  { id: 'cat-school', name: 'School & College Fees', nameUrdu: 'اسکول اور تعلیمی فیس', type: 'expense', icon: 'GraduationCap', color: '#0284C7', isDefault: true, budgetLimit: 20000 },
  { id: 'cat-healthcare', name: 'Healthcare & Medicines', nameUrdu: 'ڈاکٹر اور ادویات', type: 'expense', icon: 'HeartPulse', color: '#E11D48', isDefault: true, budgetLimit: 10000 },
  { id: 'cat-dining', name: 'Dining Out & Chai', nameUrdu: 'کھانا پینا اور چائے', type: 'expense', icon: 'Utensils', color: '#D97706', isDefault: true, budgetLimit: 12000 },
  { id: 'cat-shopping', name: 'Clothing & Shopping', nameUrdu: 'کپڑے اور خریداری', type: 'expense', icon: 'Shirt', color: '#EC4899', isDefault: true, budgetLimit: 15000 },
  { id: 'cat-charity', name: 'Sadaqah & Zakat', nameUrdu: 'صدقہ، خیرات اور زکوٰۃ', type: 'expense', icon: 'Gift', color: '#059669', isDefault: true, budgetLimit: 8000 },
  { id: 'cat-other-exp', name: 'Other Daily Expenses', nameUrdu: 'متفرق گھریلو اخراجات', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', isDefault: true, budgetLimit: 8000 },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Monthly Salary', nameUrdu: 'ماہانہ تنخواہ', type: 'income', icon: 'Briefcase', color: '#10B981', isDefault: true },
  { id: 'cat-freelance', name: 'Freelancing & Remote Tech', nameUrdu: 'فری لانسنگ اور ریموٹ جاب', type: 'income', icon: 'Laptop', color: '#059669', isDefault: true },
  { id: 'cat-business', name: 'Business & Trade Profit', nameUrdu: 'کاروباری منافع', type: 'income', icon: 'TrendingUp', color: '#0D9488', isDefault: true },
  { id: 'cat-remittance', name: 'Foreign Remittance (Home Transfer)', nameUrdu: 'بیرون ملک سے ترسیلات', type: 'income', icon: 'PlaneLanding', color: '#2563EB', isDefault: true },
  { id: 'cat-rent-income', name: 'Rental Property Income', nameUrdu: 'کرایہ کی آمدن', type: 'income', icon: 'Building2', color: '#7C3AED', isDefault: true },
  { id: 'cat-other-inc', name: 'Gifts, Eidi & Other Income', nameUrdu: 'عیدی اور متفرق آمدن', type: 'income', icon: 'Coins', color: '#475569', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: string; brandColor: string }> = {
  cash: { label: 'Cash (کیش)', icon: 'Banknote', brandColor: '#10B981' },
  easypaisa: { label: 'Easypaisa (ایزی پیسہ)', icon: 'Smartphone', brandColor: '#00A859' },
  jazzcash: { label: 'JazzCash (جاز کیش)', icon: 'Smartphone', brandColor: '#ED1C24' },
  raast: { label: 'Raast Instant Pay (راست)', icon: 'Zap', brandColor: '#006633' },
  nayapay_sadapay: { label: 'SadaPay / NayaPay', icon: 'CreditCard', brandColor: '#FF6B00' },
  bank_transfer: { label: 'Bank Transfer / IBFT (1Link)', icon: 'Building2', brandColor: '#1E3A8A' },
  debit_card: { label: 'Debit Card (PayPak/Visa)', icon: 'CreditCard', brandColor: '#2563EB' },
  credit_card: { label: 'Credit Card', icon: 'CreditCard', brandColor: '#4F46E5' },
  other: { label: 'Other Method', icon: 'Wallet', brandColor: '#64748B' },
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: SUPPORTED_CURRENCIES[0], // PKR / Rs.
  theme: 'system',
  dateFormat: 'DD-MM-YYYY', // Pakistan default date format
  openingBalance: 45000.0, // Rs. 45,000 PKR opening cash
  enableNotifications: true,
  enableHaptics: true,
  profile: {
    id: 'usr-pak-001',
    name: 'Usman Tariq',
    email: 'usman.tariq@expensify.pk',
    phone: '+92 300 1234567',
    city: 'Lahore, Pakistan',
    avatarUrl: '/src/assets/images/avatar_profile_user_1792754904096.jpg',
    occupation: 'Lead Systems Engineer',
    monthlyIncomeTarget: 250000.0,
    role: 'USER',
    status: 'ACTIVE',
    registeredAt: '2026-01-15T09:30:00Z',
  },
  onboardingCompleted: true,
  pinLockEnabled: false,
  language: 'en',
};

export const ONBOARDING_SLIDES = [
  {
    title: 'Track Expenses Across Pakistan',
    subtitle: 'Effortlessly log daily rashan, petrol, school fees, and utilities (LESCO, KE, SSGC) with instant PKR totals.',
    image: '/src/assets/images/onboarding_track_wealth_1792754902558.jpg',
  },
  {
    title: 'Pakistani Banking & Mobile Wallets',
    subtitle: 'Integrated tracking for Easypaisa, JazzCash, Raast, SadaPay, and all 1Link IBFT bank transfers.',
    image: '/src/assets/images/onboarding_analytics_insights_1792754903510.jpg',
  },
  {
    title: 'Smart Budgets & Monthly Savings',
    subtitle: 'Set family budgets in PKR, receive 80% limit alerts before month-end, and build your emergency fund.',
    image: '/src/assets/images/onboarding_smart_budgets_1792754906186.jpg',
  },
];
