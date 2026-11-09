export const ROLES = Object.freeze({
  DONOR: 'donor',
  NGO: 'ngo',
  DELIVERY: 'delivery',
  ADMIN: 'admin',
});

export const USER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.DONOR]: 'Food Donor',
  [ROLES.NGO]: 'NGO Partner',
  [ROLES.DELIVERY]: 'Delivery Partner',
  [ROLES.ADMIN]: 'Platform Admin',
});

export const ROLE_COLORS = Object.freeze({
  [ROLES.DONOR]: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [ROLES.NGO]: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  [ROLES.DELIVERY]: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  [ROLES.ADMIN]: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
});

