import api from './api.js';

export const deliveryService = {
  getAvailableTasks: async (params = {}) => {
    const res = await api.get('/v1/assignments/available', { params });
    return res.data;
  },

  getMyTasks: async (params = {}) => {
    const res = await api.get('/v1/assignments', { params });
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/v1/assignments/${id}`);
    return res.data?.data;
  },

  claimTask: async (id) => {
    const res = await api.patch(`/v1/assignments/${id}/claim`);
    return res.data?.data;
  },

  cancelTask: async (id, reason = '') => {
    const res = await api.patch(`/v1/assignments/${id}/cancel`, { reason });
    return res.data?.data;
  },

  confirmPickup: async (id, data) => {
    const res = await api.patch(`/v1/assignments/${id}/pickup`, data);
    return res.data?.data;
  },

  confirmDelivery: async (id, data) => {
    const res = await api.patch(`/v1/assignments/${id}/delivery`, data);
    return res.data?.data;
  },

  getCourierAnalytics: async () => {
    const res = await api.get('/v1/assignments/analytics');
    return res.data?.data;
  },

  getHistory: async (params = {}) => {
    const res = await api.get('/v1/assignments', {
      params: { status: 'completed', ...params },
    });
    return res.data;
  },

  updateDeliveryProfile: async (data) => {
    const res = await api.patch('/v1/users/delivery-profile', data);
    return res.data?.data;
  },
};

