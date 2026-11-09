import React, { useEffect, useState } from 'react';
import { Compass, Search, Filter, Truck, CheckCircle2, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { error } = useToast();

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAssignments();
      setAssignments(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load dispatch assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filtered = assignments.filter((a) => {
    const term = search.toLowerCase();
    const food = (a.donation?.foodName || '').toLowerCase();
    const courier = (a.deliveryPartner?.name || '').toLowerCase();
    const matchesSearch = food.includes(term) || courier.includes(term);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200 mb-2">
            <Compass className="w-3.5 h-3.5" /> Dispatch Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Delivery Assignments & Dispatches
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Track real-time volunteer courier missions from pickup to NGO receipt.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadAssignments} className="text-xs self-start">
          Refresh Dispatches
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by food or volunteer courier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-forest-600 bg-white"
          >
            <option value="all">All Dispatch States</option>
            <option value="pending">Unassigned (Pending Claim)</option>
            <option value="accepted">Accepted (Pending Pickup)</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Retrieving dispatches...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Assignments Found</h3>
          <p className="text-xs text-stone-500 mt-1">No dispatch tasks match your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task ID</th>
                  <th className="py-3.5 px-4">Rescued Food</th>
                  <th className="py-3.5 px-4">Volunteer Courier</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Date Dispatched</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                      #{a._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{a.donation?.foodName || 'Food Rescue'}</p>
                      <p className="text-[11px] text-forest-800 font-semibold">
                        {a.donation?.quantity} {a.donation?.unit}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {a.deliveryPartner ? (
                        <p className="font-semibold text-stone-800">{a.deliveryPartner.name}</p>
                      ) : (
                        <span className="text-stone-400 italic">Unassigned (Open)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <span className="truncate block max-w-[200px]">
                        {a.pickupAddress?.city || 'Origin'} → {a.deliveryAddress?.city || 'Destination'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(a.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge
                        variant={
                          a.status === 'completed'
                            ? 'success'
                            : a.status === 'in_transit'
                            ? 'warning'
                            : a.status === 'accepted'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {a.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminAssignmentsPage;
