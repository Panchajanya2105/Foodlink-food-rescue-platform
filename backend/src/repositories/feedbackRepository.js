import { Feedback } from '../models/Feedback.js';

export const feedbackRepository = {
  create: (data) => Feedback.create(data),

  findPaginated: (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
    return Promise.all([
      Feedback.find(filter)
        .populate('submittedBy', 'name role')
        .populate('recipient', 'name role')
        .populate('donation', 'foodName')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Feedback.countDocuments(filter),
    ]);
  },
};

