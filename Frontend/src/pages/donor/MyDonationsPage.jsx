import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  PackagePlus,
  Clock,
  Search,
  Filter,
  Eye,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useToast } from '../../hooks/useToast.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import api from '../../services/api.js';

export function MyDonationsPage() {
  const { success, error: toastError } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyDonations();
  }, [selectedStatus]);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/v1/donations/my-donations', { params });
      if (res.data?.data) {
        setDonations(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load my donations, using fallback demo data:', err.message);
      setDonations([
        {
          _id: 'demo-don-1',
          foodName: 'Gourmet Sourdough & Focaccia Breads',
          category: 'bakery',
          quantity: 35,
          unit: 'boxes',
          status: 'available',
          storageRequirement: 'ambient',
          pickupDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
          evaluation: { urgency: 'urgent', hoursRemaining: 4 },
          safetyChecklist: { passedAllChecks: true },
        },
        {
          _id: 'demo-don-2',
          foodName: 'Slow-Cooked Beef & Lentil Stew Trays',
          category: 'cooked_meals',
          quantity: 50,
          unit: 'portions',
          status: 'completed',
          storageRequirement: 'hot_insulated',
          pickupDeadline: new Date(Date.now() - 24 * 3600000).toISOString(),
          evaluation: { urgency: 'normal' },
          safetyChecklist: { passedAllChecks: true },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setCancelling(true);
    try {
      await api.patch(`/v1/donations/${cancelModalItem._id}/cancel`, {
        reason: cancelReason || 'Cancelled by donor operator',
      });
      success('Donation listing cancelled successfully.', 'Listing Updated');
      setCancelModalItem(null);
      setCancelReason('');
      fetchMyDonations();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to cancel listing.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (!searchTerm) return true;
    return d.foodName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="sm">Available</Badge>;
      case 'requested':
        return <Badge variant="warning" size="sm">Claim Pending</Badge>;
      case 'accepted':
        return <Badge variant="info" size="sm">Claim Approved</Badge>;
      case 'in_transit':
        return <Badge variant="info" size="sm">In Transit</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">Delivered / Rescued</Badge>;
      case 'expired':
        return <Badge variant="danger" size="sm">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="danger" size="sm">&lt; 2h Remaining</Badge>;
      case 'urgent':
        return <Badge variant="warning" size="sm">&lt; 6h Remaining</Badge>;
      case 'moderate':
        return <Badge variant="info" size="sm">&lt; 24h Remaining</Badge>;
      case 'expired':
        return <Badge variant="danger" size="sm">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-forest-700" />
            My Surplus Food Listings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            View active, pending, rescued, and historical donations from your culinary operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={ROUTES.DONOR_NEW_DONATION}>
            <Button variant="warm" size="sm" icon={PackagePlus}>
              List New Donation
            </Button>
          </Link>
          <button
            onClick={fetchMyDonations}
            className="p-2 border border-cream-300 rounded-xl hover:bg-cream-100 text-stone-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-cream-200 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search your donations by food name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-cream-200 text-xs">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mr-2">Filter Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'available', label: 'Available' },
            { id: 'requested', label: 'Requested' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'completed', label: 'Completed' },
            { id: 'expired', label: 'Expired' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-forest-700 text-white font-bold'
                  : 'bg-cream-50 text-stone-600 hover:bg-cream-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-stone-500">
          <div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Loading surplus inventory...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <Card className="p-12 text-center border-cream-200 bg-white space-y-3">
          <Boxes className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No donations match this filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You currently have no food items with status "{selectedStatus}".
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedStatus('all'); setSearchTerm(''); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDonations.map((item) => (
            <Card key={item._id} className="p-5 border-cream-200 bg-white hover:shadow-sm transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      {item.category?.replace('_', ' ')}
                    </span>
                    {getUrgencyBadge(item.evaluation?.urgency)}
                    {item.safetyChecklist?.passedAllChecks && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safety Certified
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-stone-900 text-base tracking-tight">{item.foodName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                    <span>
                      Quantity: <strong className="text-stone-800">{item.quantity} {item.unit}</strong>
                    </span>
                    <span>•</span>
                    <span className="capitalize flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-terracotta-500" />
                      {item.storageRequirement?.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Deadline: {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      ({new Date(item.pickupDeadline).toLocaleDateString()})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/donor/donations/${item._id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      Details
                    </Button>
                  </Link>

                  {['available', 'draft'].includes(item.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      icon={XCircle}
                      onClick={() => setCancelModalItem(item)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalItem)}
        onClose={() => setCancelModalItem(null)}
        title="Cancel Surplus Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to cancel the listing for <strong>{cancelModalItem?.foodName}</strong>?
            This will withdraw it from public discovery and stop matching NGO claims.
          </p>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Reason for Cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Inadvertent duplicate post or unexpected internal consumption..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalItem(null)}>
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

