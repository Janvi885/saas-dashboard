# 🗂️ SaaS Product Dashboard

> A role-based product management dashboard with analytics, AI-assisted descriptions, and a hardened Express + Firebase backend.

## Live Demo

**Local (default):** [http://localhost:3000](http://localhost:3000) | [http://localhost:5000/health](http://localhost:5000/health)

**Deployed:** [Frontend URL] | [API Health Check URL]

**Test credentials** (created by seed script):

| Role   | Email             | Password    |
|--------|-------------------|-------------|
| Admin  | admin@test.com    | Admin123!   |
| Viewer | viewer@test.com   | Viewer123!  |

---

## Architecture

```
Browser
   │
   ▼
Vite + React (port 3000)
   │  HTTP + Bearer Token (Firebase ID JWT)
   ▼
Express API (port 5000)
   │  Firebase Admin SDK
   ▼
Firebase Auth + Firestore
```

**Key design decisions**

- **Separated frontend and backend** — two independent deployable services; frontend never holds service-account credentials.
- **Server-side auth validation** — every protected route verifies JWTs with `adminAuth.verifyIdToken()` before any business logic runs.
- **Firestore Security Rules** — second layer for direct client access; rules enforce role-based read/write even if a client bypasses the API.
- **Feature-based structure** — `products/`, `auth/`, `dashboard/` on the frontend; `modules/products/` on the backend. Colocation over layer-only folders.
- **Unidirectional request flow** — Component → Hook → Service → API → Controller → Service → Firestore.

---

## Quick Start (< 5 minutes)

### Prerequisites

- Node.js 20+
- npm
- A Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

### 1. Clone and install

```bash
git clone https://github.com/Janvi885/saas-dashboard.git
cd saas-dashboard
npm run install:all
```

### 2. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore** database (production mode is fine; deploy rules from step 4).
4. Generate a **Web app** config (Project Settings → Your apps) for the frontend.
5. Create a **Service account** key (Project Settings → Service accounts → Generate new private key) for the backend.
6. Deploy Firestore rules: `firebase deploy --only firestore:rules` (requires Firebase CLI), or paste `firestore.rules` manually in the console.

### 3. Environment files

**`backend/.env`** (copy from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GROQ_API_KEY=your-groq-key          # optional — AI description generation
```

**`frontend/.env`** (copy from `frontend/.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

Creates test users, 20 sample products, and a `/meta/seed` marker. Re-runs are skipped automatically if seed already ran.

### 5. Run locally

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- API health: http://localhost:5000/health  

---

## Project Structure

```
saas-dashboard/
├── frontend/src/
│   ├── features/          # Domain modules (products, auth, dashboard)
│   │   ├── products/      # hooks, components, schemas, utils
│   │   ├── auth/
│   │   └── dashboard/
│   ├── pages/             # Route-level page components
│   ├── services/          # Axios API clients
│   ├── components/        # Shared UI (layout, shadcn/ui)
│   └── router/            # React Router + guards
├── backend/src/
│   ├── modules/products/  # routes, controller, service, validators, AI
│   ├── middleware/        # auth, authorize, validate, rate limit
│   ├── routes/            # analytics, admin
│   ├── config/            # env, Firebase Admin init
│   └── scripts/seed.ts    # Database seeding
├── firestore.rules
└── .github/workflows/ci.yml
```

**Why feature-based?** Product logic (filters, form, table, toasts) changes together. Grouping by domain keeps related code in one place and makes onboarding faster than hunting across `controllers/` and `components/` trees.

---

## Database Schema

### `/products/{productId}`

| Field       | Type      | Notes                                      |
|-------------|-----------|--------------------------------------------|
| name        | string    | 2–100 chars                                |
| category    | string    | `Electronics`, `Clothing`, `Food`, `Software`, `Home`, `Books`, `Other` |
| price       | number    | USD, positive, max 999,999.99                |
| status      | string    | `active` \| `inactive`                     |
| description | string?   | optional, max 500 chars                      |
| sku         | string?   | optional, alphanumeric + dashes              |
| stock       | number?   | optional, non-negative integer               |
| createdAt   | Timestamp | set on create                              |
| updatedAt   | Timestamp | set on create/update                       |
| createdBy   | string    | uid of creating admin                      |

### `/users/{userId}`

| Field     | Type      | Notes                          |
|-----------|-----------|--------------------------------|
| uid       | string    | Firebase Auth uid              |
| email     | string    | user email                     |
| role      | string    | `admin` or `viewer`            |
| createdAt | string    | ISO timestamp (seed/register)  |
| updatedAt | string    | ISO timestamp (role changes)   |

Roles are authoritative in **Firebase Auth custom claims** (`request.auth.token.role`). Firestore `/users` is a readable mirror for the app.

### `/rate_limits/{userId}`

| Field        | Type      | Notes                                    |
|--------------|-----------|------------------------------------------|
| count        | number    | AI requests in current window              |
| windowStart  | Timestamp | start of the rolling 1-hour window       |

Used by the AI description endpoint (max 10 requests/user/hour).

### `/meta/seed`

| Field     | Type      | Notes                    |
|-----------|-----------|--------------------------|
| seededAt  | Timestamp | when seed script ran     |
| version   | number    | seed schema version      |

---

## Security Architecture

**End-to-end auth flow**

1. User signs in → Firebase Auth issues a short-lived JWT.
2. React holds the session in memory via the Firebase SDK (`AuthContext`).
3. Axios interceptor attaches `Authorization: Bearer <token>` on every API request.
4. Express `authenticate` middleware calls `adminAuth.verifyIdToken()`.
5. `authorize` middleware checks the `role` custom claim (`admin` | `viewer`).
6. Controller runs only if both checks pass; otherwise 401/403.
7. Firestore Security Rules enforce the same role model on any direct DB access.

**OWASP considerations addressed**

| Risk              | Mitigation                                              |
|-------------------|---------------------------------------------------------|
| Token exposure    | JWTs in headers only — never in URLs or query strings   |
| Injection         | Zod validation + string sanitization on backend; Zod on frontend for UX |
| Brute force / DoS | `express-rate-limit` (100 req / 15 min per IP)          |
| AI abuse          | Per-user Firestore counter (10 req / hour)              |
| XSS / clickjacking| Helmet + manual `X-Frame-Options`, `X-Content-Type-Options` |
| CORS misconfig    | Restricted to `FRONTEND_URL` only                       |
| Error leakage     | Structured API errors; no stack traces in production responses |

---

## Role-Based Access Control

| Feature          | Admin | Viewer |
|------------------|:-----:|:------:|
| View products    | ✅    | ✅     |
| View dashboard   | ✅    | ✅     |
| Create product   | ✅    | ❌     |
| Edit product     | ✅    | ❌     |
| Delete product   | ✅    | ❌     |
| AI description   | ✅    | ❌     |
| Set user roles   | ✅    | ❌     |

Enforced in **two places**: UI hides/disables controls (`useRole`, `RoleGuard`), and the API returns **403** if a viewer hits a protected endpoint. UI alone is never sufficient.

---

## Trade-offs & Scope Decisions

- **API uses Admin SDK** — backend bypasses Firestore rules during server-side writes. Rules still protect against direct client SDK access; the API is the primary path.
- **Analytics aggregates computed in-memory** — avoids Firestore composite index / aggregate query complexity at the cost of loading all products server-side. Fine for demo scale; not for millions of rows.
- **Revenue chart is static mock data** — real revenue-over-time would need order/transaction data we don't model yet.
- **AI via Groq (Llama 3.3)** — free-tier friendly; quality differs from Claude/GPT. Optional — app works without `GROQ_API_KEY`.
- **No tests yet** — CI runs lint, typecheck, and build only. Test coverage deferred to stay within time budget.
- **Single-tenant** — no `organizationId`; all users share one product catalog.
- **Seed is idempotent** — guarded by `/meta/seed`; won't overwrite existing data on re-run.

---

## What's Next (with another week)

- **Unit tests** — Jest + React Testing Library (frontend), Supertest (backend)
- **E2E tests** — Playwright covering login, CRUD, and role enforcement
- **Real-time updates** — Firestore `onSnapshot` listeners for live product table
- **Multi-tenancy** — `organizationId` on products + tenant-scoped queries
- **CSV export** — admin-only product download
- **Audit log** — `/auditLogs` collection tracking all mutations with actor + diff
- **Redis rate limiting** — replace in-memory / Firestore counters for production scale
- **Docker Compose** — one-command local dev with pinned Node + env templates

---

## AI Tool Usage

Claude (Cursor) was used to accelerate scaffolding, security hardening, and UI polish — not to replace understanding.

**How it was used**

- Bootstrapping folder structure, shadcn/ui components, and Express middleware patterns
- Drafting Zod validators, Firestore rules, and the seed script
- Implementing AI description generation (Groq integration + rate limiting)
- Writing GitHub Actions CI and this README

**What was reviewed manually**

- Auth flow and RBAC enforcement (custom claims + middleware + rules alignment)
- Input sanitization and error response shapes
- Product filter/search logic and pagination edge cases

Every line in this codebase can be walked through in a technical review. AI output was treated as a first draft — edited, tested, and integrated like any other PR.

---

## CI

GitHub Actions runs on push to `main` / `develop` and on PRs to `main`:

- **Frontend** — typecheck, lint, build (with dummy env vars)
- **Backend** — typecheck, lint

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## License

ISC
