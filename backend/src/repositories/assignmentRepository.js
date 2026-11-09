import { DeliveryAssignment } from '../models/DeliveryAssignment.js';

export const assignmentRepository = {
  create: (data, session = null) => {
    const opts = session ? { session } : {};
    return DeliveryAssignment.create([data], opts).then((res) => res[0]);
  },

  findById: (id) =>
    DeliveryAssignment.findById(id)
      .populate('donation')
      .populate('deliveryPartner', 'name email phone'),

  findPaginated: (filter = {}, { skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
    return Promise.all([
      DeliveryAssignment.find(filter)
        .populate('donation')
        .populate('deliveryPartner', 'name email phone')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      DeliveryAssignment.countDocuments(filter),
    ]);
  },

  updateById: (id, updates, session = null) => {
    const opts = { new: true, runValidators: true, ...(session && { session }) };
    return DeliveryAssignment.findByIdAndUpdate(id, updates, opts);
  },
};
