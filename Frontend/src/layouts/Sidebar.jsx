import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  HandHeart,
  History,
  MessageSquare,
  Bell,
  Settings,
  Truck,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  Building2,
  FileCheck2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { cn } from '../utils/cn.js';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const role = user?.role || ROLES.DONOR;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS[ROLES.DONOR];

  const getNavItems = () => {
    switch (role) {
      case ROLES.DONOR:
        return [
          { label: 'Overview', to: ROUTES.DONOR_DASHBOARD, icon: LayoutDashboard },
          { label: 'Create Donation', to: ROUTES.DONOR_NEW_DONATION, icon: PackagePlus, highlight: true },
          { label: 'My Donations', to: ROUTES.DONOR_DONATIONS, icon: Boxes },
          { label: 'NGO Requests', to: ROUTES.DONOR_REQUESTS, icon: HandHeart },
          { label: 'Donation History', to: ROUTES.DONOR_HISTORY, icon: History },
          { label: 'Feedback', to: ROUTES.DONOR_FEEDBACK, icon: MessageSquare },
          { label: 'Notifications', to: ROUTES.DONOR_NOTIFICATIONS, icon: Bell },
          { label: 'Profile & Settings', to: ROUTES.DONOR_PROFILE, icon: Settings },
        ];
      case ROLES.NGO:
        return [
          { label: 'Overview', to: ROUTES.NGO_DASHBOARD, icon: LayoutDashboard },
          { label: 'Smart Matches', to: ROUTES.NGO_RECOMMENDED, icon: Sparkles, highlight: true },
          { label: 'Browse Surplus', to: ROUTES.NGO_DONATIONS, icon: Boxes },
          { label: 'My Requests', to: ROUTES.NGO_REQUESTS, icon: HandHeart },
          { label: 'Accepted Rescues', to: ROUTES.NGO_ACCEPTED, icon: PackageCheck },
          { label: 'Delivery Tracking', to: ROUTES.NGO_DELIVERIES, icon: Truck },
          { label: 'Feedback & Ratings', to: ROUTES.NGO_FEEDBACK, icon: MessageSquare },
          { label: 'Notifications', to: ROUTES.NGO_NOTIFICATIONS, icon: Bell },
          { label: 'Organization Profile', to: ROUTES.NGO_PROFILE, icon: Building2 },
        ];
      case ROLES.DELIVERY:
        return [
          { label: 'Overview', to: ROUTES.DELIVERY_DASHBOARD, icon: LayoutDashboard },
          { label: 'Available Rescues', to: ROUTES.DELIVERY_AVAILABLE, icon: Compass, highlight: true },
          { label: 'My Assignments', to: ROUTES.DELIVERY_TASKS, icon: Truck },
          { label: 'Delivery History', to: ROUTES.DELIVERY_HISTORY, icon: History },
          { label: 'Feedback & Ratings', to: ROUTES.DELIVERY_FEEDBACK, icon: MessageSquare },
          { label: 'Notifications', to: ROUTES.DELIVERY_NOTIFICATIONS, icon: Bell },
          { label: 'Partner Profile', to: ROUTES.DELIVERY_PROFILE, icon: Settings },
        ];
      case ROLES.ADMIN:
        return [
          { label: 'Overview', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
          { label: 'NGO Verification', to: ROUTES.ADMIN_VERIFICATIONS, icon: ShieldAlert, highlight: true },
          { label: 'Donor Management', to: ROUTES.ADMIN_DONORS, icon: Users },
          { label: 'Volunteer Couriers', to: ROUTES.ADMIN_COURIERS, icon: Truck },
          { label: 'Donation Central', to: ROUTES.ADMIN_DONATIONS, icon: Boxes },
          { label: 'Rescue Requests', to: ROUTES.ADMIN_REQUESTS, icon: HandHeart },
          { label: 'Dispatch Tracking', to: ROUTES.ADMIN_ASSIGNMENTS, icon: Compass },
          { label: 'Food Safety Audits', to: ROUTES.ADMIN_FOOD_SAFETY, icon: FileCheck2 },
          { label: 'Impact Analytics', to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
          { label: 'Feedback Moderation', to: ROUTES.ADMIN_FEEDBACK, icon: MessageSquare },
          { label: 'Platform Settings', to: ROUTES.ADMIN_SETTINGS, icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    success('You have been securely signed out.', 'Session Closed');
    navigate(ROUTES.HOME);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-cream-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-[calc(100vh-4rem)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* User Identity Card */}
        <div className="p-4 border-b border-cream-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Authenticated As</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                roleColor.bg
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', roleColor.dot)} />
              {ROLE_LABELS[role]}
            </span>
          </div>

          <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200">
            <p className="text-sm font-bold text-stone-900 truncate">{user?.name || 'Partner Account'}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email || 'authenticated'}</p>
            {user?.organizationName && (
              <p className="text-[11px] font-semibold text-forest-700 mt-1 truncate">
                {user.organizationName}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.DONOR_DASHBOARD}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors group',
                    isActive
                      ? 'bg-forest-50 text-forest-800 font-extrabold shadow-xs border border-forest-200'
                      : item.highlight
                      ? 'text-terracotta-700 bg-terracotta-50/70 hover:bg-terracotta-100/70 border border-terracotta-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-cream-100'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-stone-500 group-hover:text-forest-700 transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform group-hover:translate-x-0.5" />
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-cream-200 space-y-2">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 text-stone-400 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Secure Sign Out"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to log out? Your HttpOnly authentication cookies will be cleared.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutModal(false)}>
              Cancel
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
