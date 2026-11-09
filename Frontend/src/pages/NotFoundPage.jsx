import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-7xl font-extrabold text-forest-700">404</span>
      <h1 className="text-2xl font-bold text-stone-900 mt-2">Page Not Found</h1>
      <p className="text-sm text-stone-500 max-w-md mt-2 mb-6">
        The destination you requested does not exist or has been relocated within the Foodlink network.
      </p>
      <div className="flex gap-3">
        <Link to={ROUTES.HOME}>
          <Button variant="primary" icon={Home}>
            Return Home
          </Button>
        </Link>
        <Link to={ROUTES.FOOD_DISCOVERY}>
          <Button variant="outline">Browse Public Food</Button>
        </Link>
      </div>
    </div>
  );
}

