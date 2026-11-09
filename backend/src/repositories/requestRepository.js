import { DonationRequest } from '../models/DonationRequest.js';

export const requestRepository = {
  create: (data, session = null) => {
    const opts = session ? { session } : {};
    return DonationRequest.create([data], opts).then((res) => res[0]);
  },

  findById: (id) =>
    DonationRequest.findById(id)
      .populate('donation')
      .populate('ngo', 'name email phone')
      .populate('donorDecision.decidedBy', 'name role'),

  findByDonationAndNgo: (donationId, ngoId) =>
    DonationRequest.findOne({ donation: donationId, ngo: ngoId }),

  findPaginated: (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
    return Promise.all([
      DonationRequest.find(filter)
        .populate('donation')
        .populate('ngo', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      DonationRequest.countDocuments(filter),
    ]);
  },

  updateById: (id, updates, session = null) => {
    const opts = { new: true, runValidators: true, ...(session && { session }) };
    return DonationRequest.findByIdAndUpdate(id, updates, opts);
  },
};

