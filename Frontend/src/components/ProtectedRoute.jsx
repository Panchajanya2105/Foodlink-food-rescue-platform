import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';

export function ProtectedRoute({ allowedRoles = [], requireVerified = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-forest-600/30 border-t-forest-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Verifying Foodlink Security Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Suspended account screen check
  if (user.accountStatus === USER_STATUS.SUSPENDED) {
    return <Navigate to="/suspended" replace />;
  }

  // Role permissions check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Pending NGO verification check for restricted operational pages
  if (requireVerified && user.role === ROLES.NGO && !user.isVerified) {
    return <Navigate to="/pending-verification" replace />;
  }

  return <Outlet />;
}

