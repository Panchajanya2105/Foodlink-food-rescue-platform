import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Filter,
  Search,
  Thermometer,
  Layers,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AvailableTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await deliveryService.getAvailableTasks();
      setTasks(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to retrieve available rescue tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleClaim = async () => {
    if (!selectedTask) return;
    try {
      setClaiming(true);
      const claimed = await deliveryService.claimTask(selectedTask._id);
      success(
        `Rescue assignment for "${selectedTask.donation?.foodName || 'Donation'}" confirmed.`,
        'Mission Accepted!'
      );
      setSelectedTask(null);
      navigate(`/delivery/tasks/${claimed._id || selectedTask._id}`);
    } catch (err) {
      error(err.message || 'Could not claim task. Another courier may have accepted it.');
      loadTasks();
      setSelectedTask(null);
    } finally {
      setClaiming(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.donation?.foodName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.pickupAddress?.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.deliveryAddress?.city || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      (t.donation?.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta-50 text-terracotta-800 border border-terracotta-200 mb-2">
              <Compass className="w-3.5 h-3.5" /> Open Food Rescue Missions
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Available Dispatch Assignments
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Select and claim urgent food batches ready for immediate courier rescue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadTasks}>
              Refresh Missions
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-6 border-t border-cream-200 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by food name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="cooked_meals">Cooked Meals</option>
              <option value="fresh_produce">Fresh Produce</option>
              <option value="bakery">Bakery & Bread</option>
              <option value="dairy">Dairy Products</option>
              <option value="packaged_goods">Packaged Food</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mission Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Scanning for open rescue requests...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Open Tasks Found</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            There are no unassigned food batches requiring courier delivery right now. Check back shortly as donors post fresh surplus.
          </p>
          <Button variant="outline" size="sm" onClick={loadTasks}>
            Check Again
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-3xl p-6 border border-cream-200 hover:border-forest-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    ID #{task._id.slice(-6).toUpperCase()}
                  </span>
                  <Badge variant="warning">
                    Urgent Pickup
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 line-clamp-1">
                    {task.donation?.foodName || 'Surplus Food Batch'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                    <span className="font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-100">
                      {task.donation?.quantity} {task.donation?.unit}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{task.donation?.category?.replace('_', ' ') || 'Food Item'}</span>
                  </div>
                </div>

                {/* Storage & Temperature Specs */}
                <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 text-xs space-y-1.5 text-stone-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                    <span>Handling: {task.donation?.storageRequirements || 'Room Temperature'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Pickup deadline:{' '}
                      {task.donation?.pickupDeadline
                        ? new Date(task.donation.pickupDeadline).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'ASAP'}
                    </span>
                  </div>
                </div>

                {/* Locations */}
                <div className="text-xs space-y-2 text-stone-600 pt-2 border-t border-cream-200">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900 block">Pickup Location</span>
                      <span className="text-stone-600">
                        {task.pickupAddress?.street || task.pickupAddress?.city || 'Registered Donor Address'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900 block">NGO Destination</span>
                      <span className="text-stone-600">
                        {task.deliveryAddress?.street || task.deliveryAddress?.city || 'Verified NGO Center'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between gap-3">
                <Button
                  variant="primary"
                  className="w-full text-xs"
                  onClick={() => setSelectedTask(task)}
                >
                  Accept & Claim Assignment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => !claiming && setSelectedTask(null)}
        title="Accept Food Rescue Mission"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <p className="font-bold text-sm">
                Rescue: {selectedTask.donation?.foodName} ({selectedTask.donation?.quantity} {selectedTask.donation?.unit})
              </p>
              <p>
                By accepting this mission, you commit to promptly picking up the surplus food and delivering it in safe thermal conditions to the assigned NGO shelter.
              </p>
            </div>

            <div className="text-xs text-stone-600 space-y-2">
              <p className="font-semibold text-stone-800">Courier Responsibilities:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verify food packaging and seal intactness upon pickup.</li>
                <li>Record food temperature (°C) at pickup and dropoff.</li>
                <li>Obtain signoff from both the donor representative and the NGO receiver.</li>
                <li>Transport using insulated bag or thermal container if required.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTask(null)}
                disabled={claiming}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleClaim}
                loading={claiming}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Start Mission
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AvailableTasksPage;
