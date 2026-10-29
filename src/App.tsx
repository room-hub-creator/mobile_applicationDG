/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppNavbar } from './components/common/AppNavbar';
import { ToastContainer } from './components/common/ToastContainer';
import { AiAssistantModal } from './components/common/AiAssistantModal';
import { MobileShell } from './components/mobile/MobileShell';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TestSuiteView } from './components/testing/TestSuiteView';
import { AuthModal } from './components/mobile/AuthModal';
import { ShoppingBag, ShieldCheck, MapPin, Smartphone, LayoutDashboard, FlaskConical } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, t, isAuthModalOpen, closeAuthModal, authModalMode } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <AppNavbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeView === 'customer' && <MobileShell />}
        {activeView === 'admin' && <AdminDashboard />}
        {activeView === 'testing' && <TestSuiteView />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
              D&G
            </div>
            <div>
              <span className="font-bold text-slate-200">D&G E-Commerce Rwanda</span>
              <span className="mx-2 text-slate-600">·</span>
              <span>Rwamagana, Eastern Province</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MoMo & Airtel Money Integrated</span>
            </span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:inline">Assignment 1 · Cross-Platform Mobile & Admin</span>
          </div>
        </div>
      </footer>

      {/* Global AI Shopping & Store Operations Assistant */}
      <AiAssistantModal />

      {/* Global Authentication & Password Recovery Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
