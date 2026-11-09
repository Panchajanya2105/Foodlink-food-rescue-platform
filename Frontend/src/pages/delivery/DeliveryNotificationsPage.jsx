import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock, Truck, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';

export function DeliveryNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/notifications');
      setNotifications(res.data?.data || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/v1/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All dispatch notifications marked as read.');
    } catch (err) {
      error(err.message || 'Could not mark notifications as read.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-200 mb-2">
            <Bell className="w-3.5 h-3.5" /> Dispatch Alerts
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time updates on assignments, donor verifications, and delivery confirmations.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs gap-1.5 self-start">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-stone-500">Checking alert inbox...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-lg mx-auto">
          <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">You're All Caught Up</h3>
          <p className="text-xs text-stone-500 mt-1">
            New food rescue alerts and status updates will be displayed here as they arrive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.isRead
                  ? 'bg-white border-cream-200'
                  : 'bg-forest-50/50 border-forest-200 shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">{n.title || 'Dispatch Alert'}</h4>
                  <span className="text-[11px] text-stone-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default DeliveryNotificationsPage;
