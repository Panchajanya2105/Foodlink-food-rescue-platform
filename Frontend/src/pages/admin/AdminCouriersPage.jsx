import React, { useEffect, useState } from 'react';
import { Truck, Search, Filter, Ban, CheckCircle2, Thermometer, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminCouriersPage() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadCouriers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCouriers();
      setCouriers(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load volunteer couriers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const isCurrentlyActive = selectedUser.accountStatus === 'active';
    const nextStatus = isCurrentlyActive ? 'suspended' : 'active';

    try {
      setSubmitting(true);
      await adminService.updateUserStatus(selectedUser._id, {
        accountStatus: nextStatus,
        reason: isCurrentlyActive ? 'Courier suspended by administrator' : 'Courier reactivated by admin',
      });
      success(`Courier ${selectedUser.name} is now ${nextStatus}.`, 'Status Updated');
      setSelectedUser(null);
      loadCouriers();
    } catch (err) {
      error(err.message || 'Failed to update courier status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCouriers = couriers.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === 'all' || (c.accountStatus || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <Truck className="w-3.5 h-3.5" /> Fleet & Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Volunteer Courier Management
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Monitor registered rescue drivers, vehicle types, insulated equipment, and account access.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadCouriers} className="text-xs self-start">
          Refresh List
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search couriers by name or email..."
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading couriers...</p>
        </div>
      ) : filteredCouriers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Volunteer Couriers Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            No couriers match the current search filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Courier Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Vehicle Type</th>
                  <th className="py-3.5 px-4">Thermal Bag</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredCouriers.map((courier) => (
                  <tr key={courier._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {courier.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">
                      {courier.email}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-stone-700">
                      {courier.deliveryProfile?.vehicleType?.replace('_', ' ') || 'Car / Bike'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Thermometer className="w-3.5 h-3.5" /> Equipped
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={courier.accountStatus === 'active' ? 'success' : 'danger'}>
                        {courier.accountStatus || 'active'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={courier.accountStatus === 'active' ? 'outline' : 'primary'}
                        size="sm"
                        className={`text-xs ${
                          courier.accountStatus === 'active'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : ''
                        }`}
                        onClick={() => setSelectedUser(courier)}
                      >
                        {courier.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => !submitting && setSelectedUser(null)}
        title={
          selectedUser?.accountStatus === 'active'
            ? 'Suspend Volunteer Courier'
            : 'Reactivate Volunteer Courier'
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Confirm status modification for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>
            {selectedUser.accountStatus === 'active' ? (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                Suspended couriers cannot claim or accept new food rescue tasks.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                Reactivating restores their ability to accept dispatch requests immediately.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant={selectedUser.accountStatus === 'active' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleToggleStatus}
                loading={submitting}
              >
                {selectedUser.accountStatus === 'active' ? 'Confirm Suspension' : 'Confirm Activation'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AdminCouriersPage;
