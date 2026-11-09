import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Boxes,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export function MyRequestsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Withdraw Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const res = await ngoService.getMyRequests(params);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load NGO requests', err);
      toastError('Could not load rescue requests.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedRequest) return;
    try {
      setWithdrawing(true);
      await ngoService.withdrawRequest(selectedRequest._id);
      success('Rescue request withdrawn successfully.', 'Request Withdrawn');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to withdraw request.';
      toastError(msg, 'Withdrawal Failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending Review' },
    { key: 'approved', label: 'Approved Claims' },
    { key: 'rejected', label: 'Declined' },
    { key: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            My Rescue Requests
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Track and manage your submitted food rescue requests. Eligible pending requests may be withdrawn prior to donor allocation.
          </p>
        </div>

        <Link to={ROUTES.NGO_DONATIONS}>
          <Button variant="primary" size="sm">
            <Boxes className="w-4 h-4 mr-2" />
            Browse More Surplus
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-cream-200 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-emerald-800 border-t border-l border-r border-cream-200 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 hover:bg-cream-50/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            Loading your rescue requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HandHeart className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No requests in this category</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Explore available surplus donations or check recommended matches to submit new claims.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-50 text-stone-600 text-xs uppercase tracking-wider border-b border-cream-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Food Item</th>
                  <th className="py-3.5 px-4 font-semibold">Quantity</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Mode</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Decision / Notes</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      <div>
                        {req.donation?.foodName || 'Surplus Food'}
                        <span className="block text-xs font-normal text-stone-500 capitalize">
                          {req.donation?.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-700">
                      <strong>{req.requestedQuantity}</strong> {req.donation?.unit || 'portions'}
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-600 capitalize">
                      {req.deliveryPreference?.replace('_', ' ') || 'Volunteer Courier'}
                    </td>
                    <td className="py-4 px-4">
                      {req.status === 'approved' && <Badge variant="emerald">Approved</Badge>}
                      {req.status === 'pending' && <Badge variant="amber">Under Review</Badge>}
                      {req.status === 'rejected' && <Badge variant="stone">Declined</Badge>}
                      {req.status === 'withdrawn' && <Badge variant="stone">Withdrawn</Badge>}
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-500">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-xs max-w-xs text-stone-600">
                      {req.status === 'approved' && (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved by donor
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="text-stone-500">
                          {req.rejectionReason || 'No reason specified'}
                        </span>
                      )}
                      {req.status === 'withdrawn' && (
                        <span className="text-stone-400 italic">Withdrawn by requester</span>
                      )}
                      {req.status === 'pending' && (
                        <span className="text-amber-700 font-medium">Awaiting donor review</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-stone-600 hover:text-red-700 hover:border-red-300"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" /> Withdraw
                          </Button>
                        )}
                        {req.status === 'approved' && (
                          <Link to={ROUTES.NGO_ACCEPTED}>
                            <Button size="xs" variant="primary">
                              <Truck className="w-3 h-3 mr-1" /> View Rescue
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Confirm Request Withdrawal"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-stone-700 leading-relaxed">
              Are you sure you want to withdraw your request for{' '}
              <strong>"{selectedRequest.donation?.foodName}"</strong> ({selectedRequest.requestedQuantity} portions)?
            </p>
            <p className="text-xs text-stone-500">
              The reserved portions will be released immediately back into the available surplus pool for other nonprofit organizations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                disabled={withdrawing}
              >
                Keep Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

