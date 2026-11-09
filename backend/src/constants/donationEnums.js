export const DONATION_STATUS = Object.freeze({
  DRAFT: 'draft',
  AVAILABLE: 'available',
  REQUESTED: 'requested',
  MATCHED: 'matched',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

export const FOOD_CATEGORIES = Object.freeze({
  COOKED_MEALS: 'cooked_meals',
  BAKERY: 'bakery',
  PRODUCE: 'produce',
  DAIRY: 'dairy',
  PACKAGED: 'packaged',
  PACKAGED_FOOD: 'packaged_food',
  RAW_INGREDIENTS: 'raw_ingredients',
  BEVERAGES: 'beverages',
  OTHER: 'other',
});

export const STORAGE_REQUIREMENTS = Object.freeze({
  AMBIENT: 'ambient',
  REFRIGERATED: 'refrigerated',
  FROZEN: 'frozen',
  HOT_HOLDING: 'hot_holding',
  HOT_INSULATED: 'hot_insulated',
});

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn',
});

export const ASSIGNMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

export const NOTIFICATION_TYPES = Object.freeze({
  DONATION_POSTED: 'donation_posted',
  MATCH_FOUND: 'match_found',
  REQUEST_RECEIVED: 'request_received',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_REJECTED: 'request_rejected',
  DELIVERY_ASSIGNED: 'delivery_assigned',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  SAFETY_ALERT: 'safety_alert',
  VERIFICATION_UPDATE: 'verification_update',
  SYSTEM: 'system',
});

