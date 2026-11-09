import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, HeartHandshake, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import api from '../../services/api.js';

export function DonorFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/feedback');
      if (res.data?.data) {
        setFeedbackList(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback feedback demo data:', err.message);
      setFeedbackList([
        {
          _id: 'fb-1',
          rating: 5,
          comment:
            'The sourdough loaves were exceptionally fresh and clean. Our shelter guests enjoyed hot toast and soup all evening!',
          submittedBy: { name: 'Sister Maria Gonzales', role: 'ngo' },
          donation: { foodName: 'Artisan Pastry & Bagel Assortment' },
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          _id: 'fb-2',
          rating: 5,
          comment:
            'Catering trays were sealed securely with clear temperature labeling. Made transit very easy and hygienic.',
          submittedBy: { name: 'Alex Courier', role: 'delivery' },
          donation: { foodName: 'Roasted Vegetable Frittata Trays' },
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-terracotta-600" />
            Partner Feedback & Quality Ratings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Reviews and satisfaction ratings from recipient charities and delivery volunteers.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="p-2 border border-cream-300 rounded-xl hover:bg-cream-100 text-stone-600"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-stone-500 text-xs">Loading feedback reviews...</div>
      ) : feedbackList.length === 0 ? (
        <Card className="p-12 text-center border-cream-200 bg-white space-y-2">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No Feedback Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once recipient shelters receive your completed food rescues, their feedback and ratings will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((fb) => (
            <Card key={fb._id} className="p-5 border-cream-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(fb.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "{fb.comment}"
              </p>

              <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-stone-900">{fb.submittedBy?.name || 'Partner'}</strong>
                  <span className="text-[10px] text-stone-400 uppercase font-bold">
                    {fb.submittedBy?.role === 'ngo' ? 'Recipient Charity' : 'Volunteer Courier'}
                  </span>
                </div>
                {fb.donation?.foodName && (
                  <span className="text-[11px] text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {fb.donation.foodName}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

