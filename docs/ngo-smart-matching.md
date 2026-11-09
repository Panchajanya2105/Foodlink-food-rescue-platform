# Foodlink Phase 5 Technical Specification: NGO Dashboard & Smart Matching Engine

## 1. Executive Summary

Phase 5 of the Foodlink Smart Food Donation, NGO Matching, and Food Rescue Management Platform implements the full NGO experience, including an explainable rule-based matching engine, end-to-end donation request lifecycle, atomic concurrency protections for quantity reservations, administrator-controlled NGO verification, delivery tracking, and mutual post-handover feedback.

The platform deliberately avoids black-box machine learning or third-party AI APIs, instead employing a transparent, multi-factor heuristic scoring algorithm with comprehensive factor breakdown and human-readable explanations.

---

## 2. Explainable Rule-Based Smart Matching Engine

### 2.1 Multi-Factor Scoring Formulation
Each candidate NGO-Donation pairing is scored on a normalized 100-point scale:

$$\text{Score} = S_{\text{verification}} + S_{\text{distance}} + S_{\text{category}} + S_{\text{storage}} + S_{\text{capacity}} + S_{\text{deadline}}$$

Where:
1. **Verification Status ($S_{\text{verification}}$, 10 pts max)**:
   - Mandatory gatekeeper: Organizations with `verificationStatus !== 'verified'` are immediately disqualified ($\text{Score} = 0, \text{eligible} = \text{false}$) from claiming surplus or receiving smart match alerts.
2. **Geographic Proximity ($S_{\text{distance}}$, 30 pts max)**:
   - Calculated using the Haversine great-circle formula between donor and NGO GeoJSON coordinates `[lng, lat]`:
     - $\le 2.0$ km: 30 pts (Priority rapid response zone)
     - $\le 5.0$ km: 25 pts (Local municipal zone)
     - $\le 10.0$ km: 18 pts (Metropolitan radius)
     - $\le 20.0$ km: 12 pts (Regional radius)
     - $> 20.0$ km: 5 pts
3. **Food Category Compatibility ($S_{\text{category}}$, 25 pts max)**:
   - Evaluates whether the donation category (`cooked_meals`, `bakery`, `produce`, `dairy`, `packaged`, `raw_ingredients`) matches the NGO's declared `foodCategoriesAccepted`.
   - Exact match: 25 pts.
   - Unlisted category: 0 pts with advisory note.
4. **Storage & Cold-Chain Compatibility ($S_{\text{storage}}$, 20 pts max)**:
   - Refrigerated perishable surplus: requires `storageCapabilities.hasRefrigeration` (20 pts if equipped; disqualified if lacking).
   - Frozen surplus: requires `storageCapabilities.hasFreezer` (20 pts if equipped; disqualified if lacking).
   - Hot-holding insulated meals: requires `storageCapabilities.hasHotHolding` (20 pts if equipped; 8 pts with immediate distribution warning if lacking).
   - Ambient goods: 20 pts (universal compatibility).
5. **Intake Capacity Margin ($S_{\text{capacity}}$, 10 pts max)**:
   - NGO daily intake capacity $\ge 2 \times$ surplus quantity: 10 pts (Comfortable buffer).
   - NGO capacity $\ge$ surplus quantity: 8 pts (Acceptable fit).
   - NGO capacity $<$ surplus quantity: 3 pts (Partial allocation advisory).
6. **Pickup Deadline Feasibility ($S_{\text{deadline}}$, 5 pts max)**:
   - Compares time remaining until `pickupDeadline` against estimated urban transit time $+ 30$ minute staging buffer:
     - Feasible window: 5 pts.
     - Urgent window ($< \text{buffer}$): 1 pt with urgency alert.

### 2.2 Explainability Output
Every recommendation returns human-readable rationales, such as:
- `[Verified Partner] Certified 501(c)(3) registered non-profit organization.`
- `[Proximity: High Priority] Located within 1.8 km (approx. 10 mins transit).`
- `[Category Match] Explicitly certified to receive Cooked Meals.`
- `[Storage Match] Cold-chain certified: Has active commercial refrigeration units.`
- `[Capacity Margin] Daily capacity of 200 meals comfortably accommodates 30 portions.`
- `[Feasibility Confirmed] Ample pickup window: 5.2 hours remaining.`

---

## 3. NGO Dashboard Architecture

The NGO experience encompasses 10 authenticated pages under `Frontend/src/pages/ngo/`:

