import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  FileText,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminNgoVerificationPage() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [actionType, setActionType] = useState('verified'); // 'verified' or 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const loadNgos = async () => {
    try {
      setLoading(true);
      const res = await adminService.getNgos();
      setNgos(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load NGO accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgos();
  }, []);

  const handleOpenAction = (ngo, type) => {
    setSelectedNgo(ngo);
    setActionType(type);
    setRejectionReason('');
  };

  const handleConfirmVerification = async () => {
    if (!selectedNgo) return;
    if (actionType === 'rejected' && !rejectionReason.trim()) {
      error('Please provide a reason for rejecting this NGO.');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.verifyNgo(selectedNgo._id, {
        status: actionType,
        rejectionReason: actionType === 'rejected' ? rejectionReason.trim() : '',
      });

      success(
        actionType === 'verified'
          ? `Organization "${selectedNgo.organizationName}" successfully verified.`
          : `Organization "${selectedNgo.organizationName}" application rejected.`,
        'NGO Status Updated'
      );
      setSelectedNgo(null);
      loadNgos();
    } catch (err) {
      error(err.message || 'Could not update verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNgos = ngos.filter((ngo) => {
    const term = search.toLowerCase();
    const name = (ngo.organizationName || ngo.name || '').toLowerCase();
    const email = (ngo.user?.email || ngo.email || '').toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesStatus =
      statusFilter === 'all' || (ngo.verificationStatus || 'pending') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta-50 text-terracotta-800 border border-terracotta-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Identity & Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            NGO Verification & Credentialing
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Audit non-profit registration numbers, food handling licenses, and grant verified status.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadNgos} className="text-xs self-start">
          Refresh Queue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cream-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by organization name or email..."
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
            <option value="all">All Verification States</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading non-profit applications...</p>
        </div>
      ) : filteredNgos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Organizations Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            No NGO profiles match your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Tax ID / Registration</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Daily Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredNgos.map((ngo) => (
                  <tr key={ngo._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900 text-sm">
                        {ngo.organizationName || ngo.name || 'Community Shelter'}
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        {ngo.user?.email || ngo.email || 'account'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 font-mono">
                      {ngo.registrationNumber || ngo.taxId || '501(c)(3) Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {ngo.address?.city || 'Local Area'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {ngo.capacity?.dailyMeals ? `${ngo.capacity.dailyMeals} meals/day` : 'Standard'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          ngo.verificationStatus === 'verified'
                            ? 'success'
                            : ngo.verificationStatus === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {ngo.verificationStatus || 'pending'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {ngo.verificationStatus !== 'verified' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => handleOpenAction(ngo, 'verified')}
                        >
                          Approve
                        </Button>
                      )}
                      {ngo.verificationStatus !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleOpenAction(ngo, 'rejected')}
                        >
                          Reject
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedNgo)}
        onClose={() => !submitting && setSelectedNgo(null)}
        title={
          actionType === 'verified'
            ? 'Approve & Verify Organization'
            : 'Reject Organization Application'
        }
      >
        {selectedNgo && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Organization:{' '}
              <strong className="text-stone-900">{selectedNgo.organizationName}</strong>
            </p>

            {actionType === 'verified' ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Confirm Verification
                </p>
                <p className="mt-1">
                  This will grant the organization verified status, allowing them to browse and request all surplus food categories on the platform.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900">
                  <p className="font-semibold">Rejecting this NGO application</p>
                  <p className="mt-0.5">
                    Please specify why verification failed so the organization can re-submit valid credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Invalid EIN number, missing food safety handling certification, unregistered location..."
                    className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-red-500 min-h-[80px]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-cream-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNgo(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'verified' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleConfirmVerification}
                loading={submitting}
              >
                {actionType === 'verified' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AdminNgoVerificationPage;
