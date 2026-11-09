import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Clock,
  MapPin,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export function NgoDonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestQty, setRequestQty] = useState(1);
  const [deliveryPref, setDeliveryPref] = useState('volunteer_delivery');
  const [intakeReason, setIntakeReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchDonationDetail();
  }, [id]);

  const fetchDonationDetail = async () => {
    try {
      setLoading(true);
      const data = await ngoService.getDonationById(id);
      setDonation(data);
      setRequestQty(data?.quantity || 1);
    } catch (err) {
      console.error('Failed to load donation details', err);
      toastError('Listing not found or unavailable.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = () => {
    if (!user?.isVerified && user?.verificationStatus !== 'verified') {
      toastError('Your organization must be verified by an administrator before claiming surplus food.', 'Verification Required');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!donation) return;

    try {
      setSubmittingRequest(true);
      await ngoService.createRequest({
        donationId: donation._id,
        requestedQuantity: Number(requestQty),
        deliveryPreference: deliveryPref,
        intakeReason,
      });

      success('Food rescue request submitted to donor!', 'Request Created');
      setIsModalOpen(false);
      navigate(ROUTES.NGO_REQUESTS);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      toastError(msg, 'Request Failed');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-stone-500 text-sm">
        Loading donation specifications...
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Donation Not Found</h2>
        <p className="text-xs text-stone-500">The listing may have expired or was allocated to another partner.</p>
        <Link to={ROUTES.NGO_DONATIONS}>
          <Button variant="outline" size="sm">Back to Surplus Listings</Button>
        </Link>
      </div>
    );
  }

  const hoursToDeadline = Math.max(
    0,
    ((new Date(donation.pickupDeadline) - new Date()) / (1000 * 60 * 60)).toFixed(1)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back Link */}
      <Link
        to={ROUTES.NGO_DONATIONS}
        className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Surplus Food Board
      </Link>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="stone" className="text-xs capitalize font-medium">
                {donation.category?.replace('_', ' ')}
              </Badge>
              <Badge variant="emerald" className="text-xs">
                {donation.status?.toUpperCase()}
              </Badge>
              {hoursToDeadline < 3 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  Urgent: {hoursToDeadline}h remaining
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {donation.foodName}
            </h1>
          </div>

          {donation.status === 'available' && (
            <Button variant="primary" onClick={handleOpenRequest}>
              Request This Surplus
            </Button>
          )}
        </div>

        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          {donation.description || 'Quality nutritious surplus packaged safely for community redistribution.'}
        </p>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-cream-50/70 border border-cream-200 text-xs">
          <div>
            <span className="text-stone-400 block font-medium">Total Quantity</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {donation.quantity} {donation.unit || 'portions'}
            </strong>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Storage Requirement</span>
            <strong className="text-stone-900 text-sm mt-0.5 block capitalize">
              {donation.storageRequirement?.replace('_', ' ')}
            </strong>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Pickup Deadline</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </strong>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Expiry Deadline</span>
            <strong className="text-stone-900 text-sm mt-0.5 block">
              {new Date(donation.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid: Food Safety Certification & Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Food Safety Checklist Card */}
        <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-stone-900">Food Safety Verification</h3>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Certified by Donor under the Good Samaritan Legal Standard
            </div>
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              This surplus lot passed standard commercial food prep hygiene checks before being approved for nonprofit pickup.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-stone-700 pt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Prepared in an inspected commercial kitchen facility</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Never exposed to open consumer buffet contact</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Packaged in sealed food-grade containers with date label</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Temperature compliant at packaging</span>
            </div>
          </div>

          {donation.allergens && donation.allergens.length > 0 && (
            <div className="pt-4 border-t border-cream-100 space-y-2">
              <h4 className="text-xs font-bold text-stone-800">Declared Allergens:</h4>
              <div className="flex flex-wrap gap-1.5">
                {donation.allergens.map((alg, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                    {alg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logistics & Pickup Instructions */}
        <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-stone-900">Pickup Logistics</h3>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 block font-medium">Pickup Address / Region:</span>
              <p className="font-semibold text-stone-900 mt-0.5 text-sm">
                {donation.pickupAddress?.street ? `${donation.pickupAddress.street}, ` : ''}
                {donation.pickupAddress?.city || 'Bengaluru'}, {donation.pickupAddress?.state || 'Karnataka'} {donation.pickupAddress?.postalCode || ''}
              </p>
            </div>

            {donation.pickupInstructions && (
              <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200">
                <span className="font-bold text-stone-800 block mb-1">Donor Pickup Instructions:</span>
                <p className="text-stone-600">{donation.pickupInstructions}</p>
              </div>
            )}

            <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
              <span className="text-stone-500">Listed by:</span>
              <span className="font-semibold text-stone-800">
                {donation.donor?.name || 'Verified Food Partner'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Donation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request Surplus: ${donation.foodName}`}
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="bg-cream-50 p-3.5 rounded-xl text-xs space-y-1 text-stone-700">
            <p>Available Total: <strong>{donation.quantity} {donation.unit || 'portions'}</strong></p>
            <p>Pickup Deadline: <strong>{new Date(donation.pickupDeadline).toLocaleString()}</strong></p>
            <p>Storage: <strong>{donation.storageRequirement}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Portions to Request (Max: {donation.quantity})
            </label>
            <input
              type="number"
              min="1"
              max={donation.quantity}
              value={requestQty}
              onChange={(e) => setRequestQty(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Delivery Preference
            </label>
            <select
              value={deliveryPref}
              onChange={(e) => setDeliveryPref(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="volunteer_delivery">Volunteer Delivery Partner</option>
              <option value="self_pickup">NGO Self-Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Distribution Purpose / Note to Donor (Optional)
            </label>
            <textarea
              rows="3"
              value={intakeReason}
              onChange={(e) => setIntakeReason(e.target.value)}
              placeholder="e.g. For our evening shelter meal program..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submittingRequest}>
              {submittingRequest ? 'Submitting...' : 'Submit Rescue Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

