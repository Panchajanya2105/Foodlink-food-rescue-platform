import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Power,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { deliveryService } from '../../services/deliveryService.js';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, myTasksRes, availableRes] = await Promise.all([
        deliveryService.getCourierAnalytics().catch(() => null),
        deliveryService.getMyTasks({ limit: 5 }),
        deliveryService.getAvailableTasks({ limit: 4 }),
      ]);

      setAnalytics(analyticsData || {
        activeCount: 0,
        completedCount: 0,
        totalDistanceKm: 0,
        mealsRescued: 0,
        co2SavedKg: 0,
      });

      const tasks = myTasksRes?.data || [];
      setActiveTasks(tasks.filter((t) => t.status === 'accepted' || t.status === 'in_transit'));
      setAvailableTasks(availableRes?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load delivery dispatch dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      setTogglingStatus(true);
      const nextStatus = !isAvailable;
      await deliveryService.updateDeliveryProfile({ isAvailable: nextStatus });
      setIsAvailable(nextStatus);
      success(
        nextStatus
          ? 'You are now marked Available for food rescue missions.'
          : 'You are now marked Off-Duty. New assignments will not be auto-recommended.',
        'Duty Status Updated'
      );
    } catch (err) {
      error(err.message || 'Could not update duty availability.');
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-stone-500">Loading delivery dispatch overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Duty Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200">
              <Truck className="w-3.5 h-3.5" /> Food Rescue Courier
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-stone-400'}`} />
              {isAvailable ? 'On-Duty • Ready' : 'Off-Duty • Paused'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, {user?.name || 'Courier'}!
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Safely transporting certified food donations from community donors to verified NGOs.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-cream-50 p-4 rounded-2xl border border-cream-200">
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Duty Toggle</p>
            <p className="text-sm font-semibold text-stone-800">
              {isAvailable ? 'Accepting Missions' : 'Standby Mode'}
            </p>
          </div>
          <Button
            variant={isAvailable ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleAvailability}
            loading={togglingStatus}
            className="gap-2"
          >
            <Power className="w-4 h-4" />
            {isAvailable ? 'Go Off-Duty' : 'Go On-Duty'}
          </Button>
        </div>
      </div>

      {/* KPI Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <Truck className="w-4 h-4 text-forest-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{analytics.activeCount || activeTasks.length}</p>
          <p className="text-[11px] text-stone-500 mt-1">Currently in progress</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rescues Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{analytics.completedCount || 0}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Safely dropped off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Distance Covered</span>
            <Compass className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{(analytics.totalDistanceKm || 0).toFixed(1)} km</p>
          <p className="text-[11px] text-stone-500 mt-1">Estimated transit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Meals Rescued</span>
            <Sparkles className="w-4 h-4 text-terracotta-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{analytics.mealsRescued || 0}</p>
          <p className="text-[11px] text-terracotta-700 font-semibold mt-1">Nourished individuals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CO2 Mitigated</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{(analytics.co2SavedKg || 0).toFixed(1)} kg</p>
          <p className="text-[11px] text-stone-500 mt-1">Landfill emissions prevented</p>
        </div>
      </div>

      {/* Active Missions in Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-forest-700" />
              Active Rescue Missions ({activeTasks.length})
            </h2>
            <p className="text-xs text-stone-500">Missions currently accepted or actively in transit by you</p>
          </div>
          <Link to={ROUTES.DELIVERY_TASKS}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {activeTasks.length === 0 ? (
          <div className="text-center py-10 bg-cream-50/60 rounded-2xl border border-dashed border-cream-300">
            <Truck className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No active deliveries underway</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Explore available food surplus missions ready for immediate pickup and rescue.
            </p>
            <Link to={ROUTES.DELIVERY_AVAILABLE}>
              <Button size="sm" className="gap-1.5">
                <Compass className="w-4 h-4" /> Discover Available Tasks
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeTasks.map((task) => (
              <div
                key={task._id}
                className="p-5 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-cream-50 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Task #{task._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant={task.status === 'in_transit' ? 'warning' : 'primary'}>
                      {task.status === 'in_transit' ? 'In Transit to NGO' : 'Accepted • Pending Pickup'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      {task.donation?.foodName || 'Surplus Food Rescue'}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                      {task.donation?.quantity} {task.donation?.unit} • {task.donation?.category || 'Cooked Meals'}
                    </p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-cream-200 text-stone-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-800">Pickup: </span>
                        <span>{task.pickupAddress?.street || task.pickupAddress?.city || 'Donor Location'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-800">Dropoff: </span>
                        <span>{task.deliveryAddress?.street || task.deliveryAddress?.city || 'NGO Shelter'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pickup deadline: {task.donation?.pickupDeadline ? new Date(task.donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                  </span>
                  <Link to={`/delivery/tasks/${task._id}`}>
                    <Button size="sm" variant="primary" className="text-xs gap-1.5">
                      View Dispatch <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Rescue Opportunities */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-terracotta-700" />
              Available Rescue Opportunities ({availableTasks.length})
            </h2>
            <p className="text-xs text-stone-500">Approved NGO requests waiting for a volunteer driver</p>
          </div>
          <Link to={ROUTES.DELIVERY_AVAILABLE}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {availableTasks.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-sm">
            All surplus donations currently have assigned couriers or self-pickup arranged.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableTasks.map((item) => (
              <div
                key={item._id}
                className="bg-cream-50/50 p-4 rounded-2xl border border-cream-200 hover:border-forest-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 mb-2">
                    <span className="bg-white px-2 py-0.5 rounded-full border border-cream-200">
                      {item.donation?.category || 'Prepared Food'}
                    </span>
                    <span className="text-terracotta-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.estimatedDistanceKm ? `${item.estimatedDistanceKm.toFixed(1)} km` : 'Open'}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                    {item.donation?.foodName || 'Food Rescue Batch'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    {item.donation?.quantity} {item.donation?.unit}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-2 truncate">
                    📍 {item.pickupAddress?.city || 'Nearby'} → {item.deliveryAddress?.city || 'NGO'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
                  <Link to={`/delivery/tasks/${item._id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Inspect & Claim
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default DeliveryDashboardPage;
