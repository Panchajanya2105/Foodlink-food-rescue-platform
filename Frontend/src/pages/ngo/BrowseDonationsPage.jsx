import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Boxes,
  Clock,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS, STORAGE_LABELS } from '../../constants/donationEnums.js';

export function BrowseDonationsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [deliveryPref, setDeliveryPref] = useState('volunteer_delivery');
  const [intakeReason, setIntakeReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, selectedStorage]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStorage) params.storageRequirement = selectedStorage;

      const res = await ngoService.getAvailableDonations(params);
      setDonations(res.data || []);
    } catch (err) {
      console.error('Failed to load available donations', err);
      toastError('Could not load surplus food listings.', 'Error');
    } finally {
      setLoading(false);
    }
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

      success('Food rescue claim submitted to donor!', 'Request Created');
      setSelectedDonation(null);
      fetchDonations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      toastError(msg, 'Request Failed');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      d.foodName?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term) ||
      d.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Browse Surplus Food
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Discover verified surplus listings available from restaurants, grocers, and commercial kitchens ready for community rescue.
          </p>
        </div>

        <Link to="/ngo/recommended">
          <Button variant="secondary" size="sm">
            <Sparkles className="w-4 h-4 mr-2 text-amber-600" />
            Switch to Smart Matches
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by food name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-cream-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All Categories</option>
            {Object.entries(FOOD_CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>

          <select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-stone-700"
          >
            <option value="">All Storage Types</option>
            {Object.entries(STORAGE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading available surplus listings...
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <Boxes className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No surplus donations match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clear category filters to see more listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((don) => {
            const hoursLeft = Math.max(
              0,
              ((new Date(don.pickupDeadline) - new Date()) / (1000 * 60 * 60)).toFixed(1)
            );

            return (
              <div
                key={don._id}
                className="bg-white rounded-2xl border border-cream-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="stone" className="text-xs capitalize font-medium">
                      {don.category?.replace('_', ' ')}
                    </Badge>
                    {hoursLeft < 3 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> Urgent: {hoursLeft}h left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Clock className="w-3 h-3 text-emerald-600" /> {hoursLeft}h window
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors">
                      {don.foodName}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                      {don.description || 'Quality surplus prepared according to strict food safety protocols.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-cream-100 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Quantity:</span>
                      <strong className="text-stone-800">{don.quantity} {don.unit || 'portions'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Storage:</span>
                      <strong className="text-stone-800 capitalize">{don.storageRequirement?.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Pickup Deadline:</span>
                      <strong className="text-stone-800">{new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </div>

                  {don.allergens && don.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {don.allergens.map((alg, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cream-100 text-stone-600">
                          {alg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-cream-50/50 border-t border-cream-100 flex items-center justify-between gap-2">
                  <Link to={`/ngo/donations/${don._id}`} className="text-xs text-emerald-700 font-semibold hover:underline">
                    View Details
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

