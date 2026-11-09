import React from 'react';
import { ShieldX, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export function SuspendedAccountPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center p-8 bg-white border-red-300 shadow-card space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto border border-red-200">
          <ShieldX className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Account Suspended</h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Access for <strong>{user?.email || 'this account'}</strong> has been temporarily suspended due to a food
          safety audit inquiry or terms violation.
        </p>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-800 text-left">
          Please reach out to our safety compliance desk at{' '}
          <a href="mailto:safety@foodlink.org" className="underline font-bold">
            safety@foodlink.org
          </a>{' '}
          with your organization verification ID.
        </div>

        <Button variant="danger" className="w-full" onClick={logout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
}

