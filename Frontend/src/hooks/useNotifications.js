import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth.js';
import { notificationService } from '../services/notificationService.js';

export const useNotifications = (pollIntervalMs = 20000) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!isBackground) setLoading(true);
    try {
      const response = await notificationService.getNotifications({ limit: 20 });
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
      setError(null);
    } catch (err) {
      if (!isBackground) {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (user && pollIntervalMs > 0) {
      timerRef.current = setInterval(() => {
        fetchNotifications(true);
      }, pollIntervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, pollIntervalMs, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: () => fetchNotifications(false),
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;

