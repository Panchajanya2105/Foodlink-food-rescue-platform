import { User } from '../models/User.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DeliveryProfile } from '../models/DeliveryProfile.js';

export const userRepository = {
  findById: (id) => User.findById(id),

  findByEmail: (email, includePassword = false) => {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+password');
    return query;
  },

  create: (userData) => User.create(userData),

  updateById: (id, updates) => User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),

  findUsers: (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
    return Promise.all([
      User.find(filter).skip(skip).limit(limit).sort(sort).select('-password'),
      User.countDocuments(filter),
    ]);
  },

  findNgoProfileByUserId: (userId) => NGOProfile.findOne({ user: userId }),

  createNgoProfile: (data) => NGOProfile.create(data),

  updateNgoProfileByUserId: (userId, updates) =>
    NGOProfile.findOneAndUpdate({ user: userId }, updates, { new: true, runValidators: true }),

  findDeliveryProfileByUserId: (userId) => DeliveryProfile.findOne({ user: userId }),

  createDeliveryProfile: (data) => DeliveryProfile.create(data),

  updateDeliveryProfileByUserId: (userId, updates) =>
    DeliveryProfile.findOneAndUpdate({ user: userId }, updates, { new: true, runValidators: true }),
};

