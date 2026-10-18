# 🚗 Arif Car Sell — Ethiopia's Premier Automotive Marketplace

<div align="center">

![Arif Car Sell](https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80)

**A high-performance, full-stack digital vehicle marketplace & brokerage platform tailored for the Ethiopian automotive ecosystem.**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

[Live Demo](#-getting-started) • [Key Features](#-core-capabilities) • [Architecture](#-technology-stack) • [API Documentation](#-api-endpoints) • [Demo Accounts](#-pre-seeded-demo-accounts)

</div>

---

## 📖 Executive Overview

**Arif Car Sell** is a modern, enterprise-ready vehicle marketplace and brokerage concierge system built specifically to modernize vehicle trading across Ethiopia. Designed for buyers, private sellers, licensed brokers, and platform administrators, Arif Car Sell brings transparency, security, and velocity to automobile commerce priced in Ethiopian Birr (ETB).

From importing electric and hybrid models in Addis Ababa to verifying vehicle titles (*Libre*), scheduling certified inspections, booking test drives, and calculating broker commissions, Arif Car Sell provides an end-to-end digital experience.

The platform comes fully equipped with a **MongoDB / Mongoose** persistence layer, automated sample catalog seeding with popular Ethiopian market models (Toyota, BYD, Volkswagen ID.4, Hyundai, Suzuki, Isuzu), Cloudinary media management, and robust authentication with role-based access control.

---

## 🌟 Core Capabilities

### 🔍 1. Public Showroom & Discovery
- **Multi-Parameter Search & Filtering:** Filter by brand, price range (ETB), fuel type (*Benzine, Diesel, Electric, Hybrid*), transmission (*Automatic, Manual*), body type, condition (*New, Like New, Used*), and location (Addis Ababa sub-cities, Adama, Hawassa, Bahir Dar).
- **Side-by-Side Comparison Engine:** Compare multiple vehicles simultaneously across horsepower, engine capacity, fuel efficiency, transmission, drive type, and pricing.
- **Deep Vehicle Specifications:** Detailed vehicle pages highlighting mileage, chassis number, engine type, customs clearance (*Libre*) status, inspection histories, and photo galleries.
- **Direct Engagement:** One-click buyer inquiry (lead) generation, test drive appointment scheduling with date/time pickers, and listing report tools.
- **Saved Watchlist:** Store favorite vehicles with instant local and account-synchronized watchlists.

### 💼 2. Broker & Private Seller Command Center
- **Vehicle Inventory Management:** Create and manage listings with photo uploads, rich specs, and status lifecycles (`pending` → `approved` → `sold`).
- **Cloud Media Uploads:** Multi-file image uploading powered by Cloudinary with local storage fallback.
- **Lead Pipeline CRM:** Track buyer inquiries through status stages (`new` → `contacted` → `negotiating` → `sold` / `cancelled`).
- **Commission Calculator:** Real-time earnings estimator supporting custom percentage rates or fixed fee structures.
- **Test-Drive Booking Coordination:** Review, confirm, and manage customer test-drive requests.
- **Broker Licensing & Profile:** Showcase verified credentials, professional bio, and contact information.

### 🛡️ 3. Administrative Governance & Analytics
- **Listing Moderation:** Streamlined review queue to approve or reject submissions with granular rejection notes.
- **Broker Verification:** Review broker licenses, ID documents, and issue platform verification badges.
- **Vehicle Inspection Records:** Create and publish official multi-point inspection reports (pass/fail status with inspector notes).
- **Document Vault:** Securely link customs clearance forms, title certificates (*Libre*), and compliance documents to vehicle records.
- **Audit Logging:** Tamper-evident logging of all administrative actions with admin identities and timestamps.
- **Business Intelligence:** Real-time analytics tracking active inventory, lead conversion, gross vehicle volume, and platform commissions.
- **Live Site CMS:** Update homepage hero backgrounds, promotional announcements, and site-wide settings directly from the dashboard.

---

## 🔒 Enterprise Security & Architecture

- **JWT Session Security:** Dual-mode authentication supporting secure HTTP-only cookies and standard `Authorization: Bearer` headers with 7-day expiration.
- **Bcrypt Password Encryption:** Async password hashing with salt rounds protecting user credentials.
- **Role-Based Access Control (RBAC):** Strict endpoint guards enforcing privileges for `buyer`, `seller`, `broker`, and `admin`.
- **Zod Runtime Validation:** Input validation and sanitization on all incoming registration, vehicle, lead, sale, report, and inspection requests.
- **Rate Limiting & Anti-Brute Force:** Tiered `express-rate-limit` policies protecting against DDoS attacks and brute-force authentication attempts.
- **Security Headers:** Strict `helmet` configuration and explicit CORS origin whitelisting.
- **High-Performance Caching:** `node-cache` memory cache reducing database load on frequent catalog queries.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 6 |
| **Routing & State** | React Router 7, Zustand 5 |
| **Styling & Design** | Tailwind CSS v4, Lucide React, Glassmorphic & Dark/Light theme design |
| **Animations** | Motion (Framer Motion v12) |
| **Backend API** | Node.js 20+, Express 4, TypeScript (`tsx` development runner) |
| **Database & ODM** | MongoDB, Mongoose 9 (with automated schema indexing & seeding) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| **Validation** | Zod 4 runtime schema validation |
| **Media & Storage** | Cloudinary API + Local disk fallback via Multer |
| **Email Service** | Nodemailer (SMTP notifications for leads and approvals) |
| **Bundling & Build** | Vite 6 (client), esbuild (server CJS bundle) |

---

## 📁 Repository Structure

```
arif-car-sell/
├── backend/
│   ├── app.ts                  # Express application setup, routes & security middleware
│   ├── auth.ts                 # JWT generation, token verification & RBAC middleware
│   ├── server.ts               # Server entry point & Vite dev/production middleware
│   ├── db/
│   │   ├── index.ts            # Mongoose initialization & database access layer
│   │   ├── models.ts           # Mongoose schemas (User, Vehicle, Lead, Sale, etc.)
│   │   ├── seed.ts             # Pre-seeded catalog (18 realistic Ethiopian listings & users)
│   │   └── types.ts            # Internal database interface definitions
│   ├── middleware/
│   │   └── validate.ts         # Zod request validation middleware
│   ├── services/
│   │   ├── cache.ts            # In-memory node-cache service
│   │   ├── cloudinary.ts       # Cloudinary upload service with local disk fallback
│   │   └── notifications.ts   # Nodemailer email notification handlers
│   └── validators/
│       └── index.ts            # Zod validation schemas for all entities
├── frontend/
│   ├── index.html              # HTML entry with Arif Car Sell branding
│   ├── vite.config.ts          # Vite build configuration with Tailwind CSS v4 plugin
│   └── src/
│       ├── App.tsx             # Root router, navigation bar & global notifications
│       ├── main.tsx            # React application bootstrapper
│       ├── index.css           # Global Tailwind CSS directives & custom design tokens
│       ├── dashboards/
│       │   ├── AdminPanel.tsx          # Full admin oversight & analytics console
│       │   ├── AdminProfilePage.tsx    # Administrator profile settings
│       │   ├── BrokerDashboard.tsx     # Broker inventory, leads & commission tracker
│       │   ├── BrokerProfilePage.tsx   # Public/private broker portfolio page
│       │   └── BuyerProfilePage.tsx    # Buyer inquiries, test drives & saved vehicles
│       ├── pages/
│       │   ├── HomePage.tsx            # High-conversion landing page & featured cars
│       │   ├── Showroom.tsx            # Vehicle catalog browser with live filters
│       │   ├── VehicleDetail.tsx       # Detailed vehicle view & lead form
│       │   ├── VehicleComparison.tsx   # Side-by-side spec comparison matrix
│       │   ├── LoginPage.tsx           # Email/password authentication page
│       │   ├── RegisterPage.tsx        # Multi-role account registration
│       │   ├── ChooseRolePage.tsx      # Role selection gateway
│       │   ├── AboutPage.tsx           # Company background & mission
│       │   ├── ServicesPage.tsx        # Brokerage & inspection service details
│       │   ├── ContactPage.tsx         # Customer contact & inquiry form
│       │   ├── HelpPage.tsx            # Platform FAQ & user support
│       │   ├── TermsPage.tsx           # Terms of service
│       │   └── PrivacyPage.tsx         # Privacy policy
│       ├── components/
│       │   └── ui/
│       │       ├── AuthModal.tsx       # Quick login/registration modal
│       │       ├── CommissionCalculator.tsx # Dynamic broker earnings calculator
│       │       ├── Logo.tsx            # Official Arif Car Sell SVG logo
│       │       └── ReportModal.tsx     # Listing/broker incident report dialog
│       ├── hooks/                      # Custom hooks (useAuth, etc.)
│       ├── lib/                        # Axios/fetch API client helpers
│       └── store/                      # Zustand global state (theme, favorites, cart)
├── shared/
│   └── types.ts                # Shared TypeScript contracts between client & server
├── .env.example                # Environment variable configuration template
├── package.json                # Project dependencies & build scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/car-broker-showcase.git
cd car-broker-showcase

# Install dependencies for root, frontend, and backend
npm install
```

### 2. Configure Environment Variables

Create your local `.env` file from the provided template:

```bash
cp .env.example .env
```

Open `.env` and configure your settings:

```env
# Arif Car Sell — Environment Configuration

# ─── Authentication ──────────────────────────────────────────────────────────
JWT_SECRET="your-super-secure-secret-key-at-least-32-chars-long"

# ─── Database (MongoDB) ──────────────────────────────────────────────────────
MONGODB_URI="mongodb://localhost:27017/arif_car_sell"

# ─── Cloudinary (Optional — falls back to local disk uploads) ─────────────────
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ─── SMTP Email Notifications (Optional) ──────────────────────────────────────
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@arifcarsell.et"

# ─── Application URL ─────────────────────────────────────────────────────────
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> **Note on Database:** On startup, the system connects to MongoDB and automatically seeds 18 comprehensive vehicle records (Toyota Land Cruiser 300, BYD Song Plus EV, VW ID.4, Hyundai Tucson, Suzuki Dzire, and more) along with sample brokers and admin accounts if the database is fresh.

### 3. Run the Development Server

Start both the backend Express API and the Vite frontend HMR server simultaneously:

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-configured with test accounts across all roles.  
The default password for all demo accounts is: **`password123`**

| Role | Name | Email | Default Password | Primary Dashboard |
|---|---|---|---|---|
| **Admin** | Abebe Kebede | `abebe.k@autobroker.et` | `password123` | `/admin` |
| **Broker** | Yonas Hailu | `yonas.h@autobroker.et` | `password123` | `/broker-dashboard` |
| **Broker** | Tigist Assefa | `tigist.a@autobroker.et` | `password123` | `/broker-dashboard` |
| **Seller** | Mesfin Tadese | `mesfin.t@autobroker.et` | `password123` | `/broker-dashboard` |
| **Buyer** | Dawit Lemma | `dawit.l@gmail.com` | `password123` | `/profile` |

> Quick-fill demo account buttons are also available on both the **Login Page** (`/login`) and the **Auth Modal**.

---

## 🌐 API Endpoints Reference

### 🔐 Authentication & Accounts
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new account (`buyer`, `broker`, or `seller`) |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password, receives JWT |
| `POST` | `/api/auth/logout` | Authenticated | Clears authentication cookies |
| `POST` | `/api/auth/change-password` | Authenticated | Change user account password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current authenticated user profile |
| `GET` | `/api/users` | Admin | List all registered users |
| `PUT` | `/api/users/:id` | Self / Admin | Update profile information |

### 🚗 Vehicle Listings
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | Public | Query vehicles with search, status, and category filters |
| `GET` | `/api/vehicles/:id` | Public | Fetch detailed specifications and gallery for a vehicle |
| `POST` | `/api/vehicles` | Broker / Seller / Admin | Submit a new vehicle listing |
| `PUT` | `/api/vehicles/:id` | Owner / Admin | Update listing details, specs, or pricing |
| `DELETE` | `/api/vehicles/:id` | Owner / Admin | Delete a vehicle listing |
| `PUT` | `/api/vehicles/:id/approve` | Admin | Approve pending listing for the public showroom |
| `PUT` | `/api/vehicles/:id/reject` | Admin | Reject listing with moderator feedback |
| `PUT` | `/api/vehicles/:id/submit` | Owner | Submit draft listing for admin moderation |

### 📬 Leads & Inquiries
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/leads` | Broker / Admin | List buyer leads (filtered by broker ownership) |
| `POST` | `/api/leads` | Public | Submit a buyer purchase inquiry for a vehicle |
| `PUT` | `/api/leads/:id/status` | Broker / Admin | Update inquiry status (`contacted`, `negotiating`, etc.) |
| `POST` | `/api/contact` | Public | General site contact inquiry |

### 🏎️ Test Drives & Saved Vehicles
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/test-drives` | Authenticated | Retrieve test-drive appointments |
| `POST` | `/api/test-drives` | Public | Request a test-drive appointment with preferred date/time |
| `PUT` | `/api/test-drives/:id/status` | Broker / Admin | Update test-drive status (`confirmed`, `completed`, `cancelled`) |
| `GET` | `/api/saved-vehicles` | Authenticated | Retrieve user's saved favorite vehicles |
| `POST` | `/api/saved-vehicles` | Authenticated | Add vehicle to personal favorites |
| `DELETE` | `/api/saved-vehicles` | Authenticated | Remove vehicle from favorites |

### 💼 Sales, Brokers & Commissions
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/brokers` | Public | List verified vehicle brokers |
| `GET` | `/api/brokers/:id` | Public | Get broker details and active listings |
| `PUT` | `/api/brokers/:id/approve` | Admin | Approve broker verification license |
| `GET` | `/api/sales` | Broker / Admin | View completed vehicle sales records |
| `POST` | `/api/sales` | Broker / Admin | Record a finalized sale and commission |
| `POST` | `/api/commissions/calculate`| Authenticated | Calculate commission based on vehicle price |

### 🛠️ Inspections, Documents & Moderation
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/inspections` | Owner / Admin | Fetch inspection reports for a vehicle |
| `POST` | `/api/inspections` | Admin | Add a formal technical inspection record |
| `GET` | `/api/documents` | Owner / Admin | Retrieve legal and customs clearance documents |
| `POST` | `/api/documents` | Owner / Admin | Upload vehicle title (*Libre*) or customs documents |
| `GET` | `/api/reports` | Admin | View submitted listing and broker reports |
| `POST` | `/api/reports` | Public | Report an inaccurate listing or suspicious broker |
| `PUT` | `/api/reports/:id/status` | Admin | Moderate report (`investigating`, `resolved`, `dismissed`) |
| `GET` | `/api/audit-logs` | Admin | View chronological audit log history |

### ⚙️ System & Media
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/status` | Public | Healthcheck and database connectivity status |
| `GET` | `/api/stats` | Admin | High-level administrative revenue and listing statistics |
| `GET` | `/api/stats/public` | Public | Public aggregate statistics (total listings, brands) |
| `POST` | `/api/upload` | Authenticated | Upload a single vehicle image or document |
| `POST` | `/api/upload/multiple`| Authenticated | Upload up to 5 vehicle gallery images |
| `GET` | `/api/settings` | Public | Fetch dynamic platform configurations (hero banner, etc.) |
| `PUT` | `/api/settings/:key` | Admin | Update site configuration key |

---

## 📦 NPM Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server with embedded Vite HMR on port 3000 |
| `npm run build` | Compiles the frontend SPA (`frontend/dist/`) and bundles backend (`dist/server.cjs`) |
| `npm run start` | Executes the optimized production server bundle |
| `npm run lint` | Runs TypeScript type checking across the entire project (`tsc --noEmit`) |
| `npm run clean` | Removes build artifacts (`dist/` directory) |
| `npm run dev:restart` | Automatically frees port 3000 and restarts the dev server |

---

## 🏭 Production Deployment

### 1. Build the Production Bundle

```bash
npm run build
```

This compiles:
- `frontend/dist/` — Optimized production React single-page application.
- `dist/server.cjs` — Bundled production Node.js backend.

### 2. Launch Production Server

```bash
NODE_ENV=production npm run start
```

### 3. Vercel Deployment

Arif Car Sell is configured for seamless deployment on Vercel:
- Frontend build command: `npm run vercel-build`
- Root directory: `./`
- Set required environment variables (`MONGODB_URI`, `JWT_SECRET`, etc.) in the Vercel dashboard.

---

## 🤝 Contributing

Contributions to elevate Arif Car Sell are welcome:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for the Ethiopian automotive marketplace by the Arif Car Sell Team.</sub>
</div>
