import React, { useState, useEffect } from 'react';
import {
  HandHeart,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import api from '../../services/api.js';

export function DonorRequestsPage() {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Decision Modal
  const [activeRequest, setActiveRequest] = useState(null);
  const [decisionType, setDecisionType] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      const res = await api.get('/v1/requests', { params });
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.warn('Using fallback requests demo data:', err.message);
      setRequests([
        {
          _id: 'sample-req-1',
          donation: { _id: 'don-1', foodName: 'Artisan Pastry & Bagel Assortment', quantity: 40, unit: 'boxes' },
          ngo: { name: 'Maria Gonzales', organizationName: 'Downtown Hope Community Kitchen' },
          requestedQuantity: 25,
          intakeReason: 'Serving afternoon community tea & snacks for 25 unhoused families',
          beneficiariesCount: 25,
          deliveryPreference: 'volunteer_delivery',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDecision = (req, type) => {
    setActiveRequest(req);
    setDecisionType(type);
    setRejectionReason('');
  };

  const handleConfirmDecision = async () => {
    if (!activeRequest) return;
    setSubmitting(true);
    try {
      await api.patch(`/v1/requests/${activeRequest._id}/decision`, {
        decision: decisionType,
        rejectionReason: decisionType === 'rejected' ? rejectionReason : undefined,
      });

      success(
        `Donation request ${decisionType === 'approved' ? 'approved' : 'rejected'} successfully.`,
        'Decision Recorded'
      );
      setActiveRequest(null);
      fetchRequests();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.donation?.foodName?.toLowerCase().includes(term) ||
      r.ngo?.organizationName?.toLowerCase().includes(term) ||
      r.ngo?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-amber-600" />
            NGO Food Rescue Claims
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Review and approve requests from verified community food banks, shelters, and soup kitchens.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 border border-cream-300 rounded-xl hover:bg-cream-100 text-stone-600 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-cream-200 bg-white space-y-3">
        <Input
          icon={Search}
          placeholder="Search by food name or requesting charity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-cream-200 text-xs">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mr-2">Filter:</span>
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                selectedStatus === tab
                  ? 'bg-forest-700 text-white font-bold'
                  : 'bg-cream-50 text-stone-600 hover:bg-cream-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Loading charity requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center border-cream-200 bg-white space-y-2">
          <HandHeart className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No requests found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            There are currently no NGO requests under the "{selectedStatus}" filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req._id} className="p-5 border-cream-200 bg-white space-y-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Target Listing: {req.donation?.foodName}
                    </span>
                    <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                      {req.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {req.ngo?.organizationName || req.ngo?.name || 'Verified Shelter'}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold text-stone-400 block uppercase">Requested Portions</span>
                  <span className="text-lg font-black text-forest-800">
                    {req.requestedQuantity} {req.donation?.unit || 'portions'}
                  </span>
                </div>
              </div>

              {req.intakeReason && (
                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-stone-600">
                  <strong className="block text-stone-800 mb-0.5">Shelter Intake Reason:</strong>
                  <p className="italic">"{req.intakeReason}"</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cream-200 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Received: {new Date(req.createdAt).toLocaleString()}
                </span>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-200 hover:bg-red-50 text-xs"
                      onClick={() => handleOpenDecision(req, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleOpenDecision(req, 'approved')}
                    >
                      Approve Request
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(activeRequest)}
        onClose={() => setActiveRequest(null)}
        title={decisionType === 'approved' ? 'Approve NGO Claim' : 'Reject NGO Claim'}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            {decisionType === 'approved' ? (
              <>
                Approve claim for <strong>{activeRequest?.requestedQuantity} {activeRequest?.donation?.unit}</strong> from{' '}
                <strong>{activeRequest?.ngo?.organizationName || activeRequest?.ngo?.name}</strong>?
                This will trigger courier dispatch for transit.
              </>
            ) : (
              <>
                Reject claim from <strong>{activeRequest?.ngo?.organizationName || activeRequest?.ngo?.name}</strong>?
                Please supply a brief justification.
              </>
            )}
          </p>

          {decisionType === 'rejected' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Insufficient remaining quantity or operational closure..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
            <Button variant="ghost" size="sm" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button
              variant={decisionType === 'approved' ? 'primary' : 'danger'}
              size="sm"
              disabled={submitting}
              onClick={handleConfirmDecision}
            >
              {submitting ? 'Processing...' : decisionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

