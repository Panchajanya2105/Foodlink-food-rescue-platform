import api from './api.js';

export const ngoService = {
  getRecommendedDonations: async () => {
    const res = await api.get('/v1/recommendations/ngo');
    return res.data?.data || [];
  },

  getRecommendedFood: async () => {
    const res = await api.get('/v1/recommendations/ngo');
    return res.data?.data || [];
  },

  getAvailableDonations: async (params = {}) => {
    const res = await api.get('/v1/donations', {
      params: { status: 'available', ...params },
    });
    return res.data;
  },

  getDonationById: async (id) => {
    const res = await api.get(`/v1/donations/${id}`);
    return res.data?.data;
  },

  createRequest: async (data) => {
    const res = await api.post('/v1/requests', data);
    return res.data?.data;
  },

  getMyRequests: async (params = {}) => {
    const res = await api.get('/v1/requests', { params });
    return res.data;
  },

  withdrawRequest: async (requestId) => {
    const res = await api.patch(`/v1/requests/${requestId}/withdraw`);
    return res.data?.data;
  },

  getAcceptedDonations: async (params = {}) => {
    const res = await api.get('/v1/requests/accepted', { params });
    return res.data;
  },

  getNgoDeliveries: async (params = {}) => {
    const res = await api.get('/v1/assignments', { params });
    return res.data;
  },

  getNgoAnalytics: async () => {
    const res = await api.get('/v1/analytics/ngo');
    return res.data?.data;
  },

  getNgoProfile: async () => {
    const res = await api.get('/v1/ngos/profile');
    return res.data?.data;
  },

  updateNgoProfile: async (data) => {
    const res = await api.patch('/v1/ngos/profile', data);
    return res.data?.data;
  },
};

