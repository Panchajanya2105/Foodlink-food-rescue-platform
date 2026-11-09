import api from './api.js';

export const adminService = {
  getOverview: async () => {
    const res = await api.get('/v1/admin/overview');
    return res.data?.data;
  },

  getDonors: async (params = {}) => {
    const res = await api.get('/v1/admin/donors', { params });
    return res.data;
  },

  getNgos: async (params = {}) => {
    const res = await api.get('/v1/admin/ngos', { params });
    return res.data;
  },

  verifyNgo: async (id, data) => {
    const res = await api.patch(`/v1/admin/verify-ngo/${id}`, data);
    return res.data?.data;
  },

  updateUserStatus: async (id, data) => {
    const res = await api.patch(`/v1/admin/users/${id}/status`, data);
    return res.data?.data;
  },

  getCouriers: async (params = {}) => {
    const res = await api.get('/v1/admin/couriers', { params });
    return res.data;
  },

  getDonations: async (params = {}) => {
    const res = await api.get('/v1/admin/donations', { params });
    return res.data;
  },

  getRequests: async (params = {}) => {
    const res = await api.get('/v1/admin/requests', { params });
    return res.data;
  },

  getAssignments: async (params = {}) => {
    const res = await api.get('/v1/admin/assignments', { params });
    return res.data;
  },

  getFoodSafety: async (params = {}) => {
    const res = await api.get('/v1/admin/food-safety', { params });
    return res.data;
  },

  getFeedback: async (params = {}) => {
    const res = await api.get('/v1/admin/feedback', { params });
    return res.data;
  },

  deleteFeedback: async (id) => {
    const res = await api.delete(`/v1/admin/feedback/${id}`);
    return res.data?.data;
  },

  toggleFeedbackVisibility: async (id, isVisible) => {
    const res = await api.patch(`/v1/admin/feedback/${id}/visibility`, { isVisible });
    return res.data?.data;
  },
};

