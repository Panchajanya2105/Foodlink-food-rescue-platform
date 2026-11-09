import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export function RecommendedFoodPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [deliveryPref, setDeliveryPref] = useState('volunteer_delivery');
  const [intakeReason, setIntakeReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await ngoService.getRecommendedDonations();
      setRecommendations(data || []);
    } catch (err) {
      console.error('Failed to load recommendations', err);
      toastError('Could not load smart recommendations. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setRequestQty(donation.quantity || 1);
    setIntakeReason('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmittingRequest(true);
      await ngoService.createRequest({
        donationId: selectedDonation._id,
        requestedQuantity: Number(requestQty),
        deliveryPreference: deliveryPref,
        intakeReason,
      });

      success('Rescue request submitted successfully!', 'Claim Submitted');
      setSelectedDonation(null);
      fetchRecommendations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      toastError(msg, 'Request Failed');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Explainable Multi-Factor Matching Algorithm
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Smart Surplus Recommendations
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-3xl">
            Ranked through a transparent 6-factor heuristic evaluating proximity, certified cold-chain compatibility, daily intake capacity, food category preferences, and pickup deadline feasibility.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={loading}>
          Refresh Matches
        </Button>
      </div>

      {/* Info Card on Matching Rules */}
      <div className="bg-cream-50/70 border border-cream-200 rounded-2xl p-5 text-xs text-stone-700 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-stone-800 text-sm">
          <Info className="w-4 h-4 text-emerald-700" />
          How Recommendations Are Calculated:
        </div>
        <p className="text-stone-600">
          Our rule-based engine scores available listings on a 100-point scale: <strong>Geographic Distance (30 pts)</strong>, <strong>Category Compatibility (25 pts)</strong>, <strong>Storage Compatibility (20 pts)</strong>, <strong>Intake Capacity (10 pts)</strong>, <strong>Verification (10 pts)</strong>, and <strong>Pickup Deadline Urgency (5 pts)</strong>.
        </p>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500">
          Calculating nearest and most compatible surplus listings...
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No matching surplus listings right now</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Either all nearby surplus has already been claimed or your account verification is still under review. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const don = rec.donation;
            const isExpanded = expandedCards[don._id];
            const scoreColor =
              rec.matchScore >= 80
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : rec.matchScore >= 60
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-stone-100 text-stone-800 border-stone-300';

            return (
              <div
                key={don._id}
                className="bg-white rounded-2xl border border-cream-200 shadow-sm hover:border-emerald-300 transition-all overflow-hidden"
              >
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left: Score & Food Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-bold flex-shrink-0 ${scoreColor}`}
                    >
                      <span className="text-xl leading-none">{rec.matchScore}</span>
                      <span className="text-[10px] uppercase font-semibold mt-0.5">Score</span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg text-stone-900">{don.foodName}</h3>
                        <Badge variant="stone" className="text-xs capitalize">
                          {don.category?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="emerald" className="text-xs">
                          {rec.distanceKm} km away (~{rec.estTransitMinutes} mins)
                        </Badge>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2">{don.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-stone-400" />
                          Quantity: <strong className="text-stone-800">{don.quantity} {don.unit || 'portions'}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-stone-400" />
                          Storage: <strong className="text-stone-800 capitalize">{don.storageRequirement?.replace('_', ' ')}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          Pickup by: <strong className="text-stone-800">{new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs flex items-center gap-1 text-stone-600"
                      onClick={() => toggleExpand(don._id)}
                    >
                      {isExpanded ? 'Hide Factors' : 'Explain Match'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </Button>
                    <Link to={`/ngo/donations/${don._id}`}>
                      <Button size="sm" variant="outline" className="text-xs">Details</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs"
                      onClick={() => handleOpenRequest(don)}
                    >
                      Request Surplus
                    </Button>
                  </div>
                </div>

                {/* Explainability Breakdown Accordion */}
                {isExpanded && (
                  <div className="bg-cream-50/50 border-t border-cream-200 p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Match Evaluation Breakdown:
                      </h4>
                      <span className="text-stone-500 font-medium">Heuristic Score: {rec.matchScore} / 100</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.explanations?.map((exp, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-cream-200 flex items-start gap-2 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-stone-700 leading-relaxed">{exp}</span>
                        </div>
                      ))}
                    </div>

                    {rec.factors && (
                      <div className="pt-2 border-t border-cream-200/60 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] text-stone-600 text-center">
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Distance</p>
                          <p className="font-bold text-stone-800">{rec.factors.distance?.score || 0} / 30 pts</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Category</p>
                          <p className="font-bold text-stone-800">{rec.factors.category?.score || 0} / 25 pts</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Storage</p>
                          <p className="font-bold text-stone-800">{rec.factors.storage?.score || 0} / 20 pts</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Capacity</p>
                          <p className="font-bold text-stone-800">{rec.factors.capacity?.score || 0} / 10 pts</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Verification</p>
                          <p className="font-bold text-stone-800">{rec.factors.verification?.score || 0} / 10 pts</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-cream-200">
                          <p className="text-stone-400">Deadline</p>
                          <p className="font-bold text-stone-800">{rec.factors.deadlineFeasibility?.score || 0} / 5 pts</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Donation Modal */}
      <Modal
        isOpen={Boolean(selectedDonation)}
        onClose={() => setSelectedDonation(null)}
        title={`Request Surplus: ${selectedDonation?.foodName || ''}`}
      >
        {selectedDonation && (
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="bg-cream-50 p-3.5 rounded-xl text-xs space-y-1 text-stone-700">
              <p>Available Total: <strong>{selectedDonation.quantity} {selectedDonation.unit || 'portions'}</strong></p>
              <p>Pickup Deadline: <strong>{new Date(selectedDonation.pickupDeadline).toLocaleString()}</strong></p>
              <p>Storage: <strong>{selectedDonation.storageRequirement}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Portions to Request (Max: {selectedDonation.quantity})
              </label>
              <input
                type="number"
                min="1"
                max={selectedDonation.quantity}
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
                placeholder="e.g. For our evening hot dinner distribution at the community center..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedDonation(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submittingRequest}>
                {submittingRequest ? 'Submitting...' : 'Submit Rescue Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

