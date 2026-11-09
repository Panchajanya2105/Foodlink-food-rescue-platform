import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Thermometer,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  History,
  XCircle,
  Award,
  Scale,
  HandHeart,
  Eye,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useToast } from '../../hooks/useToast.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import api from '../../services/api.js';

export function DonationDetailPage() {
  const { id } = useParams();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/donations/${id}`);
      if (res.data?.data) {
        setData(res.data.data.donation);
        setHistory(res.data.data.history || []);
      }

      // Fetch requests for this donation
      const reqRes = await api.get(`/v1/requests?donationId=${id}`);
      if (reqRes.data?.data) {
        setRequests(reqRes.data.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load donation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/v1/donations/${id}/cancel`, {
        reason: cancelReason || 'Cancelled by donor',
      });
      success('Donation listing cancelled successfully.', 'Listing Updated');
      setShowCancelModal(false);
      fetchDetail();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel listing.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Loading complete audit records...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Donation Not Found</h2>
        <Link to={ROUTES.DONOR_DONATIONS}>
          <Button variant="primary" icon={ArrowLeft}>
            Back to My Donations
          </Button>
        </Link>
      </div>
    );
  }

  const checklist = data.safetyChecklist;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.DONOR_DONATIONS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Donations
        </Link>

        {['available', 'draft'].includes(data.status) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            icon={XCircle}
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Listing
          </Button>
        )}
      </div>

      {/* Main Overview Card */}
      <Card className="p-6 sm:p-10 border-cream-200 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-cream-100 text-stone-700 border border-cream-300">
                {data.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                {data.category?.replace('_', ' ')}
              </span>
              {data.evaluation?.urgency && (
                <Badge
                  variant={
                    data.evaluation.urgency === 'critical' || data.evaluation.urgency === 'expired'
                      ? 'danger'
                      : data.evaluation.urgency === 'urgent'
                      ? 'warning'
                      : 'info'
                  }
                  size="sm"
                >
                  {data.evaluation.urgency?.toUpperCase()}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {data.foodName}
            </h1>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs uppercase font-bold text-stone-400 block">Total Quantity</span>
            <span className="text-3xl font-black text-forest-800">
              {data.quantity} {data.unit}
            </span>
          </div>
        </div>

        {/* Timestamps & Temperature */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cream-50 p-5 rounded-2xl border border-cream-200 text-xs">
          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-600" /> Prepared Time
            </span>
            <span className="font-bold text-stone-800 block text-sm">
              {new Date(data.preparationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
              • {new Date(data.preparationDate).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pickup Deadline
            </span>
            <span className="font-bold text-amber-900 block text-sm">
              {new Date(data.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
              ({data.evaluation?.hoursRemaining ? `${data.evaluation.hoursRemaining}h remaining` : 'Closed'})
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-terracotta-600" /> Storage State
            </span>
            <span className="font-bold text-stone-800 block text-sm capitalize">
              {data.storageRequirement?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Description & Pickup Address */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Description & Handling</h3>
          <p className="text-stone-700 text-sm leading-relaxed">
            {data.description || 'No additional preparation notes recorded.'}
          </p>
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-stone-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
            <span>
              Pickup Location: {data.pickupAddress?.street}, {data.pickupAddress?.city}, {data.pickupAddress?.postalCode}
            </span>
          </div>
        </div>
      </Card>

      {/* Digital Food Safety Certificate */}
      {checklist ? (
        <Card className="p-6 sm:p-8 border-cream-200 bg-white space-y-6">
          <div className="flex items-center justify-between border-b border-cream-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Digital Food Safety Verification Certificate</h2>
                <p className="text-xs text-stone-500">
                  Certified by: <strong className="text-stone-800">{checklist.donorDeclarationName}</strong> on{' '}
                  {new Date(checklist.completedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">Passed All Checks</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50/60 border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Commercial Kitchen Hygiene</strong>
                <span className="text-stone-500">Prepared in authorized licensed food premises.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50/60 border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">No Consumer Buffet Contact</strong>
                <span className="text-stone-500">Held in sealed kitchen reserve without public buffet exposure.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50/60 border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Recorded Packing Temperature</strong>
                <span className="text-stone-500">
                  {checklist.recordedTemperatureCelsius}°C (outside of the 5°C - 60°C danger zone).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50/60 border border-cream-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-800">Sanitized Packaging</strong>
                <span className="text-stone-500">{data.packagingType || 'Sanitized food grade sealed container'}.</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
            <Scale className="w-4 h-4 text-stone-400 shrink-0" />
            <span>
              Recorded under compliance declarations of the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019 (FSSAI) and Karnataka State Health Directives.
            </span>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-amber-200 bg-amber-50 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Food Safety Checklist Pending</span>
          </div>
          <p className="text-xs">
            This donation cannot be claimed by NGOs until the donor safety verification checklist has been submitted.
          </p>
        </Card>
      )}

      {/* Associated NGO Requests */}
      <Card className="p-6 sm:p-8 border-cream-200 bg-white space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-amber-600" />
          NGO Claims for this Item ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2">
            No NGO requests have been submitted for this item yet. Nearby verified partners are being notified.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r._id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">
                    {r.ngo?.organizationName || r.ngo?.name || 'Verified Shelter'}
                  </span>
                  <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                    {r.status}
                  </Badge>
                </div>
                <p className="text-stone-600">
                  Requested portion: <strong>{r.requestedQuantity} {data.unit}</strong> • Delivery:{' '}
                  <span className="capitalize">{r.deliveryPreference?.replace('_', ' ')}</span>
                </p>
                {r.intakeReason && <p className="text-stone-500 italic">"{r.intakeReason}"</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Status History Audit Trail */}
      <Card className="p-6 sm:p-8 border-cream-200 bg-white space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <History className="w-5 h-5 text-forest-700" />
          Status History & Chain of Custody Audit
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2">No status changes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h._id} className="flex items-start gap-3 p-3 bg-cream-50/70 rounded-xl border border-cream-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900 capitalize">Status changed to: {h.newStatus}</strong>
                    <span className="text-stone-400">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  {h.reason && <p className="text-stone-600 mt-0.5">{h.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Surplus Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to cancel the listing for <strong>{data.foodName}</strong>?
          </p>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Reason for Cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Storage issue or unexpected internal consumption..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
            <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)}>
              Keep Listing
            </Button>
            <Button variant="danger" size="sm" disabled={cancelling} onClick={handleConfirmCancel}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

