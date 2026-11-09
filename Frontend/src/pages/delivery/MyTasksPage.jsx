import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ROUTES } from '../../constants/routes.js';

export function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [cancelModalTask, setCancelModalTask] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useToast();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await deliveryService.getMyTasks();
      const allTasks = res?.data || [];
      // Focus on active ones
      setTasks(allTasks.filter((t) => t.status === 'accepted' || t.status === 'in_transit'));
    } catch (err) {
      error(err.message || 'Failed to load your assigned rescue tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCancelAssignment = async () => {
    if (!cancelModalTask) return;
    try {
      setCancelling(true);
      await deliveryService.cancelTask(cancelModalTask._id, cancelReason);
      success('Mission released back to the dispatch pool.', 'Task Cancelled');
      setCancelModalTask(null);
      setCancelReason('');
      loadTasks();
    } catch (err) {
      error(err.message || 'Could not cancel assignment.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (tab === 'pickup') return t.status === 'accepted';
    if (tab === 'transit') return t.status === 'in_transit';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <Truck className="w-3.5 h-3.5" /> Active Deployments
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            My Rescue Assignments
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Follow sequential pickup and dropoff protocols to complete active missions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.DELIVERY_AVAILABLE}>
            <Button size="sm" variant="outline" className="text-xs">
              Find More Missions
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={loadTasks} className="text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-200 gap-2">
        <button
          onClick={() => setTab('all')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'all'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          All Active ({tasks.length})
        </button>
        <button
          onClick={() => setTab('pickup')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'pickup'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Pending Pickup ({tasks.filter((t) => t.status === 'accepted').length})
        </button>
        <button
          onClick={() => setTab('transit')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            tab === 'transit'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          In Transit ({tasks.filter((t) => t.status === 'in_transit').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading active rescue missions...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Assignments In This State</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            You currently have no active missions matching this filter. Browse open surplus batches to claim a new delivery.
          </p>
          <Link to={ROUTES.DELIVERY_AVAILABLE}>
            <Button size="sm">Browse Available Rescues</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isPickupPending = task.status === 'accepted';
            const isInTransit = task.status === 'in_transit';

            return (
              <div
                key={task._id}
                className="bg-white rounded-3xl p-6 border border-cream-200 shadow-xs hover:border-forest-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">
                      MISSION #{task._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant={isInTransit ? 'warning' : 'primary'}>
                      {isInTransit ? 'In Transit to NGO' : 'Step 1: Pending Pickup'}
                    </Badge>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-semibold text-stone-600">
                      Accepted: {new Date(task.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-stone-900">
                      {task.donation?.foodName || 'Food Rescue Batch'}
                    </h2>
                    <p className="text-xs text-stone-600">
                      Quantity: <strong className="text-forest-800">{task.donation?.quantity} {task.donation?.unit}</strong> | Category: <span className="capitalize">{task.donation?.category?.replace('_', ' ')}</span>
                    </p>
                  </div>

                  {/* Route points */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs bg-cream-50/60 p-3 rounded-2xl border border-cream-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block mb-0.5">
                        📍 1. Pickup Origin
                      </span>
                      <p className="font-semibold text-stone-900">
                        {task.pickupAddress?.street || task.pickupAddress?.city || 'Donor Address'}
                      </p>
                      <p className="text-stone-500">
                        {task.pickupAddress?.city}, {task.pickupAddress?.state} {task.pickupAddress?.zipCode}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-0.5">
                        🏁 2. Destination Shelter
                      </span>
                      <p className="font-semibold text-stone-900">
                        {task.deliveryAddress?.street || task.deliveryAddress?.city || 'NGO Address'}
                      </p>
                      <p className="text-stone-500">
                        {task.deliveryAddress?.city}, {task.deliveryAddress?.state} {task.deliveryAddress?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions & Next Step */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-48">
                  <Link to={`/delivery/tasks/${task._id}`} className="w-full">
                    <Button variant="primary" size="sm" className="w-full text-xs gap-1.5">
                      Open Dispatch Controls <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  {isPickupPending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setCancelModalTask(task)}
                    >
                      Release Assignment
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel/Release Modal */}
      <Modal
        isOpen={Boolean(cancelModalTask)}
        onClose={() => !cancelling && setCancelModalTask(null)}
        title="Release Rescue Assignment"
      >
        {cancelModalTask && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Are you sure you need to release this task?
              </p>
              <p>
                This mission will be returned to the open dispatch board immediately so another courier volunteer can rescue this perishable food before its pickup deadline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Vehicle breakdown, unexpected delay, urgent emergency..."
                className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-red-500 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelModalTask(null)}
                disabled={cancelling}
              >
                Keep Mission
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelAssignment}
                loading={cancelling}
              >
                Release Mission
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default MyTasksPage;
