export const ROUTES = Object.freeze({
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-it-works',
  AVAILABLE_FOOD: '/available-food',
  FOOD_DISCOVERY: '/food-discovery',
  FOOD_DETAILS: '/available-food/:id',
  FOOD_SAFETY: '/food-safety',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Status & Guard Pages
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  PENDING_VERIFICATION: '/pending-verification',
  SUSPENDED: '/suspended',

  // Donor Dashboard Routes
  DONOR_DASHBOARD: '/donor/dashboard',
  DONOR_DONATIONS: '/donor/donations',
  DONOR_NEW_DONATION: '/donor/donations/new',
  DONOR_DONATION_DETAILS: '/donor/donations/:id',
  DONOR_REQUESTS: '/donor/requests',
  DONOR_HISTORY: '/donor/history',
  DONOR_FEEDBACK: '/donor/feedback',
  DONOR_NOTIFICATIONS: '/donor/notifications',
  DONOR_PROFILE: '/donor/profile',

  // NGO Dashboard Routes
  NGO_DASHBOARD: '/ngo/dashboard',
  NGO_RECOMMENDED: '/ngo/recommended',
  NGO_DONATIONS: '/ngo/donations',
  NGO_AVAILABLE_FOOD: '/ngo/available-food',
  NGO_DONATION_DETAILS: '/ngo/donations/:id',
  NGO_REQUESTS: '/ngo/requests',
  NGO_ACCEPTED: '/ngo/accepted',
  NGO_DELIVERIES: '/ngo/deliveries',
  NGO_FEEDBACK: '/ngo/feedback',
  NGO_NOTIFICATIONS: '/ngo/notifications',
  NGO_PROFILE: '/ngo/profile',

  // Delivery Partner Routes
  DELIVERY_DASHBOARD: '/delivery/dashboard',
  DELIVERY_AVAILABLE: '/delivery/available',
  DELIVERY_TASKS: '/delivery/tasks',
  DELIVERY_TASK_DETAIL: '/delivery/tasks/:id',
  DELIVERY_HISTORY: '/delivery/history',
  DELIVERY_FEEDBACK: '/delivery/feedback',
  DELIVERY_NOTIFICATIONS: '/delivery/notifications',
  DELIVERY_PROFILE: '/delivery/profile',

  // Administrator Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DONORS: '/admin/donors',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_COURIERS: '/admin/couriers',
  ADMIN_DONATIONS: '/admin/donations',
  ADMIN_REQUESTS: '/admin/requests',
  ADMIN_ASSIGNMENTS: '/admin/assignments',
  ADMIN_FOOD_SAFETY: '/admin/food-safety',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_FEEDBACK: '/admin/feedback',
  ADMIN_SETTINGS: '/admin/settings',
});
