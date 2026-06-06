# 🚗 AutoBroker Ethiopia — Elite Vehicle Procurement Concierge

<div align="center">

![AutoBroker Ethiopia](https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80)

**A full-stack vehicle procurement platform tailored for the Ethiopian automotive market.**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Optional-4479A1?logo=mysql)](https://www.mysql.com/)

</div>

---

## 📖 Overview

**AutoBroker Ethiopia** is a premium, full-stack web application that digitises the vehicle brokerage business in Ethiopia. It enables brokers to list and manage imported vehicles, buyers to browse and inquire about cars priced in ETB (Ethiopian Birr), and administrators to oversee the entire procurement pipeline.

The platform runs seamlessly with an **in-memory simulated database** (zero setup) or a production **MySQL** backend.

---

## ✨ Features

### 🏠 Public Showroom
- Browse premium, broker-approved vehicle listings
- Filter by brand, fuel type, transmission, and price range
- Detailed vehicle pages with full specs, mileage, and sourcing savings
- Submit buyer inquiries (leads) directly from a vehicle listing


### 👤 Authentication
- Lightweight email-based registration and login (no passwords)
- Role-based access: `buyer`, `broker`, `admin`

### 🧑‍💼 Broker Dashboard
- View your personal vehicle listings and their statuses (`pending`, `approved`, `sold`)
- Track buyer inquiries and leads tied to your listings
- Review your commission earnings

### 🛡️ Admin Panel
- Full vehicle lifecycle management: approve, edit, or delete listings
- Lead management with status tracking (`new` → `contacted` → `negotiating` → `sold`)
- Sales recording and revenue/commission analytics
- Real-time dashboard statistics (total vehicles, leads, revenue, commissions)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| **Backend** | Node.js, Express 4, TypeScript (`tsx` dev runner) |
| **Database** | MySQL 2 (optional) / In-Memory fallback |
| **Animations** | Motion (Framer Motion v12) |
| **Icons** | Lucide React |
| **Build** | esbuild (production bundle) |

---

## 📁 Project Structure

```
car-broker-showcase/
├── backend/
│   ├── server.ts          # Express server — API routes
│   ├── db.ts              # Database layer (MySQL + in-memory fallback)
│   └── schema.sql         # MySQL schema with seed data
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Root component & routing logic
│   │   ├── main.tsx                   # React entry point
│   │   ├── index.css                  # Global styles
│   │   └── components/
│   │       ├── HomePage.tsx           # Landing page
│   │       ├── Showroom.tsx           # Vehicle listing browser
│   │       ├── VehicleDetail.tsx      # Single vehicle detail page
│   │       ├── BrokerDashboard.tsx    # Broker self-service portal
│   │       ├── AdminPanel.tsx         # Admin management console
│   │       └── AuthModal.tsx          # Login / Register modal
│   ├── index.html
│   └── vite.config.ts
├── shared/                # Shared types between frontend & backend
├── .env.example           # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or later
- **npm** v9 or later
- *(Optional)* A running **MySQL** instance for production data persistence

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/car-broker-showcase.git
cd car-broker-showcase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Optional — URL where the app is hosted (used for self-referential links)
APP_URL="http://localhost:3000"

# Optional — MySQL connection (leave blank to use in-memory database)
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_db_password"
DB_NAME="autobroker_ethiopia"
```

### 4. (Optional) Set Up MySQL

If you want persistent data, run the schema against your MySQL instance:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `autobroker_ethiopia` database, all tables, and seeds demo data including:
- Admin, broker, and buyer user accounts
- 4 sample vehicle listings (Toyota, Changan, Hyundai, Suzuki)
- Sample leads and a completed sale record

> **Without MySQL configured**, the app automatically falls back to a fully-functional in-memory database — perfect for demos and local development.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to explore all roles (email-only login, no password):

| Role | Name | Email |
|---|---|---|
| **Admin** | Abebe Kebede | `abebe.k@autobroker.et` |
| **Broker** | Yonas Hailu | `yonas.h@autobroker.et` |
| **Broker** | Tigist Assefa | `tigist.a@autobroker.et` |
| **Buyer** | Dawit Lemma | `dawit.l@gmail.com` |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | App & DB health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login by email |
| `POST` | `/api/chat` | Chat / messaging endpoint |
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Add a new vehicle listing |
| `PUT` | `/api/vehicles/:id` | Update a vehicle |
| `PUT` | `/api/vehicles/:id/approve` | Approve a pending vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete a vehicle |
| `GET` | `/api/leads` | List all buyer inquiries |
| `POST` | `/api/leads` | Submit a buyer inquiry |
| `PUT` | `/api/leads/:id/status` | Update lead status |
| `GET` | `/api/sales` | List all completed sales |
| `POST` | `/api/sales` | Record a new sale |
| `GET` | `/api/stats` | Dashboard aggregate statistics |

---

## 🗄️ Database Schema

```
users        → id, name, email, phone, role
brokers      → id, user_id, license_number, commission_rate
vehicles     → id, broker_id, brand, model, year, mileage, price, original_price,
               status, image_url, description, fuel_type, transmission, location
leads        → id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone,
               message, inquiry_date, status
sales        → id, vehicle_id, broker_id, buyer_id, sale_price, commission, sale_date
```

Vehicle statuses: `pending` → `approved` → `sold`  
Lead statuses: `new` → `contacted` → `negotiating` → `sold` / `cancelled`

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Express + Vite HMR) on port 3000 |
| `npm run build` | Build the production bundle (frontend + backend) |
| `npm run start` | Serve the production build |
| `npm run lint` | TypeScript type-check (no emit) |
| `npm run clean` | Remove the `dist/` build output |

---

## 🏭 Deployment

### Build for Production

```bash
npm run build
npm run start
```

This outputs:
- `frontend/dist/` — the compiled React SPA (served as static files by Express)
- `dist/server.cjs` — the bundled Express server

### Environment Variables (Production)

Ensure the following are set in your production environment:

```
NODE_ENV=production
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=autobroker_ethiopia
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is for demonstration and portfolio purposes.

---

<div align="center">
Built with ❤️ for the Ethiopian automotive market
</div>
