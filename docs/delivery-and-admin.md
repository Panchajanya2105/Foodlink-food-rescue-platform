# Foodlink – Phase 6: Delivery Partner & Platform Administration

## 1. Overview & Architecture

Phase 6 implements the complete food rescue transit operations and centralized platform administration for **Foodlink**. It connects verified non-profit claims with volunteer couriers and equips administrators with governance, verification, and audit tools.

All components strictly adhere to the project constraints:
- **100% JavaScript (ESM)** and JSX (strictly no TypeScript, no `.ts` or `.tsx` files).
- **Leaflet & OpenStreetMap** mapping with OSRM route estimation and an automated distance fallback. No paid or commercial mapping APIs.
- **Atomic state transitions** preventing duplicate claims and race conditions.
- **Secure HttpOnly cookie authentication** with rigorous role-based access control (`authorize('delivery')`, `authorize('admin')`).
- **No live GPS tracking** (per system specification).

---

## 2. Part A – Delivery Partner System

### 2.1 Dedicated Pages & Views

| Route | Component | Purpose |
|---|---|---|
| `/delivery/dashboard` | `DeliveryDashboardPage.jsx` | Real-time mission overview, active delivery tracker, duty status switch, impact statistics. |
| `/delivery/available` | `AvailableTasksPage.jsx` | Open surplus food batches awaiting transport with distance, category filter, and atomic claim modal. |
| `/delivery/tasks` | `MyTasksPage.jsx` | Active missions assigned to the courier with status filters (`pending pickup`, `in_transit`) and cancellation controls. |
| `/delivery/tasks/:id` | `TaskDetailPage.jsx` | Full dispatch console: Leaflet route map, food handling specifications, 2-step verification forms (pickup & delivery). |
| `/delivery/history` | `DeliveryHistoryPage.jsx` | Archive of completed rescue trips, drop-off timestamps, receiver signoffs, and meals delivered. |
| `/delivery/feedback` | `DeliveryFeedbackPage.jsx` | Community ratings and reviews received from food donors and partner NGOs. |
| `/delivery/notifications` | `DeliveryNotificationsPage.jsx` | Real-time dispatch alerts, donor approvals, and operational updates with mark-read support. |
| `/delivery/profile` | `DeliveryProfilePage.jsx` | Courier logistics settings: vehicle type, insulated container toggle, payload capacity, and operating radius. |

---

### 2.2 Sequential Delivery State Machine

Assignments follow a strict, irreversible state progression:

```
[Pending Unassigned] ──(Atomic Claim)──> [Accepted / Assigned]
                                               │
                                     (Confirm Pickup Form)
                                     - Recorded Temp (°C)
                                     - Packaging & Seal Intact
                                     - Donor Signoff Name
                                               │
                                               ▼
                                         [In Transit]
                                               │
                                     (Confirm Delivery Form)
                                     - Recorded Temp (°C)
                                     - Packaging Intact
                                     - NGO Receiver Signoff
                                               │
                                               ▼
                                         [Completed]
```

1. **Auto-Dispatch Creation**:
   When a donor approves an NGO request with `deliveryPreference: 'volunteer_delivery'`, a `DeliveryAssignment` document is created in `status: 'pending'` with unassigned courier reference.
2. **Atomic Claim**:
   Couriers accept assignments via `PATCH /api/v1/assignments/:id/claim`. The backend runs an atomic update:
   `DeliveryAssignment.findOneAndUpdate({ _id, status: 'pending', deliveryPartner: null })`.
   If another courier attempts to claim the same mission concurrently, the query fails and returns `409 Conflict`.
3. **Food Safety Pickup Verification**:
   The courier records the actual food temperature (°C), verifies seal integrity, and captures the donor representative's signoff name. The assignment status advances to `in_transit` and the donation status advances to `picked_up`.
4. **NGO Receipt Confirmation**:
   At the shelter, the courier records drop-off temperature, verifies container intactness, and captures the NGO receiver's name. The assignment is locked as `completed`, the donation is marked `delivered`, and courier completed trip counters increment.
5. **Pre-Pickup Release / Cancellation**:
   If a courier encounters an emergency before pickup, they can release the task via `PATCH /api/v1/assignments/:id/cancel`. The assignment reverts to `pending` (unassigned) and the donation reverts to `matched`, allowing another courier to rescue the batch before expiry.

---

### 2.3 Interactive Mapping & Route Estimation

Located in `Frontend/src/components/ui/MapComponent.jsx`:
- **OpenStreetMap Tiles**: Rendered using standard Leaflet raster tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Custom Hardware Pins**: CSS-based SVG pins for Pickup (**P** in Forest Green) and Destination (**D** in Sky Blue) with popup labels.
- **OSRM Public Routing API**: Queries `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}`.
- **Graceful Offline Fallback**: If OSRM is unreachable or rate-limited, an automated timeout (2.5s) falls back to a dashed geodesic polyline and calculates distance via the Haversine formula.

---

## 3. Part B – Platform Administration

### 3.1 Dedicated Admin Pages & Views

