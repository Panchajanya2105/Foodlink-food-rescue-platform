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

export const FOOD_CATEGORY_LABELS = Object.freeze({
  cooked_meals: 'Cooked Meals',
  bakery: 'Bakery & Bread',
  produce: 'Fresh Produce',
  dairy: 'Dairy & Eggs',
  packaged: 'Packaged Pantry Goods',
  packaged_food: 'Packaged Food',
  raw_ingredients: 'Raw Ingredients',
  beverages: 'Beverages',
  other: 'Other Food',
});

export const STORAGE_REQUIREMENTS = Object.freeze({
  AMBIENT: 'ambient',
  REFRIGERATED: 'refrigerated',
  FROZEN: 'frozen',
  HOT_HOLDING: 'hot_holding',
  HOT_INSULATED: 'hot_insulated',
});

export const STORAGE_LABELS = Object.freeze({
  ambient: 'Ambient (Room Temperature)',
  refrigerated: 'Refrigerated (0°C to 4°C)',
  frozen: 'Frozen (≤ -18°C)',
  hot_holding: 'Hot Holding (≥ 60°C)',
  hot_insulated: 'Hot Insulated (≥ 60°C)',
});

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn',
});

export const REQUEST_STATUS_LABELS = Object.freeze({
  pending: 'Under Review',
  approved: 'Approved / Claimed',
  rejected: 'Declined',
  cancelled: 'Cancelled',
  withdrawn: 'Withdrawn',
});

