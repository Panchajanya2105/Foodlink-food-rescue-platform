# Foodlink Authentication & Role Security Architecture (Phase 3)

## 1. Executive Summary

Phase 3 implements an enterprise-grade, defense-in-depth authentication and role authorization architecture for **Foodlink** adhering strictly to JavaScript-only ES Modules, OWASP recommendations, and the Foodlink Master Project Instructions.

Authentication tokens are strictly forbidden from `localStorage` storage to eliminate token theft via Cross-Site Scripting (XSS). All session tokens are delivered and managed via cryptographically secured `HttpOnly`, `SameSite=Lax`, signed cookies with automatic rotation and refresh queues.

---

## 2. Authenticated Roles & Access Boundaries

| Role | System Identifier | Onboarding / Creation Method | Access Boundaries & Permissions |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor` | Public registration with business profile | Can create surplus food listings, manage safety checklists, approve/reject NGO requests for their own donations. Cannot access other donors' items or admin consoles. |
| **NGO** | `ngo` | Public registration + verification review | Defaults to `isVerified: false`. Can browse public discovery and smart recommendations. **Blocked from requesting restricted food donations until platform admin verifies organization credentials.** |
| **Delivery Partner** | `delivery` | Public volunteer registration | Receives assigned food rescue deliveries, records custody transfers (pickup temperature, drop-off verification). Cannot alter donor listings or manage requests. |
| **Administrator** | `admin` | **Strictly one-time seed script / CLI setup** (`npm run seed:admin`). **Public registration strictly rejected.** | Platform-wide oversight: verify NGOs, monitor platform rescue analytics, review safety violations, suspend misbehaving accounts. |
| **Public Beneficiary** | *Unauthenticated* | No registration or credentials required | Read-only public food availability board (`/food-board`), community food bank directories, and food safety educational guidelines. |

---

## 3. Token Strategy & HttpOnly Cookie Lifecycle

### Dual-Token JWT Architecture
1. **Short-Lived Access Token (`accessToken`)**:
   - Lifetime: **15 minutes**.
   - Payload: `{ id: user._id, role: user.role }`.
   - Transmitted in: `HttpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/` cookie.
2. **Long-Lived Refresh Token (`refreshToken`)**:
   - Lifetime: **7 days**.
   - Payload: `{ id: user._id }`.
   - Storage: Stored hashed (`bcrypt`) in MongoDB `User.refreshToken` to prevent offline token forgery or database leak exploitation.
   - Transmitted in: `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth/refresh` cookie.

### Silent Token Refresh via Axios Interceptor
When an API request receives an HTTP `401 Unauthorized` due to access token expiry, the client Axios response interceptor (`src/services/api.js`):
1. Intercepts the failed request without notifying the UI.
2. Queues any concurrent failing requests in a promise buffer.
3. Automatically triggers `POST /api/v1/auth/refresh` with credentials enabled.
4. On success, the backend sets a fresh `accessToken` cookie and the queued requests are retried seamlessly.
5. If the refresh token is expired or revoked, all cookies are cleared and the user is redirected to `/login`.

---

## 4. Privilege Escalation & Account Status Defenses

- **Public Admin Registration Prevention**:
  The Zod schema `registerSchema` restricts `role` strictly to `enum(['donor', 'ngo', 'delivery'])`. Any registration payload supplying `role: 'admin'` is rejected with `400 Bad Request` at the validation middleware layer before reaching any database logic.
- **Account Status Guard**:
  Every authenticated request verifies `user.accountStatus`. If an account is marked `suspended`, the authentication middleware immediately aborts with `403 Forbidden` ("Your account has been suspended").
- **Verification Guard (`requireVerified`)**:
  Protects sensitive donation claim endpoints (`/api/v1/requests`). Unverified NGOs receive `403 Forbidden` with guidance to await admin approval.
- **Password Invalidation Timestamp**:
  When a user changes their password (`POST /api/v1/auth/change-password`), `user.passwordChangedAt` is updated and existing refresh tokens are wiped. Any access token issued prior to `passwordChangedAt` is immediately invalidated across all active sessions.

---

## 5. Frontend Session & Route Guarding

- **`AuthContext` (`Frontend/src/context/AuthContext.jsx`)**:
  - Automatically queries `GET /api/v1/auth/me` on application boot using `withCredentials: true`.
  - Maintains `user`, `role`, `isAuthenticated`, `isVerified`, and `accountStatus` in memory.
  - Zero sensitive tokens saved in browser storage (`localStorage` / `sessionStorage`).
- **`ProtectedRoute` (`Frontend/src/components/ProtectedRoute.jsx`)**:
  - Unauthenticated users $\rightarrow$ Redirect to `/login?from=...`
  - Suspended users $\rightarrow$ Render `<SuspendedAccountPage />`
  - Unverified NGOs accessing restricted features $\rightarrow$ Render `<PendingVerificationPage />`
  - Role mismatch (e.g. Donor accessing Admin dashboard) $\rightarrow$ Render `<ForbiddenPage />`

---

## 6. Verification & Test Suite Summary

- **Backend Suites**:
  - `src/tests/auth.test.js`: 18 tests covering registration, duplicate rejection, admin privilege escalation prevention, credential verification, cookie setting, refresh rotation, password change, forgot/reset flow, cross-user isolation, and secure logout.
  - `src/tests/api.test.js`: 27 tests covering all route groups and security policies.
  - `src/tests/models.test.js`: 11 tests covering schema validators and bcrypt hooks.
  - `src/tests/health.test.js`: 3 tests covering base server health.
  - **Total Backend Tests: 59 passed (59)**
- **Frontend Suites**:
  - `src/tests/foundation.test.jsx`: 4 passed (4)
  - Vite production bundle: `dist/index.html` + `dist/assets/` built in 56.74s with zero compilation errors.

