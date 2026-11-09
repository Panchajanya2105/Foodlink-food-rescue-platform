# Foodlink – Troubleshooting & FAQ Guide

This guide covers common development, environment, and operational scenarios encountered when running Foodlink on Ubuntu Linux.

---

## 1. MongoDB Connection Failures

### Symptom:
`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

### Causes & Fixes:
1. **MongoDB service is inactive**:
   ```bash
   sudo systemctl status mongod
   # If inactive, start service:
   sudo systemctl start mongod
   ```
2. **MongoDB socket file permissions**:
   ```bash
   sudo chown -R mongodb:mongodb /var/lib/mongodb
   sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
   sudo systemctl restart mongod
   ```
3. **Check Mongo log files**:
   ```bash
   sudo tail -n 50 /var/log/mongodb/mongod.log
   ```

---

## 2. Port Collisions (Port 5000 or 5173 Already in Use)

### Symptom:
`Error: listen EADDRINUSE: address already in use :::5000`

### Causes & Fixes:
A stale Node.js or development process is occupying port 5000 or 5173.
```bash
# Identify PID listening on port 5000
lsof -i :5000
# Kill process by PID or port
fuser -k 5000/tcp

# Identify PID on port 5173
lsof -i :5173
# Kill process
fuser -k 5173/tcp
```

---

## 3. Cookie & CORS Cross-Origin Authentication Issues

### Symptom:
`POST /api/v1/auth/login` returns status 200, but subsequent requests return `401 Unauthorized: Authentication required`.

### Causes & Fixes:
1. **Missing `withCredentials: true` in Axios**:
   Ensure all Axios requests include credentials. Foodlink's centralized client in `Frontend/src/services/api.js` has `withCredentials: true` set by default.
2. **`CLIENT_URL` Mismatch in Backend `.env`**:
   The backend whitelist in `src/server.js` validates `req.headers.origin`. If you access the frontend on `http://127.0.0.1:5173` instead of `http://localhost:5173`, ensure backend `.env` matches:
   ```ini
   CLIENT_URL=http://localhost:5173
   ```
3. **`COOKIE_SECURE` Flag in Local Development**:
   In local non-HTTPS environments, `COOKIE_SECURE` must be set to `false`. If set to `true`, modern browsers will reject storing the cookie over plain HTTP.

---

## 4. Administrative Account Access

### Symptom:
Unable to access `/admin` dashboard or public registration denies admin role.

### Explanation:
By security design, public registration at `/register` strictly forbids the `admin` role to prevent privilege escalation.

### Resolution:
Seed or reset the admin account via the automated script:
```bash
cd /home/srujan/FOODLINK/backend
npm run seed:admin
```
Then log in with:
- **Email**: `admin@foodlink.org`
- **Password**: `AdminPassword123!`

---

## 5. Expiry & Pickup Deadline Errors on Donation Submission

### Symptom:
`400 Bad Request: Pickup deadline must be in the future` or `Expiry date must be after preparation date`.

### Resolution:
Food safety protocols mandate that:
1. `preparationDate` $\le$ Current Time (cannot donate food before it is prepared).
2. `pickupDeadline` > Current Time (cannot create a listing whose collection window is already in the past).
3. `pickupDeadline` $\le$ `expiryDate` (food must be collected before it spoils).

---

## 6. Leaflet Map Component Rendering Artifacts

### Symptom:
Leaflet map markers or tiles display offset or disjointed upon initial modal opening.

### Resolution:
Foodlink automatically calls `map.invalidateSize()` after DOM mount inside `MapComponent.jsx`. Ensure CSS is imported in `main.jsx`:
```javascript
import 'leaflet/dist/leaflet.css';
```
If using custom zoom levels, pass responsive `height` props.

