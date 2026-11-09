import { Donation } from '../models/Donation.js';
import { FoodSafetyChecklist } from '../models/FoodSafetyChecklist.js';
import { StatusHistory } from '../models/StatusHistory.js';

export const donationRepository = {
  create: (data, session = null) => {
    const opts = session ? { session } : {};
    return Donation.create([data], opts).then((res) => res[0]);
  },

  findById: (id) =>
    Donation.findById(id)
      .populate('donor', 'name email phone')
      .populate('recipientNGO', 'name email phone')
      .populate('safetyChecklist'),

  findPaginated: (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
    return Promise.all([
      Donation.find(filter)
        .populate('donor', 'name email phone')
        .populate('recipientNGO', 'name email phone')
        .populate('safetyChecklist')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Donation.countDocuments(filter),
    ]);
  },

  updateById: (id, updates, session = null) => {
    const opts = { new: true, runValidators: true, ...(session && { session }) };
    return Donation.findByIdAndUpdate(id, updates, opts);
  },

  createChecklist: (data, session = null) => {
    const opts = session ? { session } : {};
    return FoodSafetyChecklist.create([data], opts).then((res) => res[0]);
  },

  findChecklistByDonationId: (donationId) => FoodSafetyChecklist.findOne({ donation: donationId }),

  recordStatusHistory: (data, session = null) => {
    const opts = session ? { session } : {};
    return StatusHistory.create([data], opts).then((res) => res[0]);
  },

  getStatusHistoryByDonationId: (donationId) =>
    StatusHistory.find({ donation: donationId }).populate('actor', 'name role email').sort({ createdAt: -1 }),

  findNearbyAvailable: (coordinates, maxDistanceMeters = 25000, category = null) => {
    const query = {
      status: 'available',
      pickupDeadline: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };
    if (category) query.category = category;
    return Donation.find(query).populate('donor', 'name email phone').limit(20);
  },
};

