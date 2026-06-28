# SaaS Product Dashboard

A role-based product management dashboard with analytics, AI-assisted descriptions, and a hardened Express + Firebase backend.

---

## Live Demo

| Environment | URL |
|-------------|-----|
| **Frontend (Vercel)** | [https://saas-dashboard-one-vert.vercel.app](https://saas-dashboard-one-vert.vercel.app) |
| **API health (Render)** | [https://saas-dashboard-backend-0kwm.onrender.com/health](https://saas-dashboard-backend-0kwm.onrender.com/health) |
| **Local frontend** | [http://localhost:3000](http://localhost:3000) |
| **Local API** | [http://localhost:5000/health](http://localhost:5000/health) |

> **Vercel:** set `VITE_API_BASE_URL` to `https://saas-dashboard-backend-0kwm.onrender.com` · **Render:** set `FRONTEND_URL` to `https://saas-dashboard-one-vert.vercel.app`

### Test credentials

Created by the seed script (`npm run seed` in `backend/`):

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@test.com    | Admin123!  |
| Viewer | viewer@test.com   | Viewer123! |

---

## Architecture

```
Browser
   │
   ▼
Vite + React (SPA)
   │  HTTPS · Authorization: Bearer <Firebase ID token>
   ▼
Express API (Node.js)
   │  Firebase Admin SDK
   ▼
Firebase Auth  ──►  custom claims (role: admin | viewer)
   │
   ▼
Firestore  (/products, /users, /rate_limits)
```

**Request flow:** Component → Hook → Service → `api.client` → Express route → Controller → Service → Firestore.

**Design principles**

- Frontend and backend are separate deployable services; the browser never receives service-account credentials.
- Every protected API route validates JWTs server-side before business logic runs.
- Firestore Security Rules enforce the same RBAC if a client talks to Firestore directly.
- Feature-based folders on the frontend (`auth/`, `products/`, `dashboard/`); module-based on the backend (`modules/products`, `modules/admin`, `modules/analytics`).

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20+ |
| Frontend framework | React | 19.2.7 |
| Build tool | Vite | 5.4.11 |
| Language | TypeScript | ~6.0 |
| Routing | React Router | 7.18.0 |
| Forms / validation | react-hook-form + Zod | 7.80.0 / 4.4.3 |
| Styling | Tailwind CSS | 3.4.19 |
| UI primitives | Radix UI + shadcn/ui | — |
| Charts | Recharts | 3.9.0 |
| HTTP client | Axios | 1.18.1 |
| Auth (client) | Firebase JS SDK | 12.15.0 |
| Backend | Express | 5.2.1 |
| Auth (server) | firebase-admin | 13.10.0 |
| Database | Cloud Firestore | — |
| AI descriptions | Groq SDK (Llama 3.3 70B) | 1.3.0 |
| Security | Helmet, CORS, express-rate-limit | 8.2.0 / 8.5.2 |
| CI | GitHub Actions | — |
| Frontend hosting | Vercel | — |
| Backend hosting | Render (free tier) | — |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Firebase project with **Email/Password Auth** and **Firestore** enabled

### 1. Clone and install

```bash
git clone https://github.com/Janvi885/saas-dashboard.git
cd saas-dashboard
npm run install:all
```

### 2. Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore** database (production mode is fine).
4. Register a **Web app** and copy config values for the frontend.
5. Generate a **Service account** private key for the backend.
6. Deploy rules and indexes:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   Or paste `firestore.rules` manually in the Firebase Console.

### 3. Environment variables

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env`. See [Environment variables](#environment-variables) below.

### 4. Seed the database

```bash
cd backend
npm run seed
```

Creates both test users, 20 sample products, and a `/meta/seed` marker. Safe to re-run — skipped if seed already completed.

### 5. Run locally

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- API health: http://localhost:5000/health  

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `5000`) |
| `NODE_ENV` | No | `development` \| `staging` \| `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin — `https://saas-dashboard-one-vert.vercel.app` in production |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key (use `\n` for newlines in `.env`) |
| `GROQ_API_KEY` | No | Groq API key for AI product descriptions; app works without it |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Auth domain (`<project>.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Google Analytics measurement ID |
| `VITE_API_BASE_URL` | Yes | `https://saas-dashboard-backend-0kwm.onrender.com` in production |

> Only `api.client.ts` reads `VITE_API_BASE_URL`. Firebase **Admin** credentials never appear in frontend env vars.

---

## Project Structure

```
saas-dashboard/
├── frontend/src/
│   ├── features/              # auth, products, dashboard
│   ├── pages/                 # Route entry points
│   ├── services/              # api.client, product/analytics/auth services
│   ├── components/            # Layout, shared UI, guards
│   ├── router/                # React Router + ProtectedRoute / RoleGuard
│   └── store/                 # AuthContext
├── backend/src/
│   ├── modules/
│   │   ├── products/          # routes, controller, service, validators, AI
│   │   ├── admin/             # set-role
│   │   └── analytics/         # dashboard metrics
│   ├── middleware/            # authenticate, authorize, validate, rate limit
│   ├── config/                # env + Firebase Admin init
│   └── scripts/seed.ts
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── DATABASE.md                # Full schema reference
└── .github/workflows/ci.yml
```

---

## Database Schema

Full documentation: **[DATABASE.md](./DATABASE.md)**

### `/products/{productId}`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | 2–100 chars |
| `category` | string | `Electronics`, `Clothing`, `Food`, `Software`, `Home`, `Books`, `Other` |
| `price` | number | USD, stored as number (not string) |
| `status` | string | `active` \| `inactive` |
| `description` | string? | Optional, max 500 chars |
| `sku` | string? | Optional |
| `stock` | number? | Optional inventory count |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` on create |
| `updatedAt` | Timestamp | `FieldValue.serverTimestamp()` on create/update |
| `createdBy` | string | Firebase Auth uid of creating admin |

Document **id** is the Firestore auto-generated ID; exposed as `Product.id` in API responses.

### `/users/{userId}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Same as document ID |
| `email` | string? | From Firebase Auth |
| `role` | string | `admin` \| `viewer` — mirror of custom claim |
| `createdAt` | Timestamp? | First write |
| `updatedAt` | Timestamp | Updated on role changes |

### `/rate_limits/{userId}`

| Field | Type | Notes |
|-------|------|-------|
| `count` | number | AI requests in current window |
| `windowStart` | Timestamp | Rolling 1-hour window start |

Server-only (Admin SDK). Security Rules deny all client access.

### `/meta/seed`

| Field | Type | Notes |
|-------|------|-------|
| `seededAt` | Timestamp | Seed completion time |
| `version` | number | Seed schema version |

---

## Security Architecture

### Firebase custom claims (RBAC)

Roles are **not** chosen in the UI. On sign-up, the backend assigns `viewer` via `POST /api/admin/set-role` using the Admin SDK (`adminAuth.setCustomUserClaims`). Admins can promote users to `admin`.

Claims are embedded in the ID token as `role: 'admin' | 'viewer'`. The frontend reads them with `getIdTokenResult()`; the backend reads them from `verifyIdToken()` output.

### `authenticate` + `authorize` middleware

1. **`authenticate`** — Requires `Authorization: Bearer <token>`. Calls `adminAuth.verifyIdToken(token, true)` (includes revocation check). Attaches decoded token to `req.user`.
2. **`authorize('admin', …)`** — Verifies `req.user.role` is a valid claim and matches allowed roles. Returns `403` if missing or insufficient.

Example: `POST /api/products` runs `authenticate` → `authorize('admin')` → Zod validation → controller.

### Firestore rules (second layer)

The API uses the Admin SDK (bypasses rules for server writes). Rules still protect against **direct client SDK access**:

- **Products:** admins CRUD; viewers read-only
- **Users:** read own doc; admins read/write all
- **Rate limits:** deny all client access
- **Default:** deny everything else

Deploy: `firebase deploy --only firestore:rules`

### OWASP considerations

| Risk | Mitigation |
|------|------------|
| Broken access control | Server-side RBAC on every route; UI guards are not trusted alone |
| Token exposure | JWTs in `Authorization` header only — never in URLs |
| Injection | Zod validation + string sanitization on backend |
| Security misconfiguration | CORS locked to `FRONTEND_URL`; Helmet headers |
| DoS / brute force | `express-rate-limit` (100 req / 15 min per IP); AI rate limit (10 / hour / user) |
| XSS / clickjacking | Helmet; `X-Frame-Options: DENY` |
| Information disclosure | Generic error messages; no stack traces in API responses |

---

## Role-Based Access Control

| Feature | Admin | Viewer |
|---------|:-----:|:------:|
| View products | ✅ | ✅ |
| Add product | ✅ | ❌ |
| Edit product | ✅ | ❌ |
| Delete product | ✅ | ❌ |
| View dashboard | ✅ | ✅ (welcome + browse card) |
| View revenue / analytics charts | ✅ | ❌ |
| AI description generation | ✅ | ❌ |
| Set user roles | ✅ | ❌ |

Enforced in **two places**: UI (`useRole`, `RoleGuard`) and API (`authorize` middleware returning **403**).

---

## Deployment

### Frontend — Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Add all `VITE_*` environment variables (see table above).
4. Set `VITE_API_BASE_URL` to `https://saas-dashboard-backend-0kwm.onrender.com`.
5. Deploy. SPA routing is handled by `frontend/vercel.json`.

### Backend — Render

1. Create a **Web Service** from the same repo; **Root Directory** `backend`.
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm start`
4. Set backend env vars (`FIREBASE_*`, `FRONTEND_URL`, optional `GROQ_API_KEY`).
5. Set `FRONTEND_URL` to `https://saas-dashboard-one-vert.vercel.app`.

### Render free tier — cold start

The backend sleeps after inactivity. The **first request after idle can take up to ~60 seconds**. The frontend Axios client uses a **60 s timeout** to accommodate this. Subsequent requests are fast. Upgrade to a paid Render plan or use a keep-alive ping for production demos.

### Firestore

After deploying app code, deploy rules and indexes from your machine:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Run `npm run seed` once against production Firebase credentials if demo data is needed.

---

## Trade-offs

Honest scope decisions made to ship a complete, reviewable MVP:

| Decision | Rationale |
|----------|-----------|
| **Admin SDK for all writes** | Simpler server code; Firestore rules remain defense-in-depth for client SDK |
| **In-memory text search** | Firestore has no `LIKE`; full-text needs Algolia/Typesense at scale |
| **Static revenue chart** | No orders/transactions model yet; chart demonstrates UI only |
| **Analytics loads all product fields** | Fine for demo scale; would use pre-aggregates or BigQuery later |
| **Groq for AI** | Free-tier friendly; optional feature |
| **Single tenant** | No `organizationId`; shared catalog |
| **No automated tests yet** | CI runs typecheck, lint, build; tests deferred (see What's Next) |
| **Offset pagination** | Simple; cursor-based pagination better at very large scale |

---

## What's Next

With another week, these would be the priorities:

1. **Unit tests** — Jest + React Testing Library (frontend), Supertest (backend)
2. **E2E tests** — Playwright covering login, CRUD, and role enforcement
3. **Real-time updates** — Firestore `onSnapshot` listeners for live product table
4. **Multi-tenancy** — `organizationId` on products + tenant-scoped queries and rules
5. **Audit log** — `/auditLogs` collection with actor, action, and diff
6. **Redis for rate limiting** — replace Firestore counters for production scale
7. **CSV export** — admin-only product download
8. **Docker Compose** — one-command local dev

---

## AI Tool Usage

Used **Cursor AI** and **Claude** to accelerate development. All code was reviewed, understood, and can be explained line by line in a technical walkthrough.

AI helped with scaffolding (folder structure, middleware, Zod validators, Firestore rules, seed script, UI components). Every suggestion was edited, type-checked, and verified manually — especially auth flow, RBAC (claims → middleware → rules), and input validation.

---

## CI

GitHub Actions on push to `main` / `develop` and PRs to `main`:

- **Frontend** — TypeScript, lint, production build
- **Backend** — TypeScript, lint

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## License

ISC
