import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center p-8 bg-white border-cream-300 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Authentication Required</h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
          The requested resource is protected by Foodlink security policies. Please sign in to verify your identity.
        </p>
        <div className="flex flex-col gap-2">
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" className="w-full" icon={ArrowRight}>
              Sign In to Your Account
            </Button>
          </Link>
          <Link to={ROUTES.HOME}>
            <Button variant="ghost" className="w-full">
              Return to Platform Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

