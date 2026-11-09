import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function NgoDeliveriesPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await ngoService.getNgoDeliveries();
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Failed to load deliveries', err);
      toastError('Could not load delivery tracking information.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'completed':
        return 4;
      case 'in_transit':
        return 3;
      case 'accepted':
        return 2;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Rescue Delivery Tracking
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Track volunteer couriers, transit cold-chain verification, and arrival schedules for your allocated surplus food.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDeliveries} disabled={loading}>
          Refresh Tracker
        </Button>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading live courier tracking...
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <Truck className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No active delivery dispatches</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When a volunteer courier accepts the transport task for your approved food rescue, live transit updates will appear here.
          </p>
          <Link to={ROUTES.NGO_ACCEPTED} className="inline-block mt-3">
            <Button size="sm" variant="outline">View Accepted Rescues</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const step = getStepProgress(assignment.status);

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Rescue Order #{assignment._id.slice(-6)}
                      </span>
                      <Badge variant="emerald" className="capitalize text-xs font-semibold">
                        {assignment.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">
                      {assignment.donation?.foodName || 'Surplus Food Rescue'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right text-xs text-stone-500">
                    <span>Assigned Courier:</span>
                    <p className="font-semibold text-stone-900 text-sm">
                      {assignment.deliveryPartner?.name || 'Assigned Volunteer'}
                    </p>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className={`p-3 rounded-2xl border ${step >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-cream-50 border-cream-200 text-stone-400'}`}>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${step >= 1 ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>1. Assigned</span>
                    </div>
                    <p className="text-[11px] mt-1 text-stone-600">Volunteer accepted task</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${step >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-cream-50 border-cream-200 text-stone-400'}`}>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${step >= 2 ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>2. Picked Up</span>
                    </div>
                    <p className="text-[11px] mt-1 text-stone-600">Food collected from donor</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${step >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-cream-50 border-cream-200 text-stone-400'}`}>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${step >= 3 ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>3. In Transit</span>
                    </div>
                    <p className="text-[11px] mt-1 text-stone-600">En route to distribution site</p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${step >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-cream-50 border-cream-200 text-stone-400'}`}>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className={`w-4 h-4 ${step >= 4 ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>4. Delivered</span>
                    </div>
                    <p className="text-[11px] mt-1 text-stone-600">Successfully received & signed</p>
                  </div>
                </div>

                {/* Location & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-stone-700">
                  <div className="space-y-1">
                    <span className="text-stone-400 font-medium block">Pickup Origin:</span>
                    <p className="font-semibold text-stone-900">
                      {assignment.pickupLocation?.street || 'Donor Facility'}
                    </p>
                    <p className="text-stone-500">
                      {assignment.pickupLocation?.city}, {assignment.pickupLocation?.postalCode}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 font-medium block">Delivery Destination:</span>
                    <p className="font-semibold text-stone-900">
                      {assignment.destinationLocation?.street || 'Your Community Center'}
                    </p>
                    <p className="text-stone-500">
                      {assignment.destinationLocation?.city}, {assignment.destinationLocation?.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

