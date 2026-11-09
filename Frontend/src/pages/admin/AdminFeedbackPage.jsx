import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Trash2, Search, Filter, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error } = useToast();

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFeedback();
      setFeedbacks(res?.data || []);
    } catch (err) {
      error(err.message || 'Failed to load feedback records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;
    try {
      setDeleting(true);
      await adminService.deleteFeedback(selectedFeedback._id);
      success('Feedback review removed from public record.', 'Review Moderated');
      setSelectedFeedback(null);
      loadFeedback();
    } catch (err) {
      error(err.message || 'Failed to delete feedback entry.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const nextState = item.isVisible === false ? true : false;
      await adminService.toggleFeedbackVisibility(item._id, nextState);
      success(`Feedback visibility set to ${nextState ? 'public' : 'hidden'}.`);
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === item._id ? { ...f, isVisible: nextState } : f))
      );
    } catch (err) {
      error(err.message || 'Failed to update feedback visibility.');
    }
  };

  const filtered = feedbacks.filter((f) => {
    const term = search.toLowerCase();
    const comment = (f.comment || '').toLowerCase();
    const author = (f.submittedBy?.name || '').toLowerCase();
    return comment.includes(term) || author.includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <MessageSquare className="w-3.5 h-3.5" /> Community Sentiment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Feedback & Reviews Moderation
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Audit stakeholder ratings, remove inappropriate reviews, and ensure mutual trust.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadFeedback} className="text-xs self-start">
          Refresh Reviews
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md bg-white rounded-2xl border border-cream-200">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by review text or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-forest-600"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Loading reviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Feedback Found</h3>
          <p className="text-xs text-stone-500 mt-1">No reviews currently match your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Content</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {item.submittedBy?.name || 'Verified User'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.rating || 5}.0</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 max-w-md">
                      <p className="line-clamp-2">"{item.comment || 'Seamless delivery and excellent collaboration.'}"</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isVisible === false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-300">
                          Hidden
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Public
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-stone-600 hover:text-stone-900 text-xs gap-1"
                          onClick={() => handleToggleVisibility(item)}
                          title={item.isVisible === false ? 'Make public' : 'Hide from public'}
                        >
                          {item.isVisible === false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-forest-600" /> Show
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-stone-500" /> Hide
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedFeedback)}
        onClose={() => !deleting && setSelectedFeedback(null)}
        title="Delete Community Feedback"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Are you sure you want to delete this review by{' '}
              <strong>{selectedFeedback.submittedBy?.name || 'User'}</strong>?
            </p>
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs italic text-stone-700">
              "{selectedFeedback.comment}"
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeedback(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteFeedback}
                loading={deleting}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AdminFeedbackPage;
