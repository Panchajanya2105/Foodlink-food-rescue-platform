# Foodlink Phase 4 Technical Specification: Public Website, Food Discovery & Donor Operations

## 1. Executive Summary

Phase 4 of the Foodlink Smart Food Donation, NGO Matching, and Food Rescue Management Platform delivers the public website, beneficiary food discovery engine, and complete operational donor management dashboard.

The system guarantees food safety and accountability through:
- **Mandatory Food Safety Checklist Certification** prior to listing surplus items.
- **Dynamic Expiry & Urgency Engine** that evaluates pickup deadlines and food expiry timestamps, assigning live urgency classifications (`CRITICAL`, `URGENT`, `MODERATE`, `NORMAL`).
- **Automated Expired Food Locking** preventing NGO claiming or public discovery of past-deadline food.
- **Safe Public Projections** ensuring public and beneficiary viewers can discover nutritious meals without exposing donors' private contacts, exact apartment numbers, or personal phone numbers.
- **Role-Guarded Donor Operations** with ownership barriers blocking cross-donor tampering or unauthorized status mutations.

---

## 2. Public Website Architecture

The public interface provides responsive, food-rescue-themed experiences for community beneficiaries, donors, NGO partners, and volunteers:

### 2.1 Public Pages & Routes
| Path | Page Component | Functional Scope |
| :--- | :--- | :--- |
| `/` | `HomePage.jsx` | Hero CTA, dynamic rescue stats, 4-step pipeline, trust & safety, sample community reviews. |
| `/about` | `AboutPage.jsx` | Foodlink mission, UN SDG 12.3 alignment, FSSAI Surplus Food Regulations (2019) legal shield. |
| `/how-it-works` | `HowItWorksPage.jsx` | 6-stage lifecycle walkthrough with tailored role guides (Donor, NGO, Courier, Beneficiary). |
| `/available-food` | `AvailableFoodPage.jsx` | Searchable food discovery board with category, dietary, and location filtering + urgency badges. |
| `/available-food/:id` | `FoodDetailsPage.jsx` | Public item breakdown, temperature/safety certification audit, pickup guidelines, disclaimer. |
| `/food-safety` | `FoodSafetyPage.jsx` | Food safety standards, temperature danger zone guidelines, packaging hygiene best practices. |
| `/contact` | `ContactPage.jsx` | Support contact form, emergency food rescue hotline, FAQ accordion. |

### 2.2 Beneficiary Food Discovery & Privacy Protection
- **Safe Projection**: The public food board (`GET /api/v1/public/food-board` and `GET /api/v1/public/food-board/:id`) projects sanitised fields. The donor's full name, phone number, email, and internal IDs are completely stripped from the response payload, surfacing only general organization/donor names (e.g. "Community Partner") and public pickup areas.
- **Urgency Visual Indicators**:
  - `CRITICAL` (< 2 hours remaining until pickup deadline): Red pulse badge with warning icon.
  - `URGENT` (< 6 hours remaining): Amber badge.
  - `MODERATE` (< 12 hours remaining): Blue badge.
  - `NORMAL` (>= 12 hours remaining): Emerald badge.

---

## 3. Donor Dashboard & Inventory Management

The Donor Dashboard provides authenticated food donors with end-to-end control over their surplus inventory:

### 3.1 Donor Routes & Modules
| Path | Module | Capabilities |
| :--- | :--- | :--- |
| `/donor/dashboard` | `DonorDashboardPage.jsx` | High-level metrics (meals rescued, active listings, pending claims), urgent deadline alerts, quick-action claim reviewer. |
| `/donor/donations/new` | `CreateDonationPage.jsx` | 4-step wizard: Basic info, Critical timelines, Pickup address & storage, Mandatory Safety Checklist. |
| `/donor/donations` | `MyDonationsPage.jsx` | Filterable inventory table (All, Available, Requested, Assigned, Completed, Cancelled, Expired) with real-time countdowns. |
| `/donor/donations/:id` | `DonationDetailPage.jsx` | Comprehensive audit breakdown, digital safety certificate, status history timeline, cancel listing modal. |
| `/donor/requests` | `DonorRequestsPage.jsx` | NGO claim queue; review organization credentials, requested portions, accept or reject claims with reason tracking. |
| `/donor/history` | `DonorHistoryPage.jsx` | Historical rescue ledger with total rescued meals, CO2 emissions prevented, and impact analytics. |
| `/donor/feedback` | `DonorFeedbackPage.jsx` | Recipient NGO ratings, reviews, and qualitative feedback cards. |
| `/donor/notifications` | `DonorNotificationsPage.jsx` | Real-time notification center for requests, delivery updates, and status transitions. |
| `/donor/profile` | `DonorProfilePage.jsx` | Organization settings, pickup address defaults, and secure password update form. |

