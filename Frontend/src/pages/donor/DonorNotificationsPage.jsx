import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';

export function DonorNotificationsPage() {
  const { success } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback notifications demo data:', err.message);
      setNotifications([
        {
          _id: 'notif-1',
          type: 'request_created',
          title: 'New NGO Claim Submitted',
          message: 'Downtown Hope Community Shelter requested 25 portions of Artisan Pastry & Bagel Assortment.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'notif-2',
          type: 'delivery_completed',
          title: 'Food Rescue Delivered Successfully',
          message: 'Volunteer Courier Alex confirmed safe drop-off at St. Anthony Soup Kitchen.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/v1/notifications/mark-all-read');
      success('All notifications marked as read.');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-forest-700" />
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Real-time updates regarding NGO claims, volunteer pickup alerts, and delivery confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>
            Mark All Read
          </Button>
          <button
            onClick={fetchNotifications}
            className="p-2 border border-cream-300 rounded-xl hover:bg-cream-100 text-stone-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-stone-500 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center border-cream-200 bg-white space-y-2">
          <Bell className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">All Caught Up</h3>
          <p className="text-xs text-stone-500">You have no new alerts at this time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-4 border-cream-200 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-forest-50/40 border-forest-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-stone-900">{n.title || 'Platform Alert'}</strong>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-forest-600" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
                </div>

                <span className="text-[11px] text-stone-400 shrink-0">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

