import React from 'react';
import { ShieldCheck, Users, CheckCircle, XCircle, AlertTriangle, Building, FileCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="neutral" size="sm" className="bg-white/20 text-white border-white/20 mb-2">
            Master Console
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Foodlink Administrator Management
          </h2>
          <p className="text-xs sm:text-sm text-cream-100/90 mt-1 max-w-xl">
            Audit organization licenses, review NGO tax-exempt registrations, inspect food safety logs, and oversee network compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" size="md" dot>All Subsystems Operational</Badge>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Pending Verifications</span>
          <span className="text-3xl font-extrabold text-amber-600 mt-1 block">4 NGOs</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Require doc verification</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Network Users</span>
          <span className="text-3xl font-extrabold text-stone-900 mt-1 block">1,820</span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">+14% this quarter</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Active Rescue Operations</span>
          <span className="text-3xl font-extrabold text-forest-700 mt-1 block">28</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Live across city zones</span>
        </Card>

        <Card className="bg-white border-cream-200 p-5">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Safety Audit Score</span>
          <span className="text-3xl font-extrabold text-purple-700 mt-1 block">99.4%</span>
          <span className="text-xs text-stone-500 font-medium mt-1 block">Based on checklist logs</span>
        </Card>
      </div>

      {/* NGO Verification Queue Preview */}
      <Card className="border-cream-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Organization Verification Queue</CardTitle>
            <CardDescription>Verify legal registration and kitchen safety credentials before granting matching privileges</CardDescription>
          </div>
          <Badge variant="warning" size="sm">4 Pending Review</Badge>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'VET-801',
              name: 'Sunrise Community Meals',
              type: 'NGO / Soup Kitchen',
              regId: '501(c)(3) #849-2910',
              submitted: '2 hours ago',
              city: 'Metro North',
            },
            {
              id: 'VET-802',
              name: 'Artisan Bakery Co-op',
              type: 'Commercial Food Donor',
              regId: 'Food Safety Cert #FS-4491',
              submitted: '5 hours ago',
              city: 'Downtown District',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-stone-400">{item.id}</span>
                  <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                  <Badge variant="neutral" size="sm">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span>{item.regId}</span>
                  <span>•</span>
                  <span>{item.city}</span>
                  <span>•</span>
                  <span>Submitted {item.submitted}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" icon={XCircle}>
                  Reject
                </Button>
                <Button variant="primary" size="sm" icon={CheckCircle}>
                  Approve Partner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

