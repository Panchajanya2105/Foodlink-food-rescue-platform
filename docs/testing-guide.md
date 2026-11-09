# Foodlink – Testing & Quality Assurance Guide

Foodlink implements comprehensive multi-tier automated testing across both backend and client subsystems using **Vitest** and **Supertest**.

---

## 1. Test Suite Summary Matrix

| Subsystem | Suite File | Test Scope | Tests | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | `phase8E2EWorkflow.test.js` | Complete lifecycle (A to M) + security boundaries + edge cases | 16 | Passed |
| **Backend** | `phase7Analytics.test.js` | Impact metrics integrity, in-app notifications, feedback moderation | 11 | Passed |
| **Backend** | `deliveryAndAdmin.test.js` | Volunteer claiming, pickup/drop-off temp checks, admin audit | 14 | Passed |
| **Backend** | `ngoMatching.test.js` | Smart scoring engine, request lifecycle, concurrency protection | 16 | Passed |
| **Backend** | `donations.test.js` | Donation creation, safety checklist, auto-expiry evaluation | 12 | Passed |
| **Backend** | `auth.test.js` | Registration, login, HttpOnly cookies, refresh tokens, role guards | 18 | Passed |
| **Backend** | `api.test.js` | Route contracts, pagination, middleware validation, rate limiting | 27 | Passed |
| **Backend** | `models.test.js` | Mongoose schema validation, password hashing, compound indexes | 11 | Passed |
| **Backend** | `health.test.js` | Root API endpoint, 404 handler, health metrics | 3 | Passed |
| **Client** | `phase8E2EFrontend.test.jsx` | Complete route catalog, role labels, full service method coverage | 4 | Passed |
| **Client** | `phase7Frontend.test.jsx` | Analytics, notifications polling, feedback moderation services | 5 | Passed |
| **Client** | `phase6DeliveryAdmin.test.jsx`| Delivery & admin route contracts, service methods | 5 | Passed |
| **Client** | `phase5Ngo.test.jsx` | NGO matching routes, recommendation integration, request forms | 3 | Passed |
| **Client** | `phase4Donor.test.jsx` | Donor dashboard routes, donation creation schema contracts | 3 | Passed |
| **Client** | `foundation.test.jsx` | Design tokens, button/card variants, Tailwind classes | 4 | Passed |
| **Total** | **15 Test Suites** | **Full System Verification** | **152** | **100% Passed** |

---

## 2. Running Backend Tests

Backend tests execute against the local MongoDB instance using an isolated test database (`foodlink_test`):

```bash
cd /home/srujan/FOODLINK/backend

# Run all 9 test suites
npm test -- --run

# Run a specific suite (e.g. End-to-End workflow)
npm test -- src/tests/phase8E2EWorkflow.test.js --run

# Run with coverage report
npm test -- --coverage
```

---

## 3. Running Frontend Tests

Frontend tests verify React components, route definitions, role guards, and API client contracts:

```bash
cd /home/srujan/FOODLINK/client

# Run all 6 test suites
npm test -- --run

# Run in watch mode during development
npm test

# Verify production Vite build bundle
npm run build
```

---

## 4. Key Business Scenarios Covered

1. **Safety Checklist Verification**: Submissions missing mandatory declarations (e.g. commercial kitchen certification, allergen declaration, or temperature compliance) are rejected with HTTP 400.
2. **Strict Rescued Food Calculation**: Pending, matched, or expired donations are never included in rescued portions; only donations with `status === 'delivered'` contribute to carbon offsets.
3. **Concurrency Protection**: Simultaneous claims by multiple volunteer couriers on the same open delivery task result in atomic locking: the first succeeds with 200, the second receives 409 Conflict.
4. **Privilege Escalation Block**: Public registration with `role: "admin"` is strictly blocked by Zod validator schemas.
5. **Ownership Boundaries**: Donors cannot cancel or approve requests belonging to other donors' listings.

