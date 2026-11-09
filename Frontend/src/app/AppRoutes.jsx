import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

// Public Pages
import { HomePage } from '../pages/HomePage.jsx';
import { AboutPage } from '../pages/AboutPage.jsx';
import { HowItWorksPage } from '../pages/HowItWorksPage.jsx';
import { AvailableFoodPage } from '../pages/AvailableFoodPage.jsx';
import { FoodDetailsPage } from '../pages/FoodDetailsPage.jsx';
import { FoodSafetyResourcesPage } from '../pages/FoodSafetyResourcesPage.jsx';
import { ContactPage } from '../pages/ContactPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../pages/ResetPasswordPage.jsx';

// Status & Guard Pages
import { UnauthorizedPage } from '../pages/UnauthorizedPage.jsx';
import { ForbiddenPage } from '../pages/ForbiddenPage.jsx';
import { PendingVerificationPage } from '../pages/PendingVerificationPage.jsx';
import { SuspendedAccountPage } from '../pages/SuspendedAccountPage.jsx';

// Donor Experience Pages
import { DonorDashboardPage } from '../pages/donor/DonorDashboardPage.jsx';
import { CreateDonationPage } from '../pages/donor/CreateDonationPage.jsx';
import { MyDonationsPage } from '../pages/donor/MyDonationsPage.jsx';
import { DonationDetailPage } from '../pages/donor/DonationDetailPage.jsx';
import { DonorRequestsPage } from '../pages/donor/DonorRequestsPage.jsx';
import { DonorHistoryPage } from '../pages/donor/DonorHistoryPage.jsx';
import { DonorFeedbackPage } from '../pages/donor/DonorFeedbackPage.jsx';
import { DonorNotificationsPage } from '../pages/donor/DonorNotificationsPage.jsx';
import { DonorProfilePage } from '../pages/donor/DonorProfilePage.jsx';

// Phase 5 NGO Management Pages
import { NgoDashboardPage } from '../pages/ngo/NgoDashboardPage.jsx';
import { RecommendedFoodPage } from '../pages/ngo/RecommendedFoodPage.jsx';
import { BrowseDonationsPage } from '../pages/ngo/BrowseDonationsPage.jsx';
import { NgoDonationDetailPage } from '../pages/ngo/NgoDonationDetailPage.jsx';
import { MyRequestsPage } from '../pages/ngo/MyRequestsPage.jsx';
import { AcceptedDonationsPage } from '../pages/ngo/AcceptedDonationsPage.jsx';
import { NgoDeliveriesPage } from '../pages/ngo/NgoDeliveriesPage.jsx';
import { NgoFeedbackPage } from '../pages/ngo/NgoFeedbackPage.jsx';
import { NgoNotificationsPage } from '../pages/ngo/NgoNotificationsPage.jsx';
import { NgoProfilePage } from '../pages/ngo/NgoProfilePage.jsx';

// Phase 6 Delivery Partner Pages
import { DeliveryDashboardPage } from '../pages/delivery/DeliveryDashboardPage.jsx';
import { AvailableTasksPage } from '../pages/delivery/AvailableTasksPage.jsx';
import { MyTasksPage } from '../pages/delivery/MyTasksPage.jsx';
import { TaskDetailPage } from '../pages/delivery/TaskDetailPage.jsx';
import { DeliveryHistoryPage } from '../pages/delivery/DeliveryHistoryPage.jsx';
import { DeliveryFeedbackPage } from '../pages/delivery/DeliveryFeedbackPage.jsx';
import { DeliveryNotificationsPage } from '../pages/delivery/DeliveryNotificationsPage.jsx';
import { DeliveryProfilePage } from '../pages/delivery/DeliveryProfilePage.jsx';

