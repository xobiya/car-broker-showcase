# 🚗 Arif Car Sell — Ethiopia's Premier Automotive Marketplace

<div align="center">

![Arif Car Sell](https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80)

**A high-performance, full-stack digital vehicle marketplace & brokerage platform tailored for the Ethiopian automotive ecosystem.**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-black?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-116%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

[Executive Overview](#-executive-overview) • [Monorepo Architecture](#-monorepo-architecture) • [File Structure](#-clear-file-structure) • [Run Web Application](#-running-the-web-application) • [Run Mobile Application](#-running-the-mobile-application) • [API Reference](#-api-endpoints-reference) • [Demo Accounts](#-pre-seeded-demo-accounts) • [Deployment](#-production-deployment)

</div>

---

## 📖 Executive Overview

**Arif Car Sell** is an enterprise-grade automotive marketplace and brokerage concierge system built specifically to modernize vehicle trading across Ethiopia. Designed for buyers, private sellers, licensed commercial brokers, and platform administrators, Arif Car Sell brings transparency, velocity, and institutional trust to vehicle transactions priced in Ethiopian Birr (ETB).

From emerging electric and hybrid vehicle imports in Addis Ababa to verifying original vehicle title deeds (*Libre*), scheduling certified multi-point technical inspections, coordinating test drives, and calculating broker commissions, Arif Car Sell delivers an integrated digital experience across both web and native mobile clients.

The platform is structured as an npm workspaces **monorepo**, featuring:
- **Web Client:** Modern React 19 single-page application bundled with Vite 6 and styled with Tailwind CSS v4.
- **Mobile Client:** Cross-platform React Native app powered by Expo SDK 57 (Expo Router) supporting Android and iOS with native camera, photo gallery uploads, and Firebase Auth.
- **Backend API:** Robust Express 4 / Node.js 20+ service with MongoDB / Mongoose 9 persistence, JWT session security, RBAC enforcement, and automated catalog seeding.
- **Shared Contracts:** Unified TypeScript package (`@autobroker/shared`) keeping data transfer objects, domain models, and status enumerations in sync across all clients.

---

## 🏗️ Monorepo Architecture

The repository uses npm workspaces to coordinate multiple applications and shared libraries from a single root:

```
                            ┌───────────────────────────────────┐
                            │      @autobroker/shared           │
                            │   (packages/shared/index.ts)      │
                            └─────────────────┬─────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │     apps/web          │ │     apps/mobile       │ │      apps/api         │
        │  React 19 + Vite 6    │ │  Expo SDK 57 + RN     │ │  Express + Mongoose 9 │
        │  Tailwind CSS v4      │ │  Android & iOS        │ │  Zod + JWT Security   │
        └───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                                ┌───────────────────────────┐
                                │    REST API & Database    │
                                │   MongoDB / Mongoose 9    │
                                └───────────────────────────┘
```

### Technology Matrix

| Layer | Component | Technologies |
|---|---|---|
| **Web Client** | `apps/web` | React 19, Vite 6, Tailwind CSS v4, Lucide React, Zustand 5, Framer Motion |
| **Mobile Client** | `apps/mobile` | React Native 0.86, Expo SDK 57, Expo Router 4, TanStack Query, Expo SecureStore, Firebase Auth |
| **Backend API** | `apps/api` | Node.js 20+, Express 4.21, TypeScript 5.8 (`tsx` runner), esbuild |
| **Persistence** | `apps/api/db` | MongoDB, Mongoose 9 (automated indexing, schema validation, and catalog seeding) |
| **Shared Package** | `packages/shared` | TypeScript domain interfaces, vehicle DTOs, lead models, inspection records |
| **Security & Auth** | Full Stack | JWT, bcryptjs, HTTP-only cookies, Helmet, rate-limiting, strict IDOR ownership enforcement |
| **Media Management**| Backend/Client | Cloudinary API + Multer local disk upload fallback |
| **Testing** | Workspaces | Vitest (116 passing unit, integration, and security test cases) |

---

## 📁 Clear File Structure

```text
car-broker-showcase/
├── apps/
│   ├── api/                              # Backend Express REST API & Database Layer
│   │   ├── app.ts                        # Express application instance, CORS, security & route registration
│   │   ├── server.ts                     # Development & production server bootstrapper (mounts Vite in dev)
│   │   ├── auth.ts                       # JWT token signing, verification & RBAC authorization middleware
│   │   ├── index.ts                      # Vercel serverless function entry handler
│   │   ├── db/
│   │   │   ├── connection.ts             # MongoDB Mongoose connection manager with reconnection logic
│   │   │   ├── models.ts                 # Mongoose schemas (User, Vehicle, Lead, TestDrive, Sale, etc.)
│   │   │   ├── seed.ts                   # Automated catalog seeder with 18 Ethiopian market vehicles
│   │   │   └── types.ts                  # Database document types
│   │   ├── middleware/
│   │   │   └── validate.ts               # Generic Zod request schema validation middleware
│   │   ├── services/
│   │   │   ├── cache.ts                  # In-memory query caching via node-cache
│   │   │   ├── cloudinary.ts             # Cloudinary asset uploader with local disk fallback
│   │   │   └── email.ts                  # Nodemailer transaction notifications
│   │   ├── validators/                   # Zod validation schemas for all domain entities
│   │   │   ├── auth.ts                   # Auth credentials, registrations, and password rules
│   │   │   └── vehicle.ts                # Vehicle listing, inspection, and inquiry schemas
│   │   └── package.json                  # @autobroker/api package definition
│   │
│   ├── web/                              # React 19 Web Frontend Application
│   │   ├── index.html                    # Single-page application root HTML
│   │   ├── vite.config.ts                # Vite 6 configuration with Tailwind CSS v4 & React plugin
│   │   ├── package.json                  # @autobroker/web dependencies & scripts
│   │   └── src/
│   │       ├── main.tsx                  # React DOM mount point
│   │       ├── App.tsx                   # Top-level router, navigation bars & layout wrappers
│   │       ├── index.css                 # Global styling & Tailwind CSS v4 directives
│   │       ├── components/               # Reusable UI component library (modals, cards, badges)
│   │       ├── dashboards/               # Role-specific workspaces
│   │       │   ├── AdminDashboard.tsx    # Listing moderation, user management & audit logs
│   │       │   ├── BrokerDashboard.tsx   # Broker inventory, leads CRM & commission tracking
│   │       │   └── BuyerProfilePage.tsx  # Buyer saved vehicles, inquiries & test drive bookings
│   │       ├── pages/                    # Public showroom, vehicle details, comparison, login, etc.
│   │       ├── hooks/                    # Custom React hooks (useAuth, useFavorites, etc.)
│   │       ├── lib/                      # Client-side API fetch client & formatting utilities
│   │       └── store/                    # Zustand state management (theme, filters, session)
│   │
│   └── mobile/                           # React Native / Expo Mobile Application
│       ├── app.json                      # Expo application manifest & configuration (SDK 57)
│       ├── package.json                  # arif-car-sell-mobile dependencies & Expo scripts
│       ├── app/                          # Expo Router file-based screen routing
│       │   ├── _layout.tsx               # Root stack navigation, query provider & auth context wrapper
│       │   ├── (tabs)/                   # Tab navigation (Discover, Search, Saved, Seller, Profile)
│       │   ├── vehicle/                  # Vehicle detail view, inquiry modal & test drive request
│       │   └── auth/                     # Native sign in, sign up, and password reset screens
│       └── src/
│           ├── components/               # Mobile UI components (vehicle cards, bottom sheets, pills)
│           ├── features/                 # Modular domain slices (auth, vehicles, seller workspace)
│           ├── services/                 # API client, Firebase Identity Toolkit service, SecureStore
│           ├── theme/                    # Mobile design tokens (colors, typography, spacing)
│           └── types/                    # Mobile domain contracts
│
├── packages/
│   └── shared/                           # Shared Workspace Package (@autobroker/shared)
│       ├── index.ts                      # Barrel export file
│       ├── types.ts                      # Universal domain interfaces, DTOs & status types
│       └── package.json                  # @autobroker/shared manifest
│
├── api/
│   └── index.ts                          # Root Vercel serverless function proxy (delegates to apps/api)
├── dist/                                 # Production build output (bundled server & web client)
├── .env.example                          # Root environment template
├── render.yaml                           # Render cloud deployment blueprint
├── vercel.json                           # Vercel deployment configuration
├── vitest.config.ts                      # Vitest test suite configuration
├── tsconfig.json                         # Monorepo root TypeScript configuration
└── package.json                          # Workspace root orchestrator & unified scripts
```

---

## ⚡ Quick Start & Prerequisites

### Prerequisites

Before starting, ensure your system has:
- **Node.js**: `v20.0.0` or higher (`v22+` recommended for Expo SDK 57)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **For Mobile Development (Optional):**
  - Android Studio (for Android Emulator) or Xcode (for iOS Simulator, macOS only)
  - Alternatively, install **Expo Go** on your physical phone (iOS / Android)

### 1. Clone & Install Workspace

```bash
# Clone the repository
git clone https://github.com/your-username/car-broker-showcase.git
cd car-broker-showcase

# Install dependencies across all workspaces (root, api, web, mobile, shared)
npm install
```

### 2. Configure Environment Variables

Copy the example environment file at the repository root:

```bash
cp .env.example .env
```

Configure the essential keys in `.env`:

```env
# Server & Port
PORT=3000
NODE_ENV="development"
APP_URL="http://localhost:3000"

# JWT Authentication
JWT_SECRET="your-super-secure-random-secret-key-at-least-32-chars-long"

# Database Connection (MongoDB)
MONGODB_URI="mongodb://127.0.0.1:27017/arif_car_sell"

# Cloudinary Storage (Optional — falls back to local disk storage if blank)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# SMTP Notifications (Optional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@arifcarsell.et"
```

> **Automated Seeding:** On startup, if your database has no vehicles, the system automatically seeds **18 realistic Ethiopian market vehicles** (Toyota Land Cruiser 300, BYD Song Plus EV, VW ID.4 Crozz, Hyundai Tucson, Suzuki Dzire, Isuzu NPR, etc.) along with verified broker and admin demo accounts.

---

## 💻 Running the Web Application

The web development environment runs the Express API server and seamlessly mounts Vite in middleware mode. This gives you instant Hot Module Replacement (HMR) and API proxying on a single unified port (**3000**).

### Start Development Server

```bash
# From the repository root
npm run dev
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

*If port 3000 is occupied by an orphaned process, use `npm run dev:restart` to automatically free the port and relaunch.*

### Build & Run for Production

```bash
# Compile web client to apps/web/dist and bundle server to dist/server.cjs
npm run build

# Start the optimized production server
npm start
```

---

## 📱 Running the Mobile Application

The mobile app lives in `apps/mobile/` and is built with **Expo SDK 57** and **React Native**. It connects directly to the running backend API.

### 1. Set Up Mobile Environment

Navigate to the mobile directory:

```bash
cd apps/mobile
```

Copy the mobile environment template:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` based on your test device:

| Testing Target | Recommended `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| **Android Emulator** | `http://10.0.2.2:3000` *(Default Android loopback to host PC)* |
| **iOS Simulator** | `http://localhost:3000` *(macOS only)* |
| **Physical Phone (Expo Go)** | `http://<YOUR_COMPUTER_LAN_IP>:3000` *(e.g. `http://192.168.1.15:3000`)* |
| **Mobile Web Preview** | `http://localhost:3000` |

> **Important for Physical Phones:** Ensure your mobile phone and computer are connected to the same Wi-Fi network and that port 3000 is allowed through your computer's firewall.

### 2. Launch Commands

From `apps/mobile/`:

```bash
# Start the interactive Metro Bundler
npx expo start

# Direct launch commands:
npm run android    # Launch on running Android emulator or connected device via USB
npm run ios        # Launch on iOS Simulator (macOS only)
npm run web        # Launch in mobile browser preview
```

### 3. Firebase Authentication (Mobile)

The mobile client includes a lightweight, zero-native-dependency integration with the **Firebase Identity Toolkit REST API** (`apps/mobile/src/services/firebase.ts`). This allows Google Sign-in and Password Recovery to run seamlessly across Expo Go, Android APKs, and iOS:

1. Obtain your Web App configuration keys from the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** and **Google** under **Authentication > Sign-in method**.
3. Supply the keys in `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-app"
   ```

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-configured with test accounts across all roles.  
Default password for all demo accounts: **`password123`**

| Role | Name | Email | Password | Primary Portal / Access |
|---|---|---|---|---|
| **Admin** | Abebe Kebede | `abebe.k@autobroker.et` | `password123` | `/admin` (System Governance & Moderation) |
| **Broker** | Yonas Hailu | `yonas.h@autobroker.et` | `password123` | `/broker-dashboard` (Inventory, CRM & Sales) |
| **Broker** | Tigist Assefa | `tigist.a@autobroker.et` | `password123` | `/broker-dashboard` (Inventory, CRM & Sales) |
| **Seller** | Mesfin Tadese | `mesfin.t@autobroker.et` | `password123` | `/broker-dashboard` (Seller Workspace) |
| **Buyer** | Dawit Lemma | `dawit.l@gmail.com` | `password123` | `/profile` (Saved Vehicles & Test Drives) |

> 💡 **Quick Fill:** In the web application, one-click demo login buttons are provided on both the **Login Page** (`/login`) and the interactive **Auth Modal**.

---

## 🌐 API Endpoints Reference

All endpoints are prefixed with `/api` and strictly enforce ownership and role permissions.

### 🔐 Authentication & Profile
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new `buyer`, `seller`, or `broker` account |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password, receives JWT token |
| `POST` | `/api/auth/logout` | Authenticated | Clears session cookie and invalidates client session |
| `POST` | `/api/auth/change-password` | Authenticated | Update authenticated user password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role details |
| `POST` | `/api/auth/firebase-google` | Public | Synchronize Firebase Google identity token |
| `GET` | `/api/users` | Admin | List all registered platform accounts |
| `PUT` | `/api/users/:id` | Self / Admin | Update profile name, phone, or biography |

### 🚗 Vehicle Listings
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | Public | Search showroom with multi-attribute filtering & pagination |
| `GET` | `/api/vehicles/:id` | Public | Retrieve comprehensive vehicle specifications & media gallery |
| `POST` | `/api/vehicles` | Broker / Seller / Admin | Submit a new vehicle listing |
| `PUT` | `/api/vehicles/:id` | Owner / Admin | Update listing specifications, pricing, or images |
| `DELETE` | `/api/vehicles/:id` | Owner / Admin | Remove a vehicle listing |
| `PUT` | `/api/vehicles/:id/submit` | Owner | Submit a draft listing for administrative review |
| `PUT` | `/api/vehicles/:id/approve` | Admin | Approve pending listing for the public showroom |
| `PUT` | `/api/vehicles/:id/reject` | Admin | Reject listing with moderator feedback |

### 📬 Leads, Inquiries & Test Drives
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/leads` | Broker / Admin | List buyer leads (strictly isolated to owned listings) |
| `POST` | `/api/leads` | Public | Submit purchase inquiry or broker consultation request |
| `PUT` | `/api/leads/:id/status` | Broker / Admin | Transition lead pipeline status (`contacted`, `negotiating`, etc.) |
| `GET` | `/api/test-drives` | Authenticated | List scheduled test-drive appointments |
| `POST` | `/api/test-drives` | Public | Book a test-drive appointment with date/time picker |
| `PUT` | `/api/test-drives/:id/status` | Broker / Admin | Update test-drive status (`confirmed`, `completed`, `cancelled`) |

### ⭐ Favorites & Buyer Watchlist
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/saved-vehicles` | Authenticated | Retrieve authenticated user's saved vehicles |
| `POST` | `/api/saved-vehicles` | Authenticated | Save vehicle to account watchlist |
| `DELETE` | `/api/saved-vehicles/:id` | Authenticated | Remove vehicle from saved list |

### 💼 Brokers, Sales & Commissions
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/brokers` | Public | Browse verified automotive brokers |
| `GET` | `/api/brokers/:id` | Public | View broker credentials, active inventory, and reviews |
| `PUT` | `/api/brokers/:id/approve` | Admin | Verify and license a broker account |
| `GET` | `/api/sales` | Broker / Admin | View completed sales and commission records |
| `POST` | `/api/sales` | Broker / Admin | Record a finalized sale transaction |
| `POST` | `/api/commissions/calculate` | Authenticated | Real-time commission earnings estimator |

### 🔍 Inspections, Documents & Governance
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/inspections` | Owner / Admin | Retrieve vehicle inspection certificates |
| `POST` | `/api/inspections` | Admin | Record certified multi-point technical inspection report |
| `GET` | `/api/documents` | Owner / Admin | View vehicle title (*Libre*) and customs papers |
| `POST` | `/api/documents` | Owner / Admin | Upload title deed (*Libre*) or import documentation |
| `GET` | `/api/reports` | Admin | Review flagged vehicle listings or suspicious accounts |
| `POST` | `/api/reports` | Public | Submit report regarding inaccurate specs or fraudulent broker |
| `GET` | `/api/audit-logs` | Admin | View immutable chronological administrative audit trail |

### ⚙️ Media & System Status
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/status` | Public | Healthcheck and database connectivity diagnostics |
| `GET` | `/api/stats/public` | Public | Aggregate showroom statistics (counts, fuel distribution) |
| `POST` | `/api/upload` | Authenticated | Upload single photo or document (Cloudinary / Local disk) |
| `POST` | `/api/upload/multiple` | Authenticated | Upload up to 5 vehicle gallery images |

---

## 🧪 Testing & Security Verification

The platform maintains comprehensive automated testing and has undergone an exhaustive application security audit covering data isolation, IDOR prevention, and RBAC enforcement.

### Running Test Suites

```bash
# Run all Vitest unit and integration tests (116 tests)
npm test

# Run tests in interactive watch mode
npm run test:watch

# Execute TypeScript typechecking across root, api, and web workspaces
npm run lint

# Execute TypeScript typechecking on mobile app
npm run --prefix apps/mobile typecheck
```

### Security & Data Isolation Guarantees

- **Strict Ownership Checks:** Every mutation and private query (`/api/leads`, `/api/vehicles/:id`, `/api/saved-vehicles`, `/api/documents`) extracts the authenticated user ID directly from the validated server-side JWT context. Request payloads cannot override ownership fields.
- **IDOR / BOLA Prevention:** Verified across all endpoints. Users cannot view or modify listings, leads, or appointments belonging to other users.
- **Role-Based Access Control (RBAC):** Privileged endpoints (`/api/vehicles/:id/approve`, `/api/inspections`, `/api/audit-logs`) strictly require the `admin` role and reject ordinary users with HTTP 403.
- **Input Sanitization & Injection Defense:** All incoming requests are validated against strict Zod runtime schemas, preventing NoSQL query injection and parameter pollution.

---

## 🏭 Production Deployment

### Option 1: Vercel (Full-Stack / Serverless)

The repository is pre-configured with a root `api/index.ts` serverless proxy and `vercel.json`:

1. Import the repository into your **Vercel** dashboard.
2. In Project Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `apps/web/dist`
3. Configure your production environment variables (`MONGODB_URI`, `JWT_SECRET`, etc.).
4. Deploy.

### Option 2: Render (Web Service)

The included `render.yaml` orchestrates deployment of the Express service:

```bash
# Build command executed by Render:
cd ../.. && npm install && cd apps/api && npm run build

# Start command:
cd apps/api && npm run start
```

### Option 3: Traditional Linux VPS / Docker

```bash
# 1. Install production dependencies
npm ci --omit=dev

# 2. Build web client & bundle server
npm run build

# 3. Launch via PM2 or systemd
NODE_ENV=production PORT=3000 node dist/server.cjs
```

---

## 🤝 Contributing

We welcome contributions to elevate the Ethiopian digital automotive marketplace:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: implement amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with care for the Ethiopian automotive marketplace by the Arif Car Sell Team.</sub>
</div>
