import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Truck,
  HandHeart,
  Clock,
  Check,
} from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../hooks/useToast.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function NgoNotificationsPage() {
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/notifications');
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
      toastError('Could not load notifications.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/v1/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read.', 'Updated');
    } catch (err) {
      toastError('Failed to mark all as read.', 'Error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Stay updated on your surplus requests, donor approvals, and courier dispatches.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="w-4 h-4 mr-1.5" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-stone-500 text-sm">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center space-y-3">
          <Bell className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">You're all caught up!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You will receive updates here whenever a donor reviews your request or a courier dispatches a rescue order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-cream-200 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-200 shadow-2xs hover:bg-emerald-50/70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  n.isRead ? 'bg-cream-100 text-stone-500' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {n.notificationType?.includes('approved') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : n.notificationType?.includes('rejected') ? (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                ) : (
                  <Bell className="w-5 h-5 text-emerald-700" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-stone-900">{n.title}</h4>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

