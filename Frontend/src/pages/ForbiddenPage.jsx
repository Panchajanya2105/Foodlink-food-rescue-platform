import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center p-8 bg-white border-red-200 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Access Forbidden (403)</h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
          Your current account role (<strong>{user?.role || 'Guest'}</strong>) is not authorized to access this operational console.
        </p>
        <div className="flex flex-col gap-2">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" className="w-full" icon={ArrowLeft}>
              Return to Public Platform
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full">
              Switch or Sign In to Another Role
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

