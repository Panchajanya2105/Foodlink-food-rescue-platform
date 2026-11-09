# Foodlink – Ubuntu Linux Installation & Operations Guide

This guide details the complete local installation, configuration, and verification of Foodlink on an Ubuntu Linux system (Ubuntu 20.04 LTS, 22.04 LTS, or 24.04 LTS).

---

## 1. System Requirements

- **Operating System**: Ubuntu Linux (Desktop or Server)
- **Node.js**: v18.18.0 or later (v20.x recommended)
- **Package Manager**: npm v9.x or v10.x
- **Database**: MongoDB Community Edition 7.0+
- **System Memory**: Minimum 4GB RAM (8GB recommended for concurrent build & tests)
- **Network**: Local loopback (`127.0.0.1`) available on ports `5000` (Backend API), `5173` (Vite Client), and `27017` (MongoDB).

---

## 2. Step 1: Install Node.js & npm (via NodeSource)

```bash
# Update Ubuntu package index
sudo apt-get update && sudo apt-get upgrade -y

# Install prerequisite curl
sudo apt-get install -y curl gnupg

# Add NodeSource repository for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and build tools
sudo apt-get install -y nodejs build-essential

# Verify versions
node -v   # Should output v20.x.x
npm -v    # Should output v10.x.x
```

---

## 3. Step 2: Install and Start MongoDB Community Edition

```bash
# Import the MongoDB public GPG Key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database
sudo apt-get update

# Install MongoDB packages
sudo apt-get install -y mongodb-org

# Start MongoDB service and enable automatic boot startup
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running on port 27017
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

---

## 4. Step 3: Configure Project Environment Files

```bash
cd /home/srujan/FOODLINK

# 1. Setup Backend Environment
cp backend/.env.example backend/.env

# 2. Setup Frontend Environment
cp Frontend/.env.example Frontend/.env
```

### Backend `.env` Reference
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/foodlink
JWT_ACCESS_SECRET=foodlink_super_secure_access_token_secret_key_2026_dev
JWT_REFRESH_SECRET=foodlink_super_secure_refresh_token_secret_key_2026_dev
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### Frontend `.env` Reference
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Step 4: Install Dependencies

```bash
# Install backend npm packages
cd /home/srujan/FOODLINK/backend
npm install

# Install Frontend npm packages
cd /home/srujan/FOODLINK/Frontend
npm install
```

---

## 6. Step 5: Seed Default Administrative Account

```bash
cd /home/srujan/FOODLINK/backend
npm run seed:admin
```

This ensures the platform has an operational administrative user:
- **Email**: `admin@foodlink.org`
- **Password**: `AdminPassword123!`

---

## 7. Step 6: Run Development Servers

Open two independent terminal windows:

### Terminal 1: Backend Server
```bash
cd /home/srujan/FOODLINK/backend
npm run dev
```
*Expected log output:*
```
[INFO] MongoDB Connected: 127.0.0.1/foodlink
[INFO] Foodlink API server listening on http://localhost:5000
```

### Terminal 2: Vite Frontend Application
```bash
cd /home/srujan/FOODLINK/Frontend
npm run dev
```
*Expected output:*
```
  VITE v6.4.5  ready in 320 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Visit **http://localhost:5173** in your web browser to access Foodlink.

---

## 8. Verification & Test Suite Execution

Run automated test suites to ensure 100% environment health:

```bash
# Run backend test suite (128 tests)
cd /home/srujan/FOODLINK/backend
npm test -- --run

# Run Frontend unit tests (24 tests)
cd /home/srujan/FOODLINK/Frontend
npm test -- --run

# Test Frontend production build
cd /home/srujan/FOODLINK/Frontend
npm run build
```

