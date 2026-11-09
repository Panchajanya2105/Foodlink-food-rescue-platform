import { notificationRepository } from '../repositories/notificationRepository.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';

export const getNotifications = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const [notifications, total, unreadCount] = await notificationRepository.findPaginatedByRecipient(
      req.user._id,
      pagination
    );

    return res.json({
      status: 'success',
      message: 'Notifications retrieved',
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const updated = await notificationRepository.markAsRead(req.params.id, req.user._id);
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationRepository.markAllAsRead(req.user._id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