---

## 4. Food Safety Checklist Engine

Before any surplus food item becomes available for public discovery or NGO matching, the donor must digitally certify a comprehensive food safety declaration:

### 4.1 Digital Safety Checklist Criteria
1. **Commercial Kitchen Preparation**: Prepared in an inspected, licensed, or sanitized food facility.
2. **Buffet & Customer Isolation**: Food has never been served on an open buffet or come into direct contact with consumers.
3. **Sealed Sanitized Packaging**: Packaged in clean, food-grade, leak-proof containers.
4. **Time & Date Labeling**: Each container clearly marked with preparation timestamp and latest consumption deadline.
5. **Temperature Compliance at Packing**: Hot food packed at $\ge 60^\circ\text{C}$ ($140^\circ\text{F}$) or cold food chilled to $\le 4^\circ\text{C}$ ($40^\circ\text{F}$).
6. **Recorded Temperature**: Mandatory numeric temperature entry at packing time.
7. **Allergen Accuracy**: All 9 major allergen categories declared (Nuts, Dairy, Gluten, Soy, Eggs, Shellfish, Fish, Sesame, etc.).
8. **Legal Declaration & Sign-off**: Explicit legal statement under the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019 and FSSA 2006 acknowledging honest intent.

---

## 5. Automated Expiry & Locking Engine

### 5.1 Business Rules Enforced
- **Rule 1 (`pickupDeadline` vs `expiryDate`)**: The pickup deadline must be strictly earlier than or equal to the food expiry date (`pickupDeadline <= expiryDate`).
- **Rule 2 (Future Timestamps)**: Both `pickupDeadline` and `expiryDate` must be future timestamps at creation time.
- **Rule 3 (Automatic Expiry Transition)**: Background evaluation service marks any listing whose `pickupDeadline < Date.now()` as `expired` automatically.
- **Rule 4 (Strict Claim Prevention)**: The NGO request controller strictly rejects claims on items with status `expired`, `cancelled`, or `completed` with HTTP 400 Bad Request.

---

## 6. Verification and Test Results

### 6.1 Backend Test Suite (Vitest + Supertest)
```
✓ src/tests/auth.test.js (18 tests) - Authentication, HttpOnly Cookies, Security
✓ src/tests/api.test.js (27 tests) - API Contracts, Role Protection, Error Handling
✓ src/tests/donations.test.js (12 tests) - Surplus Creation, Expiry Engine, Public Board
✓ src/tests/models.test.js (11 tests) - Schemas, Geolocation, Password Hashing
✓ src/tests/health.test.js (3 tests) - Health, 404, App Routing

Test Files  5 passed (5)
Tests       71 passed (71)
```

### 6.2 Frontend Test Suite & Production Bundle
```
✓ src/tests/phase4Donor.test.jsx (3 tests) - Public & Donor routes, Expiry Urgency
✓ src/tests/foundation.test.jsx (4 tests) - App mount, UI components, Layouts

Test Files  2 passed (2)
Tests       7 passed (7)

Vite Production Build:
✓ 1713 modules transformed.
dist/index.html                   1.00 kB │ gzip:   0.59 kB
dist/assets/index-k9RiKfcS.css   46.04 kB │ gzip:   7.83 kB
dist/assets/index-P5MxRdlP.js   576.18 kB │ gzip: 161.03 kB
✓ built in 38.16s with 0 errors
```

