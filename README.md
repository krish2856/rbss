# Rajgor Brahmin Samaj – Complete Digital Community Platform & Installable PWA
> **સર્વોચ્ચ ડિજિટલ મંચ – રાજગોર બ્રાહ્મણ સમાજ**  
> *Production-Ready Full-Stack Web Application, Mobile-First PWA & Administrative Portal*

---

## 1. System Overview & Brand Identity

The **Rajgor Brahmin Samaj Platform** is an enterprise-grade, community management ecosystem connecting members across Gujarat, India, and worldwide.

- **Brand Theme**: Traditional Indian heritage fused with modern tech elegance
- **Color Palette**:
  - Primary: **Deep Navy Blue** (`#0f172a`, `#1e3a8a`)
  - Accent / Secondary: **Royal Gold** (`#d97706`, `#b45309`, `#f59e0b`)
  - Background: **Warm Ivory & Clean Slate** (`#fcfbf7`, `#ffffff`)
- **Language Support**: Gujarati (ગુજરાતી), Hindi (हिन्दी), English (EN)
- **Form Factor**: Mobile-first installable Progressive Web App (PWA) + Separate Admin Command Dashboard

---

## 2. Architecture & Directory Structure

```
rba/
├── client/                     # Next.js 14+ PWA (Vercel Ready)
│   ├── public/
│   │   ├── manifest.json       # PWA Web App Manifest (standalone, theme colors)
│   │   ├── sw.js               # Service Worker (offline fallback, precaching)
│   │   ├── offline.html        # Custom Gujarati offline fallback page
│   │   ├── favicon.ico
│   │   └── icons/              # 72, 96, 128, 144, 152, 192, 384, 512 + maskables
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (auth)/         # Login, Register
│   │   │   ├── admin/          # Role-based Admin Dashboard
│   │   │   ├── announcements/  # Official notices & circulars
│   │   │   ├── blood-donors/   # Voluntary blood donor directory
│   │   │   ├── businesses/     # Member business directory
│   │   │   ├── careers/        # Scholarships & civil services mentorship
│   │   │   ├── donations/      # Samaj funds, digital 80G receipts & audit reports
│   │   │   ├── events/         # Events, Sneh Milan & RSVP tracking
│   │   │   ├── history/        # Vedic history, Kuldevis & committee
│   │   │   ├── matrimony/      # Marriage biodata & mutual interest workflow
│   │   │   ├── members/        # Member directory with search & privacy
│   │   │   ├── profile/        # Member profile, family details & privacy toggle
│   │   │   ├── layout.tsx      # Root layout with PWA meta & bottom nav
│   │   │   └── page.tsx        # Dynamic community landing page
│   │   ├── components/         # Navbar, BottomNav, PWAInstallPrompt, Footer
│   │   ├── context/            # AuthContext, I18nContext
│   │   └── lib/                # API client & full i18n dictionary (GU, HI, EN)
│   ├── next.config.mjs         # PWA headers, security headers, image optimization
│   ├── tailwind.config.ts      # Custom Samaj color tokens
│   └── vercel.json             # Vercel deployment configuration
├── server/                     # Node.js + Express.js API (Render Ready)
│   ├── src/
│   │   ├── config/             # Environment & configuration
│   │   ├── controllers/        # Auth, Members, Matrimony, Events, Donations, Admin
│   │   ├── db/                 # PostgreSQL schema.sql, seed data & db runner
│   │   ├── middleware/         # JWT auth, RBAC permissions, Rate limiter, Error handler
│   │   ├── routes/             # RESTful API routing (/api/...)
│   │   └── server.ts           # Express server entry point
│   ├── Dockerfile              # Production container build
│   └── render.yaml             # Render infrastructure specification
└── package.json                # Monorepo task orchestration scripts
```

---

## 3. PWA Installation Specification (Highest Priority)

The application functions as a **Progressive Web App (PWA)** that can be installed directly from the browser on mobile devices without going through Google Play Store or Apple App Store.