| Route | Page Component | Functional Scope |
| :--- | :--- | :--- |
| `/ngo/dashboard` | `NgoDashboardPage.jsx` | Overview metrics, monthly rescue activity chart (Recharts), top smart matches preview, recent claims table. |
| `/ngo/recommended` | `RecommendedFoodPage.jsx` | Ranked smart recommendations with interactive factor breakdown accordion, 6-factor scorecards, and direct claim modal. |
| `/ngo/donations` | `BrowseDonationsPage.jsx` | Full surplus catalog with keyword search, category & storage filters, urgency countdowns, and claim modal. |
| `/ngo/donations/:id` | `NgoDonationDetailPage.jsx` | Food specifications, digital safety checklist certification audit, storage guidelines, and claim action. |
| `/ngo/requests` | `MyRequestsPage.jsx` | Filter tabs (`All`, `Pending`, `Approved`, `Rejected`, `Withdrawn`), status badges, and request withdrawal action. |
| `/ngo/accepted` | `AcceptedDonationsPage.jsx` | Allocated surplus tracking, dispatch details, and post-handover review submission. |
| `/ngo/deliveries` | `NgoDeliveriesPage.jsx` | Live volunteer delivery tracking with 4-step progress stepper (Assigned $\rightarrow$ Picked Up $\rightarrow$ In Transit $\rightarrow$ Delivered). |
| `/ngo/feedback` | `NgoFeedbackPage.jsx` | Community rating score, tabbed feedback views (`All`, `Received`, `Submitted`). |
| `/ngo/notifications` | `NgoNotificationsPage.jsx` | Real-time alerts for claim approvals, rejections, courier pickups, and delivery confirmations with mark-as-read. |
| `/ngo/profile` | `NgoProfilePage.jsx` | Organization details, legal registration/EIN, address, capacity, category preferences, and cold-chain equipment toggles. |

---

## 4. Concurrency Safety & Request Business Rules

### 4.1 Business Rules Enforced
- **Rule 1 (Verification Barrier)**: Unverified NGOs cannot submit requests (`HTTP 403 Forbidden`).
- **Rule 2 (Duplicate Active Request Prevention)**: NGOs cannot submit a new pending request for a listing they already have an active request on (`HTTP 409 Conflict`).
- **Rule 3 (Quantity Boundary)**: Requested quantity cannot exceed available listing quantity (`HTTP 400 Bad Request`).
- **Rule 4 (Past-Deadline & Expiry Guard)**: Requests are blocked on expired or past-deadline donations (`HTTP 400 Bad Request`).
- **Rule 5 (Request Withdrawal)**: An NGO can withdraw an active `pending` request, automatically reverting donation status back to `available` if no other pending claims exist.
- **Rule 6 (Conflicting Approval Auto-Resolution)**: When a donor approves a request inside a MongoDB transaction:
  - Winning request becomes `approved`.
  - Donation becomes `matched` with `recipientNGO = winningRequest.ngo`.
  - All competing pending requests for that donation are automatically updated to `rejected` with explanation: `"Surplus listing has been allocated to another NGO partner."`
  - Automated notifications are dispatched to competing NGOs.

---

## 5. Verification & Test Summary

### 5.1 Backend Test Suites (Vitest + Supertest)
```
✓ src/tests/ngoMatching.test.js (16 tests) - Smart Matching, Requests, Concurrency, Feedback
✓ src/tests/donations.test.js   (12 tests) - Expiry Engine, Food Safety, Public Food Board
✓ src/tests/auth.test.js        (18 tests) - Authentication, HttpOnly Cookies, Security
✓ src/tests/api.test.js         (27 tests) - End-to-End Contracts, Route Protection
✓ src/tests/models.test.js      (11 tests) - Schemas, Geolocation, Pre-save Hooks
✓ src/tests/health.test.js      (3 tests)  - Health & Error Handling

Test Files:  6 passed (6)
Tests:       87 passed (87)
Result:      100% PASS
```

### 5.2 Frontend Test Suites & Build
```
✓ src/tests/phase5Ngo.test.jsx   (3 tests) - NGO Routes, Services & Enums
✓ src/tests/phase4Donor.test.jsx (3 tests) - Public & Donor Routes, Urgency Logic
✓ src/tests/foundation.test.jsx  (4 tests) - Foundation Components & App Mount

Test Files:  3 passed (3)
Tests:       10 passed (10)

Vite Production Build:
✓ 2140 modules transformed.
dist/index.html                     1.00 kB │ gzip:   0.59 kB
dist/assets/index-BInmIjQD.css     50.28 kB │ gzip:   8.36 kB
dist/assets/index-BO4ocrzS.js   1,062.05 kB │ gzip: 286.77 kB
✓ Built in 1m with 0 errors
```

