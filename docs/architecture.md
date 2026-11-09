# Foodlink – System Architecture & Foundation Document (Phase 1)

## 1. Executive Overview

**Foodlink** is a Smart Food Donation, NGO Matching, and Food Rescue Management Platform engineered to eliminate food waste and safely feed local communities. It bridges surplus food producers (restaurants, hotels, bakeries, corporate cafeterias) directly to vetted shelters and food rescue volunteers under strict food hygiene guidelines and temperature control standards.

---

## 2. Platform Roles & Permission Model

Foodlink enforces strictly four authenticated roles and one unauthenticated public beneficiary tier:

1. **Food Donor (`donor`)**:
   - Registers commercial kitchen licenses and kitchen addresses.
   - Posts surplus food listings with quantity, preparation timestamps, and temperature state (Chilled, Ambient, Hot).
   - Approves NGO match requests and coordinates courier departure.

2. **NGO Partner (`ngo`)**:
   - Verified non-profit shelters, soup kitchens, and community centers.
   - Maintains intake capacity, dietary requirements, and operating hours.
   - Receives matched recommendations and submits rescue requests.
   - Confirms food receipt upon safe delivery.

3. **Delivery Partner / Volunteer (`delivery`)**:
   - Certified volunteers and transport fleet members equipped with insulated or refrigerated containers.
   - Accepts assigned food transport tasks within local radius.
   - Verifies food packaging and temperature at pickup and destination.

4. **Platform Administrator (`admin`)**:
   - Vets NGO legal registrations (501(c)(3) / charitable trust certifications) and kitchen licenses.
   - Audits food safety logs and flags temperature danger violations.
   - Oversees network health and system-wide impact analytics.

5. **Beneficiary (Public)**:
   - Zero-barrier, unauthenticated public food discovery board.
   - Shows live meal availability, community shelter addresses, and walk-in pickup hours.

---

## 3. Technology Stack & Architectural Decisions

### Frontend Architecture
- **Framework**: React 18 with Vite.
- **Language**: Pure Modern JavaScript & JSX (no TypeScript).
- **Styling**: Tailwind CSS configured with a food-themed warm cream (`#FAF8F5`) and natural forest green (`#1E5E3A`) design palette.
- **Routing**: React Router v7 with distinct public layout and responsive role dashboard console layout.
- **Icons**: Lucide React.
- **State & Context**: Context API for authentication simulation, session tokens, and accessible floating toast notifications.
- **Form & Validation**: React Hook Form with Zod schemas.
- **Analytics Visualization**: Recharts.
- **Networking**: Axios instance configured with base URL and authorization interceptors.

### Backend Architecture
- **Runtime**: Node.js v24 with ES modules (`"type": "module"`).
- **Framework**: Express.js with Helmet for HTTP headers and CORS for safe client communication.
- **Database**: MongoDB with Mongoose ODM (graceful offline development fallback enabled).
- **Security**: bcryptjs for password hashing, jsonwebtoken for stateless JWT authentication, Zod for request body validation.
- **Layered Architecture**:
  - `controllers/`: Handles HTTP requests and maps responses.
  - `services/`: Encapsulates business logic.
  - `repositories/`: Database abstraction layer.
  - `models/`: Mongoose schemas.
  - `validators/`: Zod schemas for input validation.
  - `middleware/`: Error handling, not-found routing, validation, and token authentication.

---

## 4. Directory Structure

```
FOODLINK/
├── Frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── app/               # Main entrypoint, Router configuration
│       ├── components/ui/     # Design system (Button, Input, Card, Modal, Table, Badge, Select, Textarea)
│       ├── constants/         # Roles, routes, status codes
│       ├── context/           # AuthContext, ToastContext
│       ├── features/          # Feature slices (for upcoming phases)
│       ├── hooks/             # Custom hooks (useAuth, useToast)
│       ├── layouts/           # Header, Sidebar, Footer, PublicLayout, DashboardLayout
│       ├── pages/             # Public pages & 4 Role Dashboard consoles
│       ├── services/          # Axios API client
│       ├── styles/            # Tailwind base directives and custom classes
│       ├── tests/             # Vitest frontend unit tests
│       └── utils/             # Helpers (cn, formatting)
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── app.js             # Express app configuration & middleware
│       ├── server.js          # HTTP server bootstrap & DB connection
│       ├── config/            # Environment & MongoDB configuration
│       ├── constants/         # Role definitions & HTTP status codes
│       ├── controllers/       # Route controllers (HealthController, etc.)
│       ├── middleware/        # Error handler, 404, Zod validator
│       ├── models/            # Mongoose data models
│       ├── repositories/      # Data access layer
│       ├── routes/            # Express routers (/api, /health)
│       ├── services/          # Business logic services
│       ├── tests/             # Vitest & Supertest API tests
│       ├── utils/             # AppError, apiResponse, logger
│       └── validators/        # Zod validation schemas
└── docs/                      # Technical architecture & design documentation
```