### Android Chrome Installation:
1. Open the application URL in **Google Chrome**.
2. Tap the **"Install App (એપ્લિકેશન ઇન્સ્ટોલ કરો)"** banner at the top of the screen (or tap the three dots **⋮** menu and choose **"Install app"** / **"Add to Home screen"**).
3. Confirm by tapping **"Install"**.
4. The application icon will be placed on your home screen and drawer, opening in **standalone fullscreen mode** without browser address bars.

### iPhone Safari Installation:
1. Open the application URL in **Apple Safari**.
2. Tap the **Share** button (icon with an arrow pointing upward out of a square `􀈂`) in the bottom navigation bar.
3. Scroll down in the share sheet and tap **"Add to Home Screen"** (`⊞`).
4. Tap **"Add"** at the top right corner.
5. The **Rajgor Samaj** icon will appear on your iOS home screen and launch with native splash screen & full touch gestures.

### PWA Security & Caching Strategy:
- **Service Worker (`public/sw.js`)**: Caches only safe static assets (`/offline.html`, icons, CSS, core bundles).
- **Zero Privacy Leakage**: Strictly **bypasses cache** for all authenticated endpoints (`/api/*`), guaranteeing that private member data and sensitive contact info are never cached or exposed publicly.
- **Offline Fallback**: When network connection drops, navigation requests gracefully display the custom Gujarati offline fallback page with emergency helpline numbers.

---

## 4. Member Application Modules

| Module | Features |
|---|---|
| **Member Registration & Login** | Mobile number + Password or 6-digit OTP verification; quick demo role switchers. |
| **Member Directory** | Search by name, surname, native village, current city, gotra, profession; phone number privacy toggle. |
| **Matrimony Portal** | Filter by gender, age, gotra, manglik status; verified biodatas; interest send/receive workflow; contact info unlocks only upon mutual acceptance. |
| **Events & Sneh Milan** | Upcoming & past programs, RSVP attendance management with guest count, venue mapping. |
| **News & Announcements** | Categories: Official Notices, Urgent, Condolences (બેસણું), Weddings, Birthdays, Academic Achievements. |
| **Donation & Samaj Fund** | Education Fund, Medical Aid Fund, Samaj Bhavan Fund; instant printable **Digital 80G Receipts**; transparency balance sheet. |
| **Education & Career** | Saraswati Sanman fellowships, job opportunities, civil services (UPSC/GPSC) mentorship. |
| **Business Directory** | Member-owned businesses, contact details, address, websites. |
| **Blood Donor Network** | Filter by blood group (A+, B+, O+, AB+, O-, etc.) and city; voluntary registration. |
| **Samaj History & Kuldevi** | Vedic origins, gotra directory, sacred pilgrimage guide (Chotila, Mata no Madh, Rajpara). |

---

## 5. Role-Based Access Control (Admin Dashboard)

The web-based Admin Dashboard is protected with strict RBAC:

- **Super Admin**: Full administrative rights, user approvals, role reassignment, financial oversight, audit log review.
- **President (પ્રમુખ)**: Community announcements, event authoring, member verification, general governance.
- **Secretary (મહામંત્રી)**: Member directory moderation, official circular publishing, meeting RSVPs.
- **Treasurer (ખજાનચી)**: Fund tracking, donation receipts, expense approval, balance sheet audit.
- **Committee Member**: General directory assistance and event volunteering.
- **Member**: Directory search, matrimony portal participation, donation receipts, RSVP.

### Pre-Configured Demo Test Accounts:

| Role | Mobile Number | Password | Notes |
|---|---|---|---|
| **Super Admin** | `9898000001` | `Admin@123` | Dharmeshbhai Rajgor |
| **President** | `9898000002` | `President@123` | Kiritbhai Pandya |
| **Secretary** | `9898000003` | `Secretary@123` | Pravinbhai Vyas |
| **Treasurer** | `9898000004` | `Treasurer@123` | Gaurangbhai Bhatt |
| **Committee** | `9898000005` | `Committee@123` | Committee Member |
| **Approved Member** | `9898000010` | `Member@123` | Jigar Rajgor |
| **Pending Member** | `9898000011` | `Member@123` | Mayurbhai Joshi (Pending Review) |

