import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function PendingVerificationPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 bg-white border-amber-200 shadow-card text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <Badge variant="warning" size="md">
            Pending Legal & Kitchen Safety Verification
          </Badge>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-2">
            Verification Under Review
          </h1>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          Thank you for registering <strong>{user?.name || 'your organization'}</strong>. To safeguard food recipients,
          all non-profit shelters and community kitchens undergo mandatory document verification by platform
          administrators before claiming restricted food surplus.
        </p>

        <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 text-left text-xs text-stone-600 space-y-2">
          <p className="font-semibold text-stone-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-600" /> What happens next:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Our administrative team reviews your 501(c)(3) or charitable registration credentials.</li>
            <li>Verification is typically finalized within 4 to 24 business hours.</li>
            <li>You will receive an automated confirmation when matching privileges are enabled.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={ROUTES.FOOD_DISCOVERY}>
            <Button variant="secondary" size="md">
              Browse Public Food Board
            </Button>
          </Link>
          <Button variant="outline" size="md" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

