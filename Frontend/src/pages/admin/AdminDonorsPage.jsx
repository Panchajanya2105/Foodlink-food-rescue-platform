import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, Ban, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminDonorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadDonors = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDonors();
      setDonors(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load donors directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const isCurrentlyActive = selectedUser.accountStatus === 'active';
    const nextStatus = isCurrentlyActive ? 'suspended' : 'active';

    try {
      setSubmitting(true);
      await adminService.updateUserStatus(selectedUser._id, {
        accountStatus: nextStatus,
        reason: isCurrentlyActive ? 'Administrative suspension' : 'Reactivated by admin',
      });
      success(
        `User ${selectedUser.name} is now ${nextStatus}.`,
        'Account Status Updated'
      );
      setSelectedUser(null);
      loadDonors();
    } catch (err) {
      error(err.message || 'Failed to update user status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonors = donors.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (d.name || '').toLowerCase().includes(term) ||
      (d.email || '').toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === 'all' || (d.accountStatus || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <Users className="w-3.5 h-3.5" /> Platform Donors
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Donor Accounts Management
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Review food donors, commercial kitchens, grocery partners, and moderate account access.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadDonors} className="text-xs self-start">
          Refresh List
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search donors by name or email..."
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
          <p className="text-sm font-medium text-stone-500">Loading donor directory...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Donors Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            No donor accounts match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredDonors.map((donor) => (
                  <tr key={donor._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{donor.name}</p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">
                      {donor.email}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {donor.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={donor.accountStatus === 'active' ? 'success' : 'danger'}>
                        {donor.accountStatus || 'active'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(donor.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={donor.accountStatus === 'active' ? 'outline' : 'primary'}
                        size="sm"
                        className={`text-xs ${
                          donor.accountStatus === 'active'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : ''
                        }`}
                        onClick={() => setSelectedUser(donor)}
                      >
                        {donor.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => !submitting && setSelectedUser(null)}
        title={
          selectedUser?.accountStatus === 'active'
            ? 'Suspend Donor Account'
            : 'Reactivate Donor Account'
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Are you sure you want to{' '}
              <strong>{selectedUser.accountStatus === 'active' ? 'suspend' : 'reactivate'}</strong>{' '}
              the donor account for <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            {selectedUser.accountStatus === 'active' ? (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                Suspended donors cannot create new food donations or accept rescue requests.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                Reactivating restores their standard posting and matching permissions immediately.
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
export default AdminDonorsPage;