// Phase 6 Administrator Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';
import { AdminNgoVerificationPage } from '../pages/admin/AdminNgoVerificationPage.jsx';
import { AdminDonorsPage } from '../pages/admin/AdminDonorsPage.jsx';
import { AdminCouriersPage } from '../pages/admin/AdminCouriersPage.jsx';
import { AdminDonationsPage } from '../pages/admin/AdminDonationsPage.jsx';
import { AdminRequestsPage } from '../pages/admin/AdminRequestsPage.jsx';
import { AdminAssignmentsPage } from '../pages/admin/AdminAssignmentsPage.jsx';
import { AdminFoodSafetyPage } from '../pages/admin/AdminFoodSafetyPage.jsx';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage.jsx';
import { AdminFeedbackPage } from '../pages/admin/AdminFeedbackPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes Wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.HOW_IT_WORKS} element={<HowItWorksPage />} />
        <Route path={ROUTES.AVAILABLE_FOOD} element={<AvailableFoodPage />} />
        <Route path={ROUTES.FOOD_DISCOVERY} element={<AvailableFoodPage />} />
        <Route path={ROUTES.FOOD_DETAILS} element={<FoodDetailsPage />} />
        <Route path="/food/:id" element={<FoodDetailsPage />} />
        <Route path={ROUTES.FOOD_SAFETY} element={<FoodSafetyResourcesPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/pending-verification" element={<PendingVerificationPage />} />
        <Route path="/suspended" element={<SuspendedAccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Role Dashboard Route Groups Wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* Phase 4 Complete Donor Experience Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DONOR]} />}>
          <Route path="/donor" element={<Navigate to={ROUTES.DONOR_DASHBOARD} replace />} />
          <Route path={ROUTES.DONOR_DASHBOARD} element={<DonorDashboardPage />} />
          <Route path={ROUTES.DONOR_NEW_DONATION} element={<CreateDonationPage />} />
          <Route path={ROUTES.DONOR_DONATIONS} element={<MyDonationsPage />} />
          <Route path={ROUTES.DONOR_DONATION_DETAILS} element={<DonationDetailPage />} />
          <Route path={ROUTES.DONOR_REQUESTS} element={<DonorRequestsPage />} />
          <Route path={ROUTES.DONOR_HISTORY} element={<DonorHistoryPage />} />
          <Route path={ROUTES.DONOR_FEEDBACK} element={<DonorFeedbackPage />} />
          <Route path={ROUTES.DONOR_NOTIFICATIONS} element={<DonorNotificationsPage />} />
          <Route path={ROUTES.DONOR_PROFILE} element={<DonorProfilePage />} />
        </Route>

        {/* NGO Protected Routes (Phase 5) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.NGO]} />}>
          <Route path="/ngo" element={<Navigate to={ROUTES.NGO_DASHBOARD} replace />} />
          <Route path={ROUTES.NGO_DASHBOARD} element={<NgoDashboardPage />} />
          <Route path={ROUTES.NGO_RECOMMENDED} element={<RecommendedFoodPage />} />
          <Route path={ROUTES.NGO_DONATIONS} element={<BrowseDonationsPage />} />
          <Route path={ROUTES.NGO_AVAILABLE_FOOD} element={<BrowseDonationsPage />} />
          <Route path={ROUTES.NGO_DONATION_DETAILS} element={<NgoDonationDetailPage />} />
          <Route path={ROUTES.NGO_REQUESTS} element={<MyRequestsPage />} />
          <Route path={ROUTES.NGO_ACCEPTED} element={<AcceptedDonationsPage />} />
          <Route path={ROUTES.NGO_DELIVERIES} element={<NgoDeliveriesPage />} />
          <Route path={ROUTES.NGO_FEEDBACK} element={<NgoFeedbackPage />} />
          <Route path={ROUTES.NGO_NOTIFICATIONS} element={<NgoNotificationsPage />} />
          <Route path={ROUTES.NGO_PROFILE} element={<NgoProfilePage />} />
        </Route>

        {/* Delivery Partner Protected Routes (Phase 6) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY]} />}>
          <Route path="/delivery" element={<Navigate to={ROUTES.DELIVERY_DASHBOARD} replace />} />
          <Route path={ROUTES.DELIVERY_DASHBOARD} element={<DeliveryDashboardPage />} />
          <Route path={ROUTES.DELIVERY_AVAILABLE} element={<AvailableTasksPage />} />
          <Route path={ROUTES.DELIVERY_TASKS} element={<MyTasksPage />} />
          <Route path={ROUTES.DELIVERY_TASK_DETAIL} element={<TaskDetailPage />} />
          <Route path={ROUTES.DELIVERY_HISTORY} element={<DeliveryHistoryPage />} />
          <Route path={ROUTES.DELIVERY_FEEDBACK} element={<DeliveryFeedbackPage />} />
          <Route path={ROUTES.DELIVERY_NOTIFICATIONS} element={<DeliveryNotificationsPage />} />
          <Route path={ROUTES.DELIVERY_PROFILE} element={<DeliveryProfilePage />} />
        </Route>

        {/* Administrator Protected Routes (Phase 6) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_DONORS} element={<AdminDonorsPage />} />
          <Route path={ROUTES.ADMIN_VERIFICATIONS} element={<AdminNgoVerificationPage />} />
          <Route path={ROUTES.ADMIN_COURIERS} element={<AdminCouriersPage />} />
          <Route path={ROUTES.ADMIN_DONATIONS} element={<AdminDonationsPage />} />
          <Route path={ROUTES.ADMIN_REQUESTS} element={<AdminRequestsPage />} />
          <Route path={ROUTES.ADMIN_ASSIGNMENTS} element={<AdminAssignmentsPage />} />
          <Route path={ROUTES.ADMIN_FOOD_SAFETY} element={<AdminFoodSafetyPage />} />
          <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
          <Route path={ROUTES.ADMIN_FEEDBACK} element={<AdminFeedbackPage />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
