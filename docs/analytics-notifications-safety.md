# Foodlink – Phase 7 Technical Documentation
## Food Impact Analytics, Notifications & Supporting Features

### 1. Architectural Overview

Phase 7 finalizes the end-to-end community food rescue management platform by providing:
1. **Accurate Food Impact Analytics**: Real database metrics for rescued meals, emissions avoided, category breakdowns, monthly trends, and role-specific performance indicators.
2. **Strict Impact Verification**: **Never counts unapproved, active, or undelivered donations as rescued.** Only food listings with `status === 'delivered'` contribute to rescued meals and CO₂ calculations.
3. **In-App Notification Engine**: Real-time event notifications for donation requests, approvals/rejections, NGO verifications, courier dispatch, pickup confirmations, and deliveries with read/unread tracking and polling.
4. **Transparent Feedback & Moderation**: Bilateral rating and review submission for completed donations with administrative moderation (visibility toggling and deletion).
5. **Comprehensive Food Safety SOPs**: Consolidated resource guide detailing handling principles, storage temperature zones, allergen alerts, packaging standards, and statutory disclaimers.

---

### 2. Food Impact Analytics Engine

#### 2.1 Rescued Calculation Rules
- **Rescued Meals**: Derived exclusively from donations where `status = 'delivered'`.
  $$\text{Total Rescued Meals} = \sum_{\text{delivered}} (\text{servingsEstimate} \lor \text{quantity})$$
- **Total Kilograms Rescued**: Calculated as $\text{Total Rescued Meals} \times 0.4\text{ kg/meal}$.
- **CO₂ Offset Equivalent**: Calculated as $\text{Total Kilograms Rescued} \times 2.5\text{ kg CO}_2\text{e/kg}$.
- **Delivery Completion Rate**:
  $$\text{Completion Rate} = \frac{\text{Completed Assignments}}{\text{Total Assigned Tasks}} \times 100\%$$

#### 2.2 Endpoint Contracts

| Method | Route | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics` | Platform-wide ESG impact, category breakdown, monthly trends | Public / All |
| `GET` | `/api/v1/analytics/donor` | Donor-specific listings, delivered portions, monthly trends | Donor, Admin |
| `GET` | `/api/v1/analytics/ngo` | NGO-specific received portions, requests, monthly history | NGO, Admin |
| `GET` | `/api/v1/analytics/delivery` | Courier assignments, completed trips, meals transported | Delivery, Admin |

---

### 3. In-App Notifications Engine

- **Architecture**: Periodic polling via `useNotifications` React hook (no WebSockets or external dependencies).
- **Notification Types**:
  - `request_received`: Sent to donor when NGO submits a claim.
  - `request_approved` / `request_rejected`: Sent to NGO upon donor's decision.
  - `verification_update`: Sent to NGO when administrator verifies or rejects registration.
  - `delivery_assigned`: Sent to courier, donor, and NGO when volunteer accepts transport.
  - `picked_up`: Sent to donor and recipient NGO upon courier temperature verification and signoff.
  - `delivered`: Sent to donor and NGO when shelter accepts food.
  - `safety_alert`: Sent to donor when a listing expires or pickup deadline passes.

#### 3.1 Notification API Routes
- `GET /api/v1/notifications`: Paginated notifications with `unreadCount`.
- `PATCH /api/v1/notifications/:id/read`: Mark single notification as read.
- `PATCH /api/v1/notifications/read-all` & `/mark-all-read`: Mark all notifications as read.

---

### 4. Community Feedback & Moderation

- **Integrity Constraints**:
  - Feedback can only be submitted on accepted/completed rescue operations (`matched`, `assigned`, `picked_up`, `delivered`).
  - Unique composite index `{ donation: 1, submittedBy: 1 }` strictly prevents duplicate submissions.
  - Ratings include overall score (1–5), food quality (1–5), punctuality (1–5), and comment.
- **Administrative Moderation**:
  - `PATCH /api/v1/feedback/:id/visibility` & `/api/v1/admin/feedback/:id/visibility`: Allows admins to toggle `isVisible: true/false`.
  - Non-administrators are filtered to see only `isVisible: true` reviews.
  - `DELETE /api/v1/admin/feedback/:id`: Allows administrators to delete inappropriate reviews.

---

### 5. Food Safety & Surplus Handling Guide

Located at `/food-safety`:
1. **Safe Handling Principles**: Personal hygiene, 20-second handwashing, glove mandates, cross-contamination prevention, commercial kitchen requirements.
2. **Storage Guidance**: Deep Frozen ($\le -18^\circ\text{C}$), Cold Holding ($0–4^\circ\text{C}$), Ambient ($15–22^\circ\text{C}$), Hot Holding ($\ge 60^\circ\text{C}$), and 2-hour Danger Zone limits.
3. **The 9 Major Allergens**: Milk, Eggs, Fish, Crustacean Shellfish, Tree Nuts, Peanuts, Wheat, Soybeans, Sesame.
4. **Expiry Definitions**: "Best Before" (quality standard) vs. "Use By" (safety deadline).
5. **Packaging Protocols**: Food-grade single-use pans, tamper-evident tape, temperature labeling.
6. **Handover Checklist**: Driver thermometer verification, donor staff signoff, direct transport, shelter receiving inspection.
7. **Statutory Legal Disclaimer**: Explicitly informs users that Foodlink safety checklists provide educational and operational structure, and do not replace statutory local health inspections, food business licensing, or legal liability frameworks.

---

### 6. Automated Verification Results

- **Backend Tests**: 8 test suites, 112/112 tests passing (`phase7Analytics.test.js`, `deliveryAndAdmin.test.js`, `ngoMatching.test.js`, `auth.test.js`, `api.test.js`, `donations.test.js`, `models.test.js`, `health.test.js`).
- **Frontend Tests**: 5 test suites, 20/20 tests passing (`phase7Frontend.test.jsx`, `phase6DeliveryAdmin.test.jsx`, `phase5Ngo.test.jsx`, `phase4Donor.test.jsx`, `foundation.test.jsx`).
- **Production Build**: Clean Vite production bundle (`dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`) built in 1m 8s with zero compile errors.

