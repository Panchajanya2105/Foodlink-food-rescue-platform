import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Navigation, Clock, CheckCircle2, Shield, Thermometer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function DeliveryDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" className="bg-white/20 text-white border-white/20 mb-2">
            Verified Food Rescue Courier
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Courier Console: {user?.name || 'Marcus Vance'}
          </h2>
          <p className="text-xs sm:text-sm text-cream-100/90 mt-1 max-w-xl">
            Active thermal carrier: Insulated Van (Food Grade Certified) • Safe Transit Protocol Active
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" size="md" dot>Available for Missions</Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Assigned Rescue</span>
          <span className="text-3xl font-extrabold text-stone-900 mt-1 block">1 Active</span>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">Pickup in 25 mins</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Completed Deliveries</span>
          <span className="text-3xl font-extrabold text-forest-700 mt-1 block">64</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Zero safety incidents</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Avg Delivery Time</span>
          <span className="text-3xl font-extrabold text-sky-700 mt-1 block">28 mins</span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Well inside 2h limit</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Volunteer Rating</span>
          <span className="text-3xl font-extrabold text-amber-600 mt-1 block">4.9 / 5.0</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">52 partner reviews</span>
        </Card>
      </div>

      {/* Active Mission Card */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Current Assigned Rescue Task</CardTitle>
            <CardDescription>Follow temperature check procedures at pickup and drop-off</CardDescription>
          </div>
          <Badge variant="warning" size="sm">Task #TSK-882</Badge>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="p-3 bg-white rounded-xl border border-cream-200">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Step 1: Pickup Donor</span>
              <p className="text-sm font-bold text-stone-900 mt-1">Heritage Bistro & Cafe</p>
              <p className="text-xs text-stone-500">142 Oak Street • Contact: +1 (555) 234-5678</p>
              <p className="text-xs text-amber-700 font-semibold mt-2">Target Pickup: 18:30 (in 25 min)</p>
            </div>

            {/* Dropoff */}
            <div className="p-3 bg-white rounded-xl border border-cream-200">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Step 2: Shelter Delivery</span>
              <p className="text-sm font-bold text-stone-900 mt-1">Community Care Shelter</p>
              <p className="text-xs text-stone-500">89 Harbor Ave • Shelter Intake Contact: Desk #2</p>
              <p className="text-xs text-emerald-700 font-semibold mt-2">Target Arrival: 19:15</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-stone-600">
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <Thermometer className="w-4 h-4 text-forest-700" /> Hot Insulated Box Req.
              </span>
              <span>•</span>
              <span>Cargo: 40 Warm Meals</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={Navigation}>
                Open GPS Route
              </Button>
              <Button variant="primary" size="sm" icon={CheckCircle2}>
                Confirm Food Pickup
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

