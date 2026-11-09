import api from './api.js';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const res = await api.get('/v1/notifications', { params });
    return res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await api.patch(`/v1/notifications/${notificationId}/read`);
    return res.data?.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/v1/notifications/read-all');
    return res.data;
  },
};

