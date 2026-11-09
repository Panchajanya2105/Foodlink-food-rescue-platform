import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  HandHeart,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ngoService } from '../../services/ngoService.js';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export function NgoDashboardPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [deliveryPref, setDeliveryPref] = useState('volunteer_delivery');
  const [intakeReason, setIntakeReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, recsData, reqsData, profileData] = await Promise.all([
        ngoService.getNgoAnalytics().catch(() => null),
        ngoService.getRecommendedDonations().catch(() => []),
        ngoService.getMyRequests({ limit: 5 }).catch(() => ({ data: [] })),
        ngoService.getNgoProfile().catch(() => null),
      ]);

      setAnalytics(analyticsData);
      setRecommendations(recsData?.slice(0, 3) || []);
      setRecentRequests(reqsData?.data || []);
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load NGO dashboard data', err);
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

      success('Food rescue request submitted to donor!', 'Request Created');
      setSelectedDonation(null);
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request. Please try again.';
      toastError(msg, 'Request Error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const isVerified = user?.isVerified || profile?.verificationStatus === 'verified';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/50 text-emerald-200 border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              {profile?.organizationName || 'Nonprofit Partner'}
            </span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Organization
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30">
                <AlertCircle className="w-3.5 h-3.5" /> Verification Pending
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Partner'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-1 max-w-2xl">
            Monitor incoming surplus donations, track active claims, and review intelligent matches tailored to your community meal program.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to={ROUTES.NGO_RECOMMENDED}>
            <Button variant="secondary" className="bg-white text-emerald-900 hover:bg-cream-100">
              <Sparkles className="w-4 h-4 mr-2 text-amber-600" />
              Smart Matches
            </Button>
          </Link>
          <Link to={ROUTES.NGO_DONATIONS}>
            <Button variant="outline" className="border-emerald-300 text-white hover:bg-emerald-700/50">
              <Boxes className="w-4 h-4 mr-2" />
              Browse Surplus
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Notice Banner if Pending */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Account Verification In Review</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Your nonprofit credentials are being reviewed by platform administrators. You can browse food listings and recommendations, but claiming surplus requires administrator approval.
            </p>
          </div>
          <Link to={ROUTES.NGO_PROFILE}>
            <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100">
              Review Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HandHeart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {loading ? '...' : analytics?.totalRequests || 0}
            </h3>
            <p className="text-xs text-stone-500 mt-1">Submitted claims</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Approved Rescues</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {loading ? '...' : analytics?.approvedRequests || 0}
            </h3>
            <p className="text-xs text-stone-500 mt-1">Accepted by donors</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Meals Received</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {loading ? '...' : analytics?.quantityReceived || 0}
            </h3>
            <p className="text-xs text-stone-500 mt-1">~{analytics?.co2SavedKg || 0} kg CO₂ saved</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Pending Decisions</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {loading ? '...' : analytics?.pendingRequests || 0}
            </h3>
            <p className="text-xs text-stone-500 mt-1">Awaiting donor response</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Smart Recommendations & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Smart Recommendations Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-stone-900">Top Recommended Surplus Food</h2>
            </div>
            <Link
              to={ROUTES.NGO_RECOMMENDED}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View all matches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center text-stone-500 text-sm">
              Evaluating nearby food surplus matches...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center">
              <Boxes className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-stone-800">No active surplus matches right now</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Check back shortly or browse all available surplus listings from our community donor network.
              </p>
              <Link to={ROUTES.NGO_DONATIONS} className="mt-4 inline-block">
                <Button size="sm" variant="outline">Browse All Listings</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recommendations.map((rec) => {
                const don = rec.donation;
                return (
                  <div
                    key={don._id}
                    className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-900 text-base">{don.foodName}</span>
                        <Badge variant="emerald" className="font-bold text-xs bg-emerald-100 text-emerald-800">
                          {rec.matchScore}% Match
                        </Badge>
                        <Badge variant="stone" className="text-xs">
                          {rec.distanceKm} km away
                        </Badge>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-1">
                        {don.description || 'Nutritious surplus ready for distribution.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                        <span>📦 Quantity: <strong className="text-stone-800">{don.quantity} {don.unit || 'meals'}</strong></span>
                        <span>⏱️ Pickup by: <strong className="text-stone-800">{new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link to={`/ngo/donations/${don._id}`}>
                        <Button size="sm" variant="outline" className="text-xs">Details</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs"
                        disabled={!isVerified}
                        onClick={() => handleOpenRequest(don)}
                      >
                        Claim Food
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Activity Chart */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Rescue Activity</h3>
            <span className="text-xs text-stone-500">Last 6 Months</span>
          </div>

          <div className="h-64 w-full">
            {analytics?.monthlyActivity && analytics.monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe1" />
                  <XAxis dataKey="month" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#6ee7b7' }}
                  />
                  <Bar dataKey="mealsRescued" name="Meals" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="requests" name="Requests" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Activity data will appear as you claim rescues
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Meals Rescued
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span> Requests Submitted
            </span>
          </div>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recent Rescue Requests</h3>
            <p className="text-xs text-stone-500">Track the approval status of your active requests.</p>
          </div>
          <Link to={ROUTES.NGO_REQUESTS} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            All Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            No active requests submitted yet. Explore the food board to request nutritious surplus!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-50 text-stone-600 text-xs uppercase tracking-wider border-b border-cream-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Food Item</th>
                  <th className="py-3 px-4 font-semibold">Quantity</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-stone-900">
                      {req.donation?.foodName || 'Surplus Food'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {req.requestedQuantity} {req.donation?.unit || 'portions'}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'approved' && <Badge variant="emerald">Approved</Badge>}
                      {req.status === 'pending' && <Badge variant="amber">Under Review</Badge>}
                      {req.status === 'rejected' && <Badge variant="stone">Declined</Badge>}
                      {req.status === 'withdrawn' && <Badge variant="stone">Withdrawn</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={ROUTES.NGO_REQUESTS}>
                        <Button size="xs" variant="ghost">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

