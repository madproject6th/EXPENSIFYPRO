import React from 'react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from './TopHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNavBar } from './BottomNavBar';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { RecurringBillsScreen } from '../screens/RecurringBillsScreen';
import { SavingsGoalsScreen } from '../screens/SavingsGoalsScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { AddTransactionModal } from '../screens/AddTransactionModal';
import { TransactionDetailModal } from '../screens/TransactionDetailModal';
import { ToastContainer } from '../common/ToastContainer';
import { PinLockScreen } from '../common/PinLockScreen';
import { AnimatePresence, motion } from 'motion/react';

export const AppLayout: React.FC = () => {
  const {
    activeTab,
    isAddModalOpen,
    setIsAddModalOpen,
    modalDefaultType,
    editingTransaction,
    setEditingTransaction,
    isLocked,
  } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'bills':
        return <RecurringBillsScreen />;
      case 'goals':
        return <SavingsGoalsScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'admin':
        return <AdminPanelScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Alert Notifications */}
      <ToastContainer />

      {/* Security PIN Lock if enabled */}
      {isLocked && <PinLockScreen />}

      {/* Top Header */}
      <TopHeader />

      {/* Main Workspace with Desktop Sidebar & Viewport Canvas */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden">
        <BottomNavBar />
      </div>

      {/* Add / Edit Transaction Sheet Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        defaultType={modalDefaultType}
        editingTx={editingTransaction}
      />

      {/* Inspect Transaction Slip Modal */}
      <TransactionDetailModal />
    </div>
  );
};
