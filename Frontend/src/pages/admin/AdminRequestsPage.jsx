import React, { useEffect, useState } from 'react';
import { HandHeart, Search, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { error } = useToast();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRequests();
      setRequests(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load NGO rescue requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const term = search.toLowerCase();
    const food = (r.donation?.foodName || '').toLowerCase();
    const ngo = (r.ngo?.organizationName || r.ngo?.name || '').toLowerCase();
    const matchesSearch = food.includes(term) || ngo.includes(term);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <HandHeart className="w-3.5 h-3.5" /> NGO Surplus Requests
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Rescue Requests Master Ledger
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Audit non-profit claims on donor food supplies and fulfillment matching statuses.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadRequests} className="text-xs self-start">
          Refresh Requests
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by food or NGO..."
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
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Donor Approval</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <HandHeart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Requests Found</h3>
          <p className="text-xs text-stone-500 mt-1">No claims match the filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Requested Food</th>
                  <th className="py-3.5 px-4">Requesting NGO</th>
                  <th className="py-3.5 px-4">Qty Claimed</th>
                  <th className="py-3.5 px-4">Transport Mode</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {r.donation?.foodName || 'Food Surplus'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {r.ngo?.organizationName || r.ngo?.name || 'NGO Center'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-forest-800">
                      {r.requestedQuantity} {r.donation?.unit || 'units'}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-stone-600">
                      {r.deliveryPreference?.replace('_', ' ') || 'Volunteer Courier'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(r.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge
                        variant={
                          r.status === 'fulfilled' || r.status === 'approved'
                            ? 'success'
                            : r.status === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {r.status}
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
export default AdminRequestsPage;
