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

### What you need installed first

Before anything, make sure these are on your computer:

1. **Node.js** — Download from https://nodejs.org → click the big green "LTS" button → install it like any normal app
   - To check it worked, open Terminal (Mac) or Command Prompt (Windows) and type: `node --version`
   - You should see something like: `v20.0.0` ✅

2. **Git** — Download from https://git-scm.com/downloads
   - To check it worked, type: `git --version` ✅

3. **A Firebase account** — Free at https://firebase.google.com (just sign in with any Google account)

That's all you need. No other software required.

---

### Step 1 — Download the project

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
git clone https://github.com/Janvi885/saas-dashboard.git
cd saas-dashboard
npm run install:all
```

This downloads the code and installs everything automatically. It will take 1-2 minutes. ☕

---

### Step 2 — Set up Firebase (one time only)

You need a Firebase project to store data and handle logins.

**Create the project:**
1. Go to https://console.firebase.google.com
2. Click **"Add project"** → give it any name → click through the steps → click **"Create project"**

**Turn on Email/Password login:**
1. In your project, click **"Authentication"** in the left menu
2. Click **"Get started"**
3. Click **"Email/Password"** → toggle it ON → click **"Save"**

**Create the database:**
1. Click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in production mode"** → click **"Next"**
4. Pick any location → click **"Enable"**

**Get your frontend config keys:**
1. Click the ⚙️ gear icon → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **</>** (web) icon → give it a name → click **"Register app"**
4. You will see a block of code with values like `apiKey`, `authDomain` etc. — keep this page open, you need it in Step 3.

**Get your backend service account key:**
1. Still in Project settings → click **"Service accounts"** tab
2. Click **"Generate new private key"** → click **"Generate key"**
3. A JSON file downloads to your computer — keep it safe, you need values from it in Step 3.

**Deploy security rules (recommended):**

Paste the contents of `firestore.rules` from this repo into the Firebase Console under **Firestore → Rules**, then click **Publish**. Or, if you have the Firebase CLI installed:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

### Step 3 — Add your secret keys

**For the backend:**

1. Go into the `backend/` folder
2. Find the file called `.env.example`
3. Make a copy of it and rename the copy to `.env` (just `.env` — no ".example")
4. Open `.env` in any text editor (Notepad, TextEdit, VS Code)
5. Fill in the values from your Firebase service account JSON file:
   - `FIREBASE_PROJECT_ID` → copy `"project_id"` from the JSON
   - `FIREBASE_CLIENT_EMAIL` → copy `"client_email"` from the JSON
   - `FIREBASE_PRIVATE_KEY` → copy the entire `"private_key"` value (keep it in quotes; use `\n` for line breaks)
   - Leave `PORT`, `NODE_ENV`, and `FRONTEND_URL` as they are for local development
   - `GROQ_API_KEY` is optional — leave it blank unless you want AI-generated descriptions
6. Save the file

**For the frontend:**

1. Go into the `frontend/` folder
2. Copy `.env.example` → `.env` (same as above — rename the copy to `.env`)
3. Open `.env` in your text editor
4. Fill in the values from the Firebase web app config block you saw in Step 2:
   - `VITE_FIREBASE_API_KEY` → `apiKey`
   - `VITE_FIREBASE_AUTH_DOMAIN` → `authDomain`
   - `VITE_FIREBASE_PROJECT_ID` → `projectId`
   - `VITE_FIREBASE_STORAGE_BUCKET` → `storageBucket`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` → `messagingSenderId`
   - `VITE_FIREBASE_APP_ID` → `appId`
   - `VITE_FIREBASE_MEASUREMENT_ID` → `measurementId` (optional — leave blank if you skipped Analytics)
   - Keep `VITE_API_BASE_URL=http://localhost:5000` for local development
5. Save the file

> Full variable reference: [Environment variables](#environment-variables) below.

---

### Step 4 — Load sample data

Open Terminal in the `backend/` folder and run:

```bash
cd backend
npm run seed
```

This creates the two test users (`admin@test.com` / `viewer@test.com`) and 20 sample products. Safe to re-run — it skips if data was already seeded.

---

### Step 5 — Run the app

From the project root folder, run:

```bash
npm run dev
```

Then open your browser:

- **Frontend:** http://localhost:3000
- **API health check:** http://localhost:5000/health

Log in with `admin@test.com` / `Admin123!` to try everything. 🎉

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
