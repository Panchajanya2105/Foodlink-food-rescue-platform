# Foodlink – Getting Started & Local Development

## Prerequisites
- Node.js >= 18 (Tested on v24.18.0)
- npm >= 9 (Tested on 11.16.0)
- MongoDB >= 6.0 (Optional for foundation; backend boots gracefully in dev mode if database is offline)

---

## 1. Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

### Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
```

---

## 2. Running the Application

### Start the Backend API
```bash
cd backend
npm run dev
```
The backend server runs on `http://localhost:5000`.
- Health status: `GET http://localhost:5000/api/health`
- API root: `GET http://localhost:5000/api`

### Start the Frontend Client
```bash
cd Frontend
npm run dev
```
The Vite development server runs on `http://localhost:5173`.

---

## 3. Running Automated Tests

### Backend Unit & Integration Tests (Vitest & Supertest)
```bash
cd backend
npm test
```

### Frontend Unit & Architecture Tests (Vitest)
```bash
cd Frontend
npm test
```

### Frontend Production Build Verification
```bash
cd Frontend
npm run build
```

