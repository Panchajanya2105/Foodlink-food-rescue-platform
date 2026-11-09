import api from './api.js';

export const analyticsService = {
  getSystemAnalytics: async () => {
    const res = await api.get('/v1/analytics');
    return res.data?.data;
  },

  getDonorAnalytics: async () => {
    const res = await api.get('/v1/analytics/donor');
    return res.data?.data;
  },

  getNgoAnalytics: async () => {
    const res = await api.get('/v1/analytics/ngo');
    return res.data?.data;
  },

  getDeliveryAnalytics: async (courierId) => {
    const res = await api.get('/v1/analytics/delivery', {
      params: courierId ? { courierId } : {},
    });
    return res.data?.data;
  },
};

