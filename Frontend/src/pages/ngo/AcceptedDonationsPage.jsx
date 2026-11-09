import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  MapPin,
  Calendar,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { feedbackService } from '../../services/feedbackService.js';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export function AcceptedDonationsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [feedbackDonation, setFeedbackDonation] = useState(null);
  const [rating, setRating] = useState(5);
  const [foodQualityRating, setFoodQualityRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchAcceptedDonations();
  }, []);

  const fetchAcceptedDonations = async () => {
    try {
      setLoading(true);
      const res = await ngoService.getAcceptedDonations();
      setDonations(res.data || []);
    } catch (err) {
      console.error('Failed to load accepted donations', err);
      toastError('Could not load accepted rescue listings.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedback = (donation) => {
    setFeedbackDonation(donation);
    setRating(5);
    setFoodQualityRating(5);
    setPunctualityRating(5);
    setComment('');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackDonation) return;

    try {
      setSubmittingFeedback(true);
      await feedbackService.submitFeedback({
        donationId: feedbackDonation._id,
        rating: Number(rating),
        foodQualityRating: Number(foodQualityRating),
        punctualityRating: Number(punctualityRating),
        comment,
      });

      success('Thank you! Your feedback has been recorded.', 'Feedback Submitted');
      setFeedbackDonation(null);
      fetchAcceptedDonations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback.';
      toastError(msg, 'Submission Error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Accepted Rescues & Deliveries
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Confirmed surplus food allocated to your organization. Monitor pickup schedules, track volunteer delivery status, and provide community feedback upon handover.
          </p>
        </div>

        <Link to={ROUTES.NGO_DELIVERIES}>
          <Button variant="outline" size="sm">
            <Truck className="w-4 h-4 mr-2" />
            Live Delivery Tracker
          </Button>
        </Link>
      </div>

      {/* Accepted Donations List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading your accepted surplus rescues...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No accepted donations yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once a food donor accepts your rescue request, the listing will appear here with full dispatch details.
          </p>
          <Link to={ROUTES.NGO_RECOMMENDED} className="inline-block mt-3">
            <Button size="sm" variant="primary">Explore Smart Matches</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donations.map((don) => (
            <div
              key={don._id}
              className="bg-white rounded-3xl border border-cream-200 p-6 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                      {don.category?.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900">{don.foodName}</h3>
                  </div>

                  <Badge variant="emerald" className="capitalize text-xs font-semibold">
                    {don.status}
                  </Badge>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {don.description || 'Quality food surplus prepared safely.'}
                </p>

                <div className="bg-cream-50 p-3.5 rounded-2xl space-y-1.5 text-xs text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Allocated Quantity:</span>
                    <strong>{don.quantity} {don.unit || 'portions'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Pickup Deadline:</span>
                    <strong>{new Date(don.pickupDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Donor Facility:</span>
                    <strong>{don.donor?.name || 'Verified Donor'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Pickup Location:</span>
                    <span>{don.pickupAddress?.street || don.pickupAddress?.city || 'See dispatch instructions'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-100 flex items-center justify-between gap-3">
                <Link to={ROUTES.NGO_DELIVERIES}>
                  <Button size="xs" variant="outline">
                    <Truck className="w-3.5 h-3.5 mr-1" /> Dispatch Status
                  </Button>
                </Link>

                {don.status === 'delivered' ? (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => handleOpenFeedback(don)}
                  >
                    <Star className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" /> Rate Donor
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-stone-400">
                    Feedback opens upon delivery
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Feedback Modal */}
      <Modal
        isOpen={Boolean(feedbackDonation)}
        onClose={() => setFeedbackDonation(null)}
        title={`Rate Rescue: ${feedbackDonation?.foodName || ''}`}
      >
        {feedbackDonation && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <p className="text-xs text-stone-600">
              Provide feedback for <strong>{feedbackDonation.donor?.name || 'the donor partner'}</strong> regarding food quality, packaging hygiene, and timeliness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Overall Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                  <option value="3">⭐⭐⭐ 3 - Satisfactory</option>
                  <option value="2">⭐⭐ 2 - Poor</option>
                  <option value="1">⭐ 1 - Substandard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Food Quality
                </label>
                <select
                  value={foodQualityRating}
                  onChange={(e) => setFoodQualityRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="5">5 / 5 - Fresh & Sealed</option>
                  <option value="4">4 / 5 - Good Quality</option>
                  <option value="3">3 / 5 - Acceptable</option>
                  <option value="2">2 / 5 - Subpar</option>
                  <option value="1">1 / 5 - Deficient</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Punctuality
                </label>
                <select
                  value={punctualityRating}
                  onChange={(e) => setPunctualityRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="5">5 / 5 - On Time</option>
                  <option value="4">4 / 5 - Minor Delay</option>
                  <option value="3">3 / 5 - Delayed</option>
                  <option value="2">2 / 5 - Significant Delay</option>
                  <option value="1">1 / 5 - Missed Window</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Written Review / Notes for Donor
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details regarding packaging integrity, meal temperature, or appreciation for the donors..."
                required
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFeedbackDonation(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submittingFeedback}>
                {submittingFeedback ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

