# Foodlink – Environment Configuration Guide

This guide details all environment variables for both the **Backend API** and the **Frontend Web Client**, including default values, security implications, and production considerations.

---

## 1. Backend Environment Configuration (`backend/.env`)

The backend loads configuration through `src/config/env.js`, enforcing strict schema validation and falling back to safe local defaults.

| Variable Name | Required | Default Local Value | Description & Security Best Practices |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | No | `development` | Set to `production` in live deployments to enforce secure cookie flags and disable verbose logs. |
| `PORT` | No | `5000` | Port on which the Express REST API listens. |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/foodlink` | MongoDB connection URI. In replica sets or Atlas, supply credentials with readWrite access. |
| `MONGODB_TEST_URI` | No | `mongodb://127.0.0.1:27017/foodlink_test` | Dedicated database for Vitest integration tests to isolate test state. |
| `CLIENT_ORIGIN` | Yes | `http://localhost:5173` | Exact origin permitted by CORS policy (`credentials: true` requires non-wildcard origins). |
| `ACCESS_TOKEN_SECRET` | Yes | *Cryptographic 64-char hex* | Secret key for signing short-lived JWT access tokens. |
| `ACCESS_TOKEN_EXPIRY` | No | `15m` | Lifetime of access tokens (15 minutes). |
| `REFRESH_TOKEN_SECRET` | Yes | *Cryptographic 64-char hex* | Secret key for signing long-lived refresh tokens. Must differ from `ACCESS_TOKEN_SECRET`. |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Lifetime of refresh tokens (7 days). Rotated on each renewal. |
| `ADMIN_SEED_PASSWORD` | No | `AdminSecure123!` | Initial seed password used by `autoSeedIfEmpty` and `seedAll.js`. |
| `COOKIE_SECRET` | Yes | *Cryptographic 64-char hex* | Secret used by `cookie-parser` for signing HttpOnly cookies. |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limiter window in milliseconds (15 minutes). |
| `RATE_LIMIT_MAX` | No | `200` | Maximum requests allowed per window per IP address. |

### Sample `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/foodlink
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/foodlink_test
CLIENT_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=foodlink_super_secret_jwt_access_token_key_for_dev_only_32_bytes_min
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=foodlink_super_secret_jwt_refresh_token_key_for_dev_only_32_bytes_min
REFRESH_TOKEN_EXPIRY=7d
ADMIN_SEED_PASSWORD=AdminSecure123!
COOKIE_SECRET=foodlink_cookie_secret_for_development_purposes_only
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

---

## 2. Frontend Environment Configuration (`Frontend/.env`)

Vite exposes environment variables prefixed with `VITE_` to client-side bundles via `import.meta.env`.

| Variable Name | Required | Default Local Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL of the Foodlink backend API. |
| `VITE_APP_NAME` | No | `Foodlink` | Application branding name. |
| `VITE_DEFAULT_LATITUDE` | No | `12.9716` | Default map center latitude (Bengaluru, Karnataka). |
| `VITE_DEFAULT_LONGITUDE` | No | `77.5946` | Default map center longitude (Bengaluru, Karnataka). |
| `VITE_MAP_ZOOM` | No | `12` | Default map zoom level for rescue route visualization. |

### Sample `Frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Foodlink
VITE_DEFAULT_LATITUDE=12.9716
VITE_DEFAULT_LONGITUDE=77.5946
VITE_MAP_ZOOM=12
```

---

## 3. Production Environment Checklist

1. **Generate Strong Secrets**:
   Run the following Node.js snippet to generate cryptographically secure 256-bit secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Enable Secure Cookies**:
   Set `NODE_ENV=production` so that cookies automatically receive the `Secure` attribute, requiring HTTPS.
3. **Database Security**:
   Ensure MongoDB has authentication enabled (`auth = true` in `/etc/mongod.conf`) and connections use TLS/SSL.
4. **CORS Restrictions**:
   Set `CLIENT_ORIGIN` to the production domain (e.g. `https://foodlink.org.in`). Never use wildcard `*` with cookies.

