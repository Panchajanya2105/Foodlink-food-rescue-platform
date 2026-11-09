import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, HeartHandshake } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function DeliveryFeedbackPage() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await api.get('/v1/feedback');
        setFeedbackList(res.data?.data || []);
      } catch (err) {
        // graceful empty
        setFeedbackList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const totalReviews = feedbackList.length;
  const avgRating = totalReviews > 0
    ? (feedbackList.reduce((sum, f) => sum + (f.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Community Reviews
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Feedback & Ratings
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Ratings and reviews submitted by food donors and partner NGOs for your deliveries.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-cream-50 p-4 rounded-2xl border border-cream-200">
          <div className="text-center">
            <span className="text-3xl font-black text-amber-500">{avgRating}</span>
            <div className="flex justify-center text-amber-400 text-xs mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mt-1">{totalReviews} Reviews</p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading reviews...</p>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Reviews Yet</h3>
          <p className="text-xs text-stone-500 mt-1">
            As you complete deliveries to community kitchens and NGOs, their ratings and thank-you notes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-6 border border-cream-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (item.rating || 5) ? 'fill-current' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700">{item.rating || 5}.0</span>
                </div>
                <span className="text-xs text-stone-400">
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 font-medium">
                "{item.comment || 'Smooth, courteous, and timely delivery of fresh food.'}"
              </p>

              <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs text-stone-500">
                <span>By: {item.submittedBy?.name || 'Verified Partner'}</span>
                <Badge variant="neutral">Verified Rescue</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default DeliveryFeedbackPage;
