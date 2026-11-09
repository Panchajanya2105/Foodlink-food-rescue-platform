import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Phone,
  User,
  Building2,
  ArrowLeft,
  Info,
  Calendar,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { MapComponent } from '../../components/ui/MapComponent.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ROUTES } from '../../constants/routes.js';

export function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pickup Form state
  const [pickupTemp, setPickupTemp] = useState('');
  const [pickupSeal, setPickupSeal] = useState(false);
  const [donorSignoff, setDonorSignoff] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');

  // Delivery Form state
  const [deliveryTemp, setDeliveryTemp] = useState('');
  const [deliveryPackaging, setDeliveryPackaging] = useState(false);
  const [ngoReceiver, setNgoReceiver] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getTaskById(id);
      setTask(data);
    } catch (err) {
      error(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleClaim = async () => {
    try {
      setSubmitting(true);
      const updated = await deliveryService.claimTask(id);
      setTask(updated);
      success('Mission accepted. Please proceed to the donor pickup location.', 'Accepted!');
    } catch (err) {
      error(err.message || 'Could not claim task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPickup = async (e) => {
    e.preventDefault();
    if (!pickupSeal) {
      error('You must verify that food packaging and safety seal are intact.');
      return;
    }
    if (!donorSignoff.trim()) {
      error('Please provide the donor representative name for sign-off.');
      return;
    }
    try {
      setSubmitting(true);
      const updated = await deliveryService.confirmPickup(id, {
        temperatureCelsius: pickupTemp ? parseFloat(pickupTemp) : undefined,
        sealIntact: true,
        donorSignoffName: donorSignoff.trim(),
        notes: pickupNotes,
      });
      setTask(updated);
      success('Food pickup confirmed! Status updated to In Transit.', 'Pickup Complete');
    } catch (err) {
      error(err.message || 'Failed to confirm pickup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryPackaging) {
      error('You must verify that packaging remained intact upon drop-off.');
      return;
    }
    if (!ngoReceiver.trim()) {
      error('Please provide the NGO receiver staff/volunteer name.');
      return;
    }
    try {
      setSubmitting(true);
      const updated = await deliveryService.confirmDelivery(id, {
        temperatureCelsius: deliveryTemp ? parseFloat(deliveryTemp) : undefined,
        packagingIntact: true,
        ngoReceiverName: ngoReceiver.trim(),
        notes: deliveryNotes,
      });
      setTask(updated);
      success('Rescue mission successfully completed! The food is safe.', 'Mission Accomplished');
    } catch (err) {
      error(err.message || 'Failed to complete delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      await deliveryService.cancelTask(id, cancelReason);
      success('Mission has been cancelled and returned to the open board.', 'Cancelled');
      setCancelModalOpen(false);
      navigate(ROUTES.DELIVERY_TASKS);
    } catch (err) {
      error(err.message || 'Could not cancel assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-stone-500">Loading mission coordinates...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600">Assignment not found.</p>
        <Link to={ROUTES.DELIVERY_TASKS} className="mt-3 inline-block">
          <Button size="sm">Return to My Tasks</Button>
        </Link>
      </div>
    );
  }

  const isClaimedByMe = task.deliveryPartner?._id === user?._id || task.deliveryPartner === user?._id;
  const isPending = task.status === 'pending';
  const isAccepted = task.status === 'accepted';
  const isInTransit = task.status === 'in_transit';
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';

  const pickupCoords = task.pickupAddress?.coordinates || [-73.9851, 40.7488];
  const deliveryCoords = task.deliveryAddress?.coordinates || [-73.9712, 40.7831];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.DELIVERY_TASKS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Assignments
        </Link>
        <span className="text-xs font-mono font-bold text-stone-400">
          DISPATCH #{task._id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Main Header & Stage Indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={
                  isCompleted ? 'success' : isInTransit ? 'warning' : isAccepted ? 'primary' : 'neutral'
                }
              >
                {isCompleted
                  ? 'Mission Completed'
                  : isInTransit
                  ? 'In Transit'
                  : isAccepted
                  ? 'Accepted • Ready for Pickup'
                  : isCancelled
                  ? 'Cancelled'
                  : 'Open Assignment'}
              </Badge>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-semibold text-stone-500">
                Created: {new Date(task.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {task.donation?.foodName || 'Surplus Rescue Batch'}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Quantity: <strong className="text-forest-800">{task.donation?.quantity} {task.donation?.unit}</strong> • Category: <span className="capitalize">{task.donation?.category?.replace('_', ' ')}</span>
            </p>
          </div>

          {isAccepted && isClaimedByMe && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs self-start"
              onClick={() => setCancelModalOpen(true)}
            >
              Release Mission
            </Button>
          )}

          {isPending && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleClaim}
              loading={submitting}
              className="gap-2 self-start"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept & Claim Mission
            </Button>
          )}
        </div>

        {/* 4-Stage Step Bar */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-cream-200 text-xs">
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-forest-600" />
            <p className="font-bold text-forest-800">1. Assigned</p>
          </div>
          <div className="space-y-1">
            <div
              className={`h-1.5 rounded-full ${
                isInTransit || isCompleted ? 'bg-forest-600' : isAccepted ? 'bg-forest-300' : 'bg-stone-200'
              }`}
            />
            <p className={`font-bold ${isAccepted ? 'text-forest-800' : 'text-stone-500'}`}>
              2. Pickup
            </p>
          </div>
          <div className="space-y-1">
            <div
              className={`h-1.5 rounded-full ${
                isCompleted ? 'bg-forest-600' : isInTransit ? 'bg-forest-600' : 'bg-stone-200'
              }`}
            />
            <p className={`font-bold ${isInTransit ? 'text-forest-800' : 'text-stone-500'}`}>
              3. In Transit
            </p>
          </div>
          <div className="space-y-1">
            <div
              className={`h-1.5 rounded-full ${isCompleted ? 'bg-forest-600' : 'bg-stone-200'}`}
            />
            <p className={`font-bold ${isCompleted ? 'text-forest-800' : 'text-stone-500'}`}>
              4. Completed
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Route Map */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700" />
            Interactive Route & Transit Map (Leaflet / OpenStreetMap)
          </h2>
          <span className="text-xs text-stone-500">
            Real-time OSRM route estimation with fallback
          </span>
        </div>

        <MapComponent
          pickupCoords={pickupCoords}
          destinationCoords={deliveryCoords}
          pickupLabel="P"
          destinationLabel="D"
          pickupAddress={`${task.pickupAddress?.street || ''}, ${task.pickupAddress?.city || ''}`}
          destinationAddress={`${task.deliveryAddress?.street || ''}, ${task.deliveryAddress?.city || ''}`}
          height="380px"
        />
      </div>

      {/* Dispatch Logistics & Food Specs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Origin / Donor Info */}
        <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-forest-800 font-bold text-sm">
            <div className="w-3 h-3 rounded-full bg-forest-600" />
            <h3>Pickup Location (Donor)</h3>
          </div>

          <div className="space-y-2 text-xs text-stone-700 bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <p className="font-bold text-sm text-stone-900">
              {task.pickupAddress?.street || 'Donor Facility Address'}
            </p>
            <p className="text-stone-600">
              {task.pickupAddress?.city}, {task.pickupAddress?.state} {task.pickupAddress?.zipCode}
            </p>
            {task.pickupAddress?.contactPhone && (
              <p className="flex items-center gap-2 text-forest-800 font-semibold pt-1">
                <Phone className="w-3.5 h-3.5" /> {task.pickupAddress.contactPhone}
              </p>
            )}
            {task.pickupAddress?.pickupInstructions && (
              <div className="pt-2 text-stone-600 border-t border-cream-200">
                <span className="font-semibold block text-stone-800">Instructions:</span>
                {task.pickupAddress.pickupInstructions}
              </div>
            )}
          </div>

          <div className="text-xs text-stone-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pickup Deadline:{' '}
              <strong className="text-stone-800">
                {task.donation?.pickupDeadline
                  ? new Date(task.donation.pickupDeadline).toLocaleString()
                  : 'Prompt'}
              </strong>
            </p>
          </div>
        </div>

        {/* Destination / NGO Info */}
        <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <div className="w-3 h-3 rounded-full bg-sky-600" />
            <h3>Dropoff Destination (NGO Shelter)</h3>
          </div>

          <div className="space-y-2 text-xs text-stone-700 bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <p className="font-bold text-sm text-stone-900">
              {task.deliveryAddress?.street || 'NGO Receiving Hub'}
            </p>
            <p className="text-stone-600">
              {task.deliveryAddress?.city}, {task.deliveryAddress?.state} {task.deliveryAddress?.zipCode}
            </p>
            {task.deliveryAddress?.contactPhone && (
              <p className="flex items-center gap-2 text-sky-800 font-semibold pt-1">
                <Phone className="w-3.5 h-3.5" /> {task.deliveryAddress.contactPhone}
              </p>
            )}
            {task.deliveryAddress?.dropoffInstructions && (
              <div className="pt-2 text-stone-600 border-t border-cream-200">
                <span className="font-semibold block text-stone-800">Receiving Instructions:</span>
                {task.deliveryAddress.dropoffInstructions}
              </div>
            )}
          </div>

          <div className="text-xs text-stone-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Handling: <strong className="text-stone-800">{task.donation?.storageRequirements || 'Room Temp'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ACTION STAGE 1: Confirm Pickup */}
      {isAccepted && isClaimedByMe && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-forest-500 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-forest-800">
            <FileCheck2 className="w-5 h-5 text-forest-700" />
            <h2 className="text-lg font-bold">Step 1: Confirm Food Pickup at Origin</h2>
          </div>
          <p className="text-xs text-stone-600">
            Arrived at the donor location? Inspect the food, verify the security seal, record temperature, and obtain the donor staff signature/name to transition the batch into transit.
          </p>

          <form onSubmit={handleConfirmPickup} className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Food Temperature (°C at pickup)
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.5 or 65.0"
                    value={pickupTemp}
                    onChange={(e) => setPickupTemp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Donor Sign-off Representative Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (Chef / Mgr)"
                    value={donorSignoff}
                    onChange={(e) => setDonorSignoff(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 font-semibold">
                <input
                  type="checkbox"
                  required
                  checked={pickupSeal}
                  onChange={(e) => setPickupSeal(e.target.checked)}
                  className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                />
                <span>
                  I certify that the food packaging is intact, properly sealed, and meets Foodlink food safety transport guidelines.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pickup Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Stored in insulated thermal box, clean condition..."
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="gap-2 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Pickup & Start Transit
            </Button>
          </form>
        </div>
      )}

      {/* ACTION STAGE 2: Confirm Delivery */}
      {isInTransit && isClaimedByMe && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-500 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sky-800">
            <CheckCircle2 className="w-5 h-5 text-sky-700" />
            <h2 className="text-lg font-bold">Step 2: Confirm NGO Delivery Receipt</h2>
          </div>
          <p className="text-xs text-stone-600">
            Arrived at the NGO center? Hand over the batch, verify temperature, and obtain the recipient signature/name to complete the rescue mission.
          </p>

          <form onSubmit={handleConfirmDelivery} className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Food Temperature (°C at delivery)
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.0 or 63.5"
                    value={deliveryTemp}
                    onChange={(e) => setDeliveryTemp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  NGO Receiving Staff Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Vance (Kitchen Coordinator)"
                    value={ngoReceiver}
                    onChange={(e) => setNgoReceiver(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 font-semibold">
                <input
                  type="checkbox"
                  required
                  checked={deliveryPackaging}
                  onChange={(e) => setDeliveryPackaging(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>
                  The NGO receiving staff has inspected the items, confirmed good condition, and accepted full receipt.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dropoff Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Placed directly in walk-in cooler..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-sky-600"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="gap-2 text-xs bg-sky-700 hover:bg-sky-800"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm NGO Receipt & Complete Mission
            </Button>
          </form>
        </div>
      )}

      {/* COMPLETED BANNER */}
      {isCompleted && (
        <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950">
                Rescue Mission Verified & Delivered!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Delivered at {task.deliveredAt ? new Date(task.deliveredAt).toLocaleTimeString() : 'Recorded'} • Received by: <strong>{task.proofOfDelivery?.ngoReceiverName || 'NGO Representative'}</strong>
              </p>
              {task.proofOfDelivery?.temperatureCelsius !== undefined && (
                <p className="text-xs text-emerald-700 mt-0.5">
                  Drop-off temp: {task.proofOfDelivery.temperatureCelsius}°C (Verified in safe thermal zone)
                </p>
              )}
            </div>
          </div>

          <Link to={ROUTES.DELIVERY_HISTORY}>
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-900 text-xs">
              View In Delivery History
            </Button>
          </Link>
        </div>
      )}

      {/* Cancel Assignment Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !submitting && setCancelModalOpen(false)}
        title="Release Mission to Dispatch Pool"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800">
            <p className="font-bold">Are you sure you want to release this task?</p>
            <p className="mt-1">
              The assignment will be unlocked immediately for another volunteer courier to claim.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Cancellation reason:
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Traffic emergency, mechanical problem..."
              className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-red-500 min-h-[70px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              loading={submitting}
            >
              Confirm Release
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default TaskDetailPage;
