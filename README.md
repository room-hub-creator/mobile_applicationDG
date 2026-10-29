# D&G Rwanda E-Commerce Platform & Expo Go Mobile App 🇷🇼📱

A production-ready mobile-responsive e-commerce web platform and a native **Expo Go Mobile Application** with comprehensive administrative management built for D&G Rwanda.

---

## 📱 How to Run on Mobile via Expo Go

You can run the native mobile app on any physical Android or iOS device using **Expo Go**:

### 1. Install Expo Go
- **Android**: Install [Expo Go on Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone / iPad**: Install [Expo Go on App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Launch Expo
```bash
# Option A: From project root
npm run expo

# Option B: Direct
cd mobile && npx expo start
```
*(Tip: If your phone is on cellular or a different network, run `npx expo start --tunnel`)*

### 3. Scan the QR Code
- **Android**: Open **Expo Go**, tap **"Scan QR code"**, and point at the QR code in your computer terminal.
- **iPhone**: Open the default **Camera app**, point at the terminal QR code, and tap the **"Open in Expo Go"** banner.

---

- **Storefront & Mobile Experience**:
  - Browse categorized catalog (Beverages, Fresh Food, Electronics, Home & Living, Fashion, Bakery, Cosmetics).
  - Search and filter by category, price, and popularity.
  - Multi-item shopping cart with quantity management and delivery fee calculation.
  - Live checkout supporting Mobile Money (MTN MoMo, Airtel Money) and Cash on Delivery (Rwamagana local delivery).
  - Real-time order tracking with step-by-step dispatch status and live driver progress.
  - Trilingual UI: English, Kinyarwanda, and French.

- **Admin Management Dashboard**:
  - Overview of sales, daily revenues, order volume, and top-selling inventory.
  - Product Catalog CRUD: add, edit, stock adjustments, pricing in RWF.
  - Order Management: review orders, dispatch updates (Pending -> Confirmed -> Processing -> Out for Delivery -> Delivered).
  - User and Staff Management: role-based access control (Admin, Manager, Customer).
  - Database Studio: view persistent database state, import/export backups, and seed reset.
  - System Settings: configure delivery fees, free delivery thresholds, support contacts, and store operating hours.

- **AI Shopping Assistant**:
  - Interactive smart assistant grounded in D&G store products, local delivery zones in Rwamagana, and Rwandan Franc (RWF) pricing.

- **Persistent Backend & REST API**:
  - Express.js API server running on port 3000.
  - Persistent JSON database in `data/dg_database.json`.
  - Authentication endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`).
  - Strict role authorization ensuring only admins/managers can perform management actions.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation
```bash
npm install
```

### Running Locally
```bash
# Starts both the backend API and frontend dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

### Default Accounts in Persistent Database
- **Administrator**: `admin@dg-rwanda.rw` (Role: `admin`)
- **Store Manager**: `manager@dg-rwanda.rw` (Role: `manager`)
- **Customer**: `ishipi2003@gmail.com` (Role: `customer`)

## Project Structure
```
├── data/
│   └── dg_database.json       # Persistent database store
├── src/
│   ├── components/
│   │   ├── admin/             # Admin management dashboard
│   │   ├── common/            # Navbar, AI Assistant, Toast
│   │   ├── mobile/            # Mobile storefront screens & modals
│   │   └── testing/           # Test suite & verification view
│   ├── context/               # Global state & authentication provider
│   ├── i18n/                  # Kinyarwanda, English, French strings
│   ├── server/                # REST API router & database controller
│   ├── types.ts               # TypeScript data models
│   ├── App.tsx                # Main view router
│   └── main.tsx               # Client entry point
├── server.ts                  # Express server & Vite integration
└── vite.config.ts             # Vite configuration
```
