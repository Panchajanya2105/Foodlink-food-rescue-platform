import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Shield, ArrowLeft } from 'lucide-react';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Subheader bar */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-cream-200 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-cream-100"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-stone-900 tracking-tight">
                  {ROLE_LABELS[user?.role] || 'User'} Console
                </h1>
                <p className="text-xs text-stone-500 hidden sm:block">
                  Verified Rescue Network • Real-time Safety Protocol Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={ROUTES.HOME}>
                <Button variant="ghost" size="sm" icon={ArrowLeft}>
                  <span className="hidden sm:inline">Back to Public Site</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

