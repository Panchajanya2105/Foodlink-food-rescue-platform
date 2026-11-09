import React, { useEffect, useState } from 'react';
import { Boxes, Search, Filter, Clock, Eye, AlertCircle, MapPin } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { error } = useToast();

  const loadDonations = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDonations();
      setDonations(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load platform donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const filteredDonations = donations.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (d.foodName || '').toLowerCase().includes(term) ||
      (d.donor?.name || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <Boxes className="w-3.5 h-3.5" /> Platform Inventory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Surplus Food Batches Central
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Global inventory of surplus donations, matching stages, and safety compliance status.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadDonations} className="text-xs self-start">
          Refresh Inventory
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by food name or donor..."
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
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="requested">Requested</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Scanning donation database...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Boxes className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Donations Found</h3>
          <p className="text-xs text-stone-500 mt-1">No donation records match the filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Food Item</th>
                  <th className="py-3.5 px-4">Donor</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredDonations.map((d) => (
                  <tr key={d._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{d.foodName}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{d.description}</p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {d.donor?.name || 'Registered Donor'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-forest-800">
                      {d.quantity} {d.unit}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-stone-600">
                      {d.category?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {d.pickupDeadline ? new Date(d.pickupDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          d.status === 'delivered'
                            ? 'success'
                            : d.status === 'in_transit' || d.status === 'assigned'
                            ? 'warning'
                            : d.status === 'available'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {d.status}
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
export default AdminDonationsPage;