*(Note: On the login page, you can also use OTP `123456` or click the quick demo accounts buttons for one-click instant login).*

---

## 6. Database Schema & Setup

The complete relational PostgreSQL schema is located in `server/src/db/schema.sql`.

Key tables:
- `users` (id, phone, password_hash, role, is_approved, is_active, otp_code, otp_expires_at)
- `member_profiles` (user_id, full_name, surname, gotra, kuldevi, native_village, current_city, education, occupation, phone_visible)
- `family_details` (member_id, full_name, relation, age, education, occupation)
- `matrimony_profiles` (user_id, member_id, height_cm, rashi, manglik, annual_income, partner_expectations, photos)
- `matrimony_interests` (sender_user_id, receiver_user_id, status, contact_shared)
- `events` & `event_rsvps`
- `announcements`
- `funds` & `donations` & `expenses`
- `businesses`
- `blood_donors`
- `temple_directory` & `committee_members`
- `audit_logs`

### Dual-Mode Database Engine:
- **Live PostgreSQL (Neon / Render)**: When `DATABASE_URL` is set in `server/.env`, the server automatically connects via `pg.Pool` and applies `schema.sql`.
- **Embedded In-Memory Store**: If running offline or without an active database connection, the backend seamlessly runs using the embedded memory engine preloaded with 10+ member profiles, matrimony biodatas, committee records, and announcements so development and testing never stall!

---

## 7. How to Run Locally

### Prerequisites:
- Node.js v18+ (tested on Node.js v24)
- npm v10+

### Step 1: Start Express Backend (Port 5000)
```bash
cd server
npm install
npm run dev
```
Backend API will be live at `http://localhost:5000` with health check at `http://localhost:5000/api/health`.

### Step 2: Start Next.js PWA Client (Port 3000)
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Client application will be live at `http://localhost:3000`.

---

## 8. Deployment Guide

### A. Database Deployment (Neon PostgreSQL)
1. Sign in to [Neon.tech](https://neon.tech) and create a new project named `rajgor-samaj-db`.
2. Copy the Connection String URI (e.g., `postgresql://user:pass@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`).
3. Set this as `DATABASE_URL` in your backend environment variables.

### B. Backend Deployment (Render)
1. Sign in to [Render.com](https://render.com) and create a new **Web Service** connected to your repository.
2. Select Root Directory: `server`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_random_strong_secret_key`
   - `DATABASE_URL`: `postgresql://...` (your Neon connection string)
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### C. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Root Directory: `client`.
3. Framework Preset: **Next.js**.
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build the PWA, serve the service worker, and enable HTTPS for standalone installation!

---

## 9. Testing & Verification Checklist

- [x] **PWA Manifest**: Valid `manifest.json` with standalone mode, theme `#0f172a`, and all icon sizes (72 to 512, maskable).
- [x] **Service Worker**: Registered at `/sw.js` with offline fallback page at `/offline.html`.
- [x] **Install Prompt**: Prompts on Android Chrome and displays modal instructions on iOS Safari.
- [x] **Mobile Bottom Navigation**: Fixed bottom bar: Home | Members | Events | Matrimony | Profile.
- [x] **Trilingual Localization**: Gujarati, Hindi, and English dictionary toggles throughout the UI.
- [x] **Member Directory**: Search by name, village, city, gotra, profession; phone number privacy masking.
- [x] **Matrimony Portal**: Complete biodatas, interest request workflow, and contact unlock upon mutual consent.
- [x] **Events & RSVP**: Real-time RSVP registration with guest counts.
- [x] **Donations & Receipts**: Online donation flow generating unique 80G digital receipts with printable view.
- [x] **Admin Dashboard**: Member approval queue, role promotion, audit trail logging, and CSV export.
- [x] **Security**: Bcrypt password hashing, JWT bearer authentication, rate limiting, and RBAC middleware.
