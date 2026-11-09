import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building2,
  Truck,
  Boxes,
  HandHeart,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  BarChart3,
  Compass,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOverview();
      setData(res);
    } catch (err) {
      error(err.message || 'Failed to load administrator overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-stone-500">Loading system telemetry & audits...</p>
      </div>
    );
  }

  const counts = data?.counts || {
    donors: 0,
    ngos: 0,
    couriers: 0,
    donations: 0,
    requests: 0,
    assignments: 0,
    pendingNgos: 0,
  };

  const impact = data?.impact || {
    totalMealsRescued: 0,
    totalCo2SavedKg: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
              <ShieldAlert className="w-3.5 h-3.5" /> Administrative Master Console
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> System Healthy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Foodlink Platform Operations
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Centralized monitoring of donor surpluses, NGO verification workflows, courier dispatches, and food safety standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.ADMIN_ANALYTICS}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Platform Analytics
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={loadOverview} className="text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending NGO Alert Banner (if any) */}
      {counts.pendingNgos > 0 && (
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {counts.pendingNgos} Organization{counts.pendingNgos > 1 ? 's' : ''} Awaiting Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Unverified NGOs cannot request restricted donations until tax ID and capacity documents are verified.
              </p>
            </div>
          </div>
          <Link to={ROUTES.ADMIN_VERIFICATIONS}>
            <Button size="sm" variant="primary" className="text-xs gap-1.5 whitespace-nowrap bg-amber-700 hover:bg-amber-800">
              Review NGO Submissions <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Donors</span>
            <Users className="w-4 h-4 text-forest-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{counts.donors}</p>
          <Link to={ROUTES.ADMIN_DONORS} className="text-[11px] font-semibold text-forest-700 hover:underline mt-1 block">
            Manage donors →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified NGOs</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{counts.ngos}</p>
          <Link to={ROUTES.ADMIN_VERIFICATIONS} className="text-[11px] font-semibold text-sky-700 hover:underline mt-1 block">
            Review verifications ({counts.pendingNgos} pending) →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Couriers</span>
            <Truck className="w-4 h-4 text-terracotta-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{counts.couriers}</p>
          <Link to={ROUTES.ADMIN_COURIERS} className="text-[11px] font-semibold text-terracotta-700 hover:underline mt-1 block">
            View courier fleet →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Donations</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{counts.donations}</p>
          <Link to={ROUTES.ADMIN_DONATIONS} className="text-[11px] font-semibold text-emerald-700 hover:underline mt-1 block">
            Surplus inventory →
          </Link>
        </div>
      </div>

      {/* Aggregate Impact Counters */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-forest-800 to-forest-950 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-200">
              Community Food Rescue
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">
              {impact.totalMealsRescued.toLocaleString()}
            </h2>
            <p className="text-xs text-forest-200 mt-1">
              Nutritious meals diverted from waste to hunger relief
            </p>
          </div>
          <Sparkles className="w-12 h-12 text-forest-300 opacity-80" />
        </div>

        <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Environmental Conservation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">
              {impact.totalCo2SavedKg.toFixed(1)} kg
            </h2>
            <p className="text-xs text-emerald-200 mt-1">
              Estimated greenhouse emissions prevented
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-300 opacity-80" />
        </div>
      </div>

      {/* Operations Quick Access Modules */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Platform Management Modules</h2>
          <p className="text-xs text-stone-500">Direct shortcuts to administrative workflows</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={ROUTES.ADMIN_VERIFICATIONS}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-terracotta-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">NGO Verification Hub</h3>
              <p className="text-xs text-stone-500 mt-1">
                Validate EIN, registration docs, food handling permits, and assign official badges.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.ADMIN_DONATIONS}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <Boxes className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Donation Oversight</h3>
              <p className="text-xs text-stone-500 mt-1">
                Audit live batches, public discovery status, expiration deadlines, and donor listings.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.ADMIN_ASSIGNMENTS}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <Compass className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Dispatch & Transit Log</h3>
              <p className="text-xs text-stone-500 mt-1">
                Real-time assignment stages, courier assignments, and NGO proof of delivery.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.ADMIN_FOOD_SAFETY}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <FileCheck2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Food Safety Audits</h3>
              <p className="text-xs text-stone-500 mt-1">
                Inspect donor safety checklists, storage logs, and transit temperature compliance.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.ADMIN_DONORS}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <Users className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Account Governance</h3>
              <p className="text-xs text-stone-500 mt-1">
                Moderate user statuses, handle account suspensions, and reactivations.
              </p>
            </div>
          </Link>

          <Link
            to={ROUTES.ADMIN_FEEDBACK}
            className="p-5 rounded-2xl border border-cream-200 hover:border-forest-300 hover:bg-cream-50/50 transition-all flex items-start gap-3"
          >
            <HandHeart className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Feedback Moderation</h3>
              <p className="text-xs text-stone-500 mt-1">
                Review community ratings, flags, and remove offensive or spam testimonials.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboardPage;
