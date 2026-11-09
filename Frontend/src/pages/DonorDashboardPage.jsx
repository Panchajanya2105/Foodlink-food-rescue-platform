import React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Clock, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockWeeklyDonations = [
  { day: 'Mon', meals: 45 },
  { day: 'Tue', meals: 60 },
  { day: 'Wed', meals: 30 },
  { day: 'Thu', meals: 80 },
  { day: 'Fri', meals: 110 },
  { day: 'Sat', meals: 95 },
  { day: 'Sun', meals: 70 },
];

export function DonorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-700 to-forest-800 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="forest" size="sm" className="bg-white/10 text-white border-white/20 mb-2">
            Verified Commercial Donor
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Partner Kitchen'}
          </h2>
          <p className="text-xs sm:text-sm text-cream-100/90 mt-1 max-w-xl">
            Surplus food listed here is instantly analyzed for safety compliance and matched with nearby verified shelters.
          </p>
        </div>
        <Link to={ROUTES.DONOR_NEW_DONATION}>
          <Button variant="warm" size="lg" icon={PackagePlus}>
            Create Food Listing
          </Button>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Active Listings</span>
          <span className="text-3xl font-extrabold text-stone-900 mt-1 block">3 Batches</span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" /> 2 pending pickup
          </span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Meals Donated</span>
          <span className="text-3xl font-extrabold text-forest-700 mt-1 block">1,490</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Across 38 pickups</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Rescue Success Rate</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">98.2%</span>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">Safe transfer rate</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">CO2 Equivalent Saved</span>
          <span className="text-3xl font-extrabold text-terracotta-600 mt-1 block">745 kg</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Landfill diversion</span>
        </Card>
      </div>

      {/* Active Listings Table / Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-cream-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Current Active Listings</CardTitle>
                <CardDescription>Real-time status of surplus food waiting for NGO acceptance or courier pickup</CardDescription>
              </div>
              <Badge variant="warning" size="sm" dot>Live Expiry Engine</Badge>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'DON-104',
                  title: 'Mediterranean Roasted Vegetables & Couscous',
                  quantity: '35 meals (Hot)',
                  deadline: '45 mins remaining',
                  status: 'Courier Assigned',
                  ngo: 'Downtown Shelter',
                  variant: 'warning',
                },
                {
                  id: 'DON-105',
                  title: 'Chilled Fruit Salads & Parfaits',
                  quantity: '20 packs (Chilled <4°C)',
                  deadline: '2.5 hrs remaining',
                  status: 'Matching NGOs',
                  ngo: 'Pending Match',
                  variant: 'info',
                },
                {
                  id: 'DON-106',
                  title: 'Artisan Sourdough Loaves & Focaccia',
                  quantity: '18 loaves (Ambient)',
                  deadline: '4 hrs remaining',
                  status: 'Requested by NGO',
                  ngo: 'St. Jude Youth Center',
                  variant: 'success',
                },
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-400">{item.id}</span>
                      <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>{item.quantity}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">{item.deadline}</span>
                      <span>•</span>
                      <span>NGO: {item.ngo}</span>
                    </div>
                  </div>
                  <Badge variant={item.variant} size="sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-4">
          <Card className="border-cream-200 bg-white h-full flex flex-col">
            <CardTitle>Meals Rescued This Week</CardTitle>
            <CardDescription className="mb-4">Daily quantity of food safely repurposed</CardDescription>
            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyDonations}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4EFEA" />
                  <XAxis dataKey="day" stroke="#A8A29E" fontSize={11} tickLine={false} />
                  <YAxis stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EADFCF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="meals" fill="#1E5E3A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

