# Foodlink – API Specifications & Contracts (Phase 2)

Base URL: `/api/v1`

---

## 1. Public Endpoints (Unauthenticated)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/public/food-board` | Beneficiary food discovery board with search, filters (dietary, category), and pagination. |
| `GET` | `/api/v1/public/shelters` | Directory of verified community distribution centers. |
| `GET` | `/api/health` | Service uptime and MongoDB connectivity status. |
| `GET` | `/api/v1/analytics` | Public overview of meals rescued, active rescues, and CO2 offset. |

---

## 2. Authentication & Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Register a new user (`donor`, `ngo`, `delivery`, `admin`). Automatically initializes role profile. |
| `POST` | `/api/v1/auth/login` | None | Verify credentials and return signed JWT. |
| `GET` | `/api/v1/auth/me` | Bearer | Return authenticated user and their active role profile. |
| `POST` | `/api/v1/auth/logout` | Bearer | Clear token / invalidate session. |
| `PATCH` | `/api/v1/users/profile` | Bearer | Update user contact details. |
| `PATCH` | `/api/v1/users/role-profile` | Bearer | Update role-specific metadata (shelter capacity, courier vehicle, etc.). |
| `GET` | `/api/v1/users` | Admin | Paginated list of users with role and status filters. |

---

## 3. Donations & Food Safety
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/donations` | None/Bearer | Paginated list of food donations with status, category, and donor filters. |
| `POST` | `/api/v1/donations` | Donor/Admin | Create a new surplus food listing with prep date, expiry date, pickup deadline, and temperature requirements. |
| `GET` | `/api/v1/donations/:id` | None/Bearer | Retrieve single donation details along with status history and safety checklist. |
| `POST` | `/api/v1/donations/:id/safety-checklist` | Donor/Admin | Submit mandatory 7-point food safety checklist and temperature reading. |
| `GET` | `/api/v1/food-safety/:donationId` | Bearer | Inspect recorded food safety checklist for a donation. |
| `PATCH` | `/api/v1/donations/:id/status` | Bearer | Update status with an immutable audit record in `StatusHistory`. |

---

## 4. Smart Recommendations & Matching
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/recommendations/ngo` | NGO/Admin | Returns ranked surplus food listings matching the shelter's intake capacity, storage facilities, and distance. |
| `GET` | `/api/v1/recommendations/donation/:id` | Donor/Admin | Recommends nearby verified NGOs suitable for a specific donation. |

---

## 5. Donation Requests & Approvals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/requests` | NGO/Admin | Submit request to claim portions of an available donation. Sets donation status to `requested`. |
| `GET` | `/api/v1/requests` | Bearer | Paginated list of requests filtered by NGO or donation. |
| `PATCH` | `/api/v1/requests/:id/decision` | Donor/Admin | Donor approves or declines request. On approval, sets donation to `matched` and reserves quantity. |

---

## 6. Delivery Assignments & Custody Transfers
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/assignments` | Donor/NGO/Admin | Assign a volunteer delivery partner to transport food. Sets status to `assigned`. |
| `GET` | `/api/v1/assignments` | Bearer | Paginated list of assignments for active courier or donor. |
| `PATCH` | `/api/v1/assignments/:id/pickup` | Delivery/Admin | Courier confirms physical pickup, container seal, and temperature. Sets status to `in_transit`. |
| `PATCH` | `/api/v1/assignments/:id/delivery` | Delivery/Admin | Courier and shelter confirm drop-off and arrival temperature. Sets status to `delivered` & `completed`. |

---

## 7. Notifications, Feedback & Administration
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Bearer | List in-app notifications with unread count. |
| `PATCH` | `/api/v1/notifications/:id/read` | Bearer | Mark single notification as read. |
| `PATCH` | `/api/v1/notifications/read-all` | Bearer | Mark all notifications as read. |
| `POST` | `/api/v1/feedback` | Bearer | Record 1-5 star rating and comments between donor, courier, and NGO. |
| `GET` | `/api/v1/feedback` | None/Bearer | Paginated list of reviews for an organization or donation. |
| `GET` | `/api/v1/admin/overview` | Admin | Master dashboard with pending NGO verifications, users, and safety audits. |
| `PATCH` | `/api/v1/admin/verify-ngo/:id` | Admin | Approve or reject NGO legal registration. |

