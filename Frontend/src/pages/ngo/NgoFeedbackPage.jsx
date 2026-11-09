import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Building2,
  Calendar,
  ThumbsUp,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { feedbackService } from '../../services/feedbackService.js';
import { Badge } from '../../components/ui/Badge.jsx';

export function NgoFeedbackPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getMyFeedback();
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Failed to load feedback', err);
      toastError('Could not load community reviews.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filterType === 'received') return f.recipient?._id === user?._id;
    if (filterType === 'submitted') return f.submittedBy?._id === user?._id;
    return true;
  });

  const averageRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Community Feedback & Ratings
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Verified ratings and quality feedback from partner donors and delivery couriers following completed surplus food handovers.
          </p>
        </div>

        <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
            ⭐ {averageRating}
          </div>
          <div>
            <span className="text-xs text-stone-500 uppercase font-semibold">Community Score</span>
            <p className="text-xs font-medium text-stone-800">{feedbacks.length} Verified Reviews</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-cream-200 gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
            filterType === 'all'
              ? 'bg-white text-emerald-800 border-t border-l border-r border-cream-200 shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Reviews ({feedbacks.length})
        </button>
        <button
          onClick={() => setFilterType('received')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
            filterType === 'received'
              ? 'bg-white text-emerald-800 border-t border-l border-r border-cream-200 shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Received from Donors
        </button>
        <button
          onClick={() => setFilterType('submitted')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
            filterType === 'submitted'
              ? 'bg-white text-emerald-800 border-t border-l border-r border-cream-200 shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Submitted by Our Org
        </button>
      </div>

      {/* Feedbacks Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading feedback and reviews...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No reviews found in this view</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Reviews are created upon successful completion and delivery of surplus food.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white rounded-3xl border border-cream-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-stone-900 text-sm ml-1">{fb.rating}.0</span>
                  </div>
                  <span className="text-xs text-stone-400">
                    Rescue: <strong>{fb.donation?.foodName || 'Surplus Order'}</strong>
                  </span>
                </div>

                <Badge variant="stone" className="text-xs capitalize">
                  {fb.feedbackType?.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-cream-50/50 p-4 rounded-2xl border border-cream-100">
                "{fb.comment}"
              </p>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-cream-100">
                <span>By: <strong>{fb.submittedBy?.name || 'Partner'}</strong></span>
                <span>{new Date(fb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

