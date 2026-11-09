import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  User,
  Menu,
  X,
  ArrowRight,
  LogOut,
  Info,
  Layers,
  PhoneCall,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { cn } from '../utils/cn.js';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success } = useToast();
  const { unreadCount } = useNotifications(25000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    switch (role) {
      case ROLES.DONOR:
        return ROUTES.DONOR_DASHBOARD;
      case ROLES.NGO:
        return ROUTES.NGO_DASHBOARD;
      case ROLES.DELIVERY:
        return ROUTES.DELIVERY_DASHBOARD;
      case ROLES.ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      default:
        return ROUTES.HOME;
    }
  };

  const getNotificationsPath = (role) => {
    switch (role) {
      case ROLES.DONOR:
        return ROUTES.DONOR_NOTIFICATIONS;
      case ROLES.NGO:
        return ROUTES.NGO_NOTIFICATIONS;
      case ROLES.DELIVERY:
        return ROUTES.DELIVERY_NOTIFICATIONS;
      case ROLES.ADMIN:
        return ROUTES.ADMIN_ANALYTICS;
      default:
        return ROUTES.HOME;
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    success('You have been securely signed out.', 'Session Ended');
    navigate(ROUTES.HOME);
  };

  const roleColor = user ? ROLE_COLORS[user.role] : null;

  const navLinks = [
    { label: 'Home', to: ROUTES.HOME },
    { label: 'About', to: ROUTES.ABOUT },
    { label: 'How It Works', to: ROUTES.HOW_IT_WORKS },
    { label: 'Available Food', to: ROUTES.AVAILABLE_FOOD, icon: HeartHandshake, highlight: true },
    { label: 'Food Safety', to: ROUTES.FOOD_SAFETY, icon: ShieldCheck },
    { label: 'Contact', to: ROUTES.CONTACT },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5 text-cream-50" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-forest-900">
                  Food<span className="text-terracotta-600">link</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-forest-50 text-forest-700 rounded-full border border-forest-200">
                  Rescue
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5',
                      isActive
                        ? 'text-forest-800 bg-forest-50 font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-cream-200/60',
                      item.highlight && !isActive ? 'text-forest-700 font-bold' : ''
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-forest-700" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Menu */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-cream-300 shadow-sm text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-stone-800">{user.name}</span>
                    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase', roleColor?.bg)}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>

                  {/* Live In-App Notifications Bell */}
                  <Link
                    to={getNotificationsPath(user.role)}
                    className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-cream-200/70 rounded-xl transition-colors"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link to={getDashboardPath(user.role)}>
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      Dashboard
                    </Button>
                  </Link>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER}>
                    <Button variant="warm" size="sm">
                      Join as Partner
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-cream-200 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-cream-100 px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                    location.pathname === item.to
                      ? 'text-forest-800 bg-forest-100 font-bold'
                      : 'text-stone-700 hover:bg-cream-200'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-cream-200 space-y-2">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-cream-200">
                    <div>
                      <span className="font-bold text-stone-900 block">{user.name}</span>
                      <span className="text-stone-500">{user.email}</span>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase border', roleColor?.bg)}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>

                  <Link
                    to={getNotificationsPath(user.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-cream-50 hover:bg-cream-100 text-stone-700 border border-cream-200"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-forest-700" />
                      In-App Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta-500 text-white font-bold text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </Link>

                  <Link
                    to={getDashboardPath(user.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      Open Dashboard
                    </Button>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl text-center"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="warm" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Secure Sign Out"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to log out of Foodlink? Your HttpOnly session credentials will be revoked immediately.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutModal(false)}>
              Stay Signed In
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
