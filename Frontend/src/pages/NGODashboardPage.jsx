import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, CheckCircle2, Clock, MapPin, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function NGODashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm" className="bg-white/20 text-white border-white/20 mb-2">
            Verified NGO Shelter
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name || 'Community Care Shelter'}
          </h2>
          <p className="text-xs sm:text-sm text-cream-100/90 mt-1 max-w-xl">
            Review food rescue recommendations matching your current shelter intake capacity and dietary needs.
          </p>
        </div>
        <Link to={ROUTES.NGO_AVAILABLE_FOOD}>
          <Button variant="warm" size="lg" icon={HeartHandshake}>
            Browse Recommendations
          </Button>
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Intake Capacity</span>
          <span className="text-3xl font-extrabold text-stone-900 mt-1 block">250 Persons</span>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">Shelter operating capacity</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Incoming Meals Today</span>
          <span className="text-3xl font-extrabold text-forest-700 mt-1 block">180</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">3 scheduled deliveries</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Pending Requests</span>
          <span className="text-3xl font-extrabold text-terracotta-600 mt-1 block">2</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Awaiting donor sign-off</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Families Nourished</span>
          <span className="text-3xl font-extrabold text-stone-900 mt-1 block">1,240</span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">This month</span>
        </Card>
      </div>

      {/* AI Recommendation Queue Preview */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Recommended Surplus Food For Your Shelter</CardTitle>
            <CardDescription>Ranked by proximity, dietary alignment, and urgency</CardDescription>
          </div>
          <Badge variant="forest" size="sm">Smart Match Active</Badge>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'REC-301',
              food: 'Warm Vegetable Stew & Bread Rolls',
              donor: 'Civic Center Catering',
              servings: 60,
              distance: '1.2 km away',
              score: '98% Match',
              deadline: 'Pickup by 7:30 PM',
            },
            {
              id: 'REC-302',
              food: 'Boxed Deli Sandwiches (Chilled)',
              donor: 'Pret Cafe - Midtown',
              servings: 45,
              distance: '2.5 km away',
              score: '94% Match',
              deadline: 'Pickup by 8:00 PM',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-900">{item.food}</h4>
                  <Badge variant="success" size="sm">{item.score}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800">{item.donor}</span>
                  <span>•</span>
                  <span>{item.servings} servings</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-stone-500">
                    <MapPin className="w-3.5 h-3.5" /> {item.distance}
                  </span>
                  <span>•</span>
                  <span className="text-terracotta-600 font-semibold">{item.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Request Food
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