| Route | Component | Purpose |
|---|---|---|
| `/admin/dashboard` | `AdminDashboardPage.jsx` | High-level system health, pending NGO verification alert, aggregate meal/CO2 counters, module shortcuts. |
| `/admin/verifications` | `AdminNgoVerificationPage.jsx` | NGO credential verification queue: audit tax ID, registration, capacity, and approve or reject with feedback. |
| `/admin/donors` | `AdminDonorsPage.jsx` | Donor directory with total donations count, contact information, and account suspension/reactivation actions. |
| `/admin/couriers` | `AdminCouriersPage.jsx` | Volunteer courier fleet directory with vehicle types, equipment status, and account suspension actions. |
| `/admin/donations` | `AdminDonationsPage.jsx` | Central surplus food inventory across all donors with status, category, deadline, and safety filters. |
| `/admin/requests` | `AdminRequestsPage.jsx` | Central ledger of all NGO claims, requested portions, transport preferences, and fulfillment statuses. |
| `/admin/assignments` | `AdminAssignmentsPage.jsx` | Complete courier dispatch log with origin, destination, courier identity, and delivery status tracking. |
| `/admin/food-safety` | `AdminFoodSafetyPage.jsx` | Audit logs of donor safety checklists, inspection timestamps, preparation windows, and temperature controls. |
| `/admin/analytics` | `AdminAnalyticsPage.jsx` | Quantitative ESG impact charts: meals rescued growth trend, category distribution, CO2 avoided. |
| `/admin/feedback` | `AdminFeedbackPage.jsx` | Moderation table of cross-role ratings and comments with administrative deletion capabilities. |
| `/admin/settings` | `AdminSettingsPage.jsx` | Global configuration: pickup grace period hours, maximum matching radius, and platform maintenance mode. |

---

### 3.2 NGO Verification & Credentialing Workflow

1. Unverified NGOs register with tax exemption details, organization type, and daily serving capacity.
2. Unverified NGOs cannot request restricted donations (enforced server-side with `requireVerified` middleware returning `403 Forbidden`).
3. Administrators review submissions in `/admin/verifications`.
4. **Approval**: Sets `verificationStatus: 'verified'`, `isVerified: true`, and updates the user's account to `verified`.
5. **Rejection**: Sets `verificationStatus: 'rejected'` and requires a mandatory `rejectionReason` that is stored and displayed to the non-profit.

---

### 3.3 Security & Account Governance

- **Authorization Guards**: Server-side routes are protected by `authenticate` and `authorize('admin')`.
- **Account Status Validation**: Any user with `accountStatus: 'suspended'` is blocked by the auth middleware with `403 Forbidden` from initiating any platform operations.
- **Tamper Resistance**: Completed delivery assignments cannot be reopened or edited.

---

## 4. Test Verification & Results

### 4.1 Backend Test Suite (`Vitest`)

All 7 test suites pass with 101 tests passing:

```
 ✓ src/tests/deliveryAndAdmin.test.js (14 tests)
   ✓ Part A: Delivery Partner Lifecycle > 1. Lists available open delivery tasks for couriers
   ✓ Part A: Delivery Partner Lifecycle > 2. Courier 1 claims the open assignment atomically
   ✓ Part A: Delivery Partner Lifecycle > 3. Concurrency Protection: Courier 2 cannot claim an already accepted assignment
   ✓ Part A: Delivery Partner Lifecycle > 4. Courier Ownership: Courier 2 cannot update Courier 1 assignment
   ✓ Part A: Delivery Partner Lifecycle > 5. Courier 1 confirms pickup with temperature check and donor signoff
   ✓ Part A: Delivery Partner Lifecycle > 6. Courier 1 confirms delivery receipt with NGO coordinator signoff
   ✓ Part A: Delivery Partner Lifecycle > 7. Completed assignment cannot be improperly altered or completed again
   ✓ Part A: Delivery Partner Lifecycle > 8. Courier analytics reflects completed trip and rescued meals
   ✓ Part A: Delivery Partner Lifecycle > 9. Safe cancellation releases task back to pending if cancelled before pickup
   ✓ Part B: Administrator Operations > 1. Non-admin users are denied access to admin endpoints (403 Forbidden)
   ✓ Part B: Administrator Operations > 2. Admin gets platform-wide operational overview
   ✓ Part B: Administrator Operations > 3. Admin can audit and verify an NGO account
   ✓ Part B: Administrator Operations > 4. Admin can suspend and reactivate user accounts
   ✓ Part B: Administrator Operations > 5. Admin lists donations, requests, assignments, food safety checklists and manages feedback
 ✓ src/tests/ngoMatching.test.js (16 tests)
 ✓ src/tests/auth.test.js (18 tests)
 ✓ src/tests/api.test.js (27 tests)
 ✓ src/tests/donations.test.js (12 tests)
 ✓ src/tests/models.test.js (11 tests)
 ✓ src/tests/health.test.js (3 tests)

Test Files  7 passed (7)
Tests       101 passed (101)
```

### 4.2 Frontend Test Suite (`Vitest`)

All 4 client test suites pass with 15 tests passing:

```
 ✓ src/tests/phase6DeliveryAdmin.test.jsx (5 tests)
   ✓ 1. should define all Delivery Partner routes
   ✓ 2. should define all Administrator routes
   ✓ 3. should verify all deliveryService API methods exist
   ✓ 4. should verify all adminService API methods exist
   ✓ 5. should have delivery and admin role constants registered
 ✓ src/tests/phase5Ngo.test.jsx (3 tests)
 ✓ src/tests/foundation.test.jsx (4 tests)
 ✓ src/tests/phase4Donor.test.jsx (3 tests)

Test Files  4 passed (4)
Tests       15 passed (15)
```

### 4.3 Production Client Build (`Vite`)

```
dist/index.html                     1.00 kB │ gzip:   0.59 kB
dist/assets/index-KtYmfq7q.css     68.45 kB │ gzip:  15.33 kB
dist/assets/index-Bdp-OkON.js   1,371.60 kB │ gzip: 359.81 kB
✓ built in 59.81s (0 errors)
```

