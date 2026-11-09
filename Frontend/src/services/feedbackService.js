import api from './api.js';

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const res = await api.post('/v1/feedback', feedbackData);
    return res.data?.data;
  },

  getDonationFeedback: async (donationId) => {
    const res = await api.get('/v1/feedback', { params: { donationId } });
    return res.data?.data || [];
  },

  getMyFeedback: async () => {
    const res = await api.get('/v1/feedback', { params: { mine: 'true' } });
    return res.data?.data || [];
  },

  getAllFeedback: async (params = {}) => {
    const res = await api.get('/v1/feedback', { params });
    return res.data;
  },

  toggleVisibility: async (feedbackId, isVisible) => {
    const res = await api.patch(`/v1/feedback/${feedbackId}/visibility`, { isVisible });
    return res.data?.data;
  },

  deleteFeedback: async (feedbackId) => {
    const res = await api.delete(`/v1/feedback/${feedbackId}`);
    return res.data?.data;
  },
};

