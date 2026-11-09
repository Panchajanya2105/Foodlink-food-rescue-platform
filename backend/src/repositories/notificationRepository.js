import { Notification } from '../models/Notification.js';

export const notificationRepository = {
  create: (data) => Notification.create(data),

  findPaginatedByRecipient: (recipientId, { skip = 0, limit = 20 } = {}) => {
    return Promise.all([
      Notification.find({ recipient: recipientId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Notification.countDocuments({ recipient: recipientId }),
      Notification.countDocuments({ recipient: recipientId, isRead: false }),
    ]);
  },

  markAsRead: (notificationId, recipientId) =>
    Notification.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { isRead: true, readAt: new Date() },
      { new: true }
    ),

  markAllAsRead: (recipientId) =>
    Notification.updateMany({ recipient: recipientId, isRead: false }, { isRead: true, readAt: new Date() }),
};

