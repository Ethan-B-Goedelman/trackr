# Trackr — Job Application Tracker

A full-stack MERN application for managing your entire job application pipeline, with a React web client, a React Native mobile app, and a shared REST API.

---

## Project Structure

```
Trackr/
├── api/                    Express + Mongoose REST API
│   ├── controllers/        Route handler logic
│   ├── middleware/         Auth (JWT), rate limiting, validation
│   ├── models/             Mongoose models (User, Application, Interview, Contact)
│   ├── routes/             applications, interviews, contacts, auth, stats
│   ├── swagger/            OpenAPI spec config
│   ├── tests/              Jest + Supertest API tests
│   ├── utils/              Email (Nodemailer), token helpers
│   └── server.js           Entry point
│
├── client/                 React web app (Vite + Tailwind + MUI)
│   └── src/
│       ├── components/
│       │   ├── Applications/   ApplicationCard, ApplicationTable, KanbanBoard
│       │   ├── Common/         Shared UI components
│       │   ├── Contacts/       ContactCard, ContactForm
│       │   ├── Interviews/     InterviewCard, InterviewForm
│       │   ├── Layout/         Navbar, Sidebar, Layout
│       │   └── Stats/          Dashboard chart components
│       ├── pages/          Dashboard, Applications, Interviews, Contacts, Calendar
│       ├── services/       Axios API client
│       ├── contexts/       AuthContext
│       ├── types/          TypeScript interfaces
│       └── __tests__/      Vitest unit + integration tests
│
├── mobile/                 React Native app (Expo + TypeScript)
│   └── src/
│       ├── components/     ApplicationCard, InterviewCard, ContactCard, PickerModal
│       ├── context/        AuthContext
│       ├── navigation/     AppNavigator (Stack + Tab)
│       ├── screens/        Dashboard, Applications, Interviews, Contacts, Profile,
│       │                   Login, Search, Add/Edit screens for each entity
│       ├── services/       Axios API client with JWT + SecureStore
│       ├── theme/          Colors, spacing, shadows
│       └── types/          TypeScript interfaces
│   ├── __tests__/          Jest unit + integration tests
│   ├── assets/             Icon, splash screen, adaptive icon, favicon
│   ├── app.json            Expo config (bundle ID: com.ethangoedelman.trackr)
│   └── eas.json            EAS Build config (development + production profiles)
│
└── docker-compose.yml      Runs API + web client via Docker
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js, Express, Mongoose, JWT, Nodemailer, Swagger |
| Database | MongoDB Atlas |
| Web Client | React 18, Vite, TypeScript, Tailwind CSS, MUI, @dnd-kit |
| Mobile | React Native, Expo SDK 54, TypeScript, EAS Build |
| Web Tests | Vitest |
| Mobile Tests | Jest + babel-jest |
| API Tests | Jest + Supertest |
| Deployment | DigitalOcean Droplet (137.184.237.129), nginx |

---

## Quick Start

### 1. Clone & configure environment

```bash
cp api/.env.example api/.env
# Fill in MONGODB_URI, JWT_SECRET, and SMTP credentials
```

### 2. Install dependencies

```bash
cd api && npm install
cd ../client && npm install
cd ../mobile && npm install
```

### 3. Run in development

```bash
# Terminal 1 — API (port 5000)
cd api && npm run dev

# Terminal 2 — Web client (port 5173)
cd client && npm run dev

# Terminal 3 — Mobile (Expo)
cd mobile && npx expo start
```

Web app: `http://localhost:5173`
Swagger API docs: `http://localhost:5000/api-docs`

---

## Environment Variables (`api/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs (64+ chars) | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username / email address | `you@gmail.com` |
| `SMTP_PASS` | SMTP App Password | — |
| `EMAIL_FROM` | From name shown in emails | `"Trackr <no-reply@trackr.app>"` |
| `CLIENT_URL` | Frontend URL (used in email links) | `http://localhost:5173` |

### Gmail App Password Setup
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Use that value as `SMTP_PASS`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register (sends verification email) |
| `GET` | `/api/auth/verify-email?token=` | — | Verify email address |
| `POST` | `/api/auth/login` | — | Login → returns JWT |
| `POST` | `/api/auth/forgot-password` | — | Request password reset email |
| `POST` | `/api/auth/reset-password` | — | Reset password with token |
| `GET` | `/api/auth/me` | JWT | Get current authenticated user |
| `GET` | `/api/applications` | JWT | List (filter: `?status=`, search: `?q=`, paginate: `?page=&limit=&sort=`) |
| `POST` | `/api/applications` | JWT | Create application |
| `GET` | `/api/applications/:id` | JWT | Get single application |
| `PUT` | `/api/applications/:id` | JWT | Update application |
| `DELETE` | `/api/applications/:id` | JWT | Delete application (cascades interviews) |
| `PATCH` | `/api/applications/:id/status` | JWT | Update status only (Kanban drag-and-drop) |
| `GET` | `/api/interviews` | JWT | List (filter: `?applicationId=&from=&to=`, paginate: `?limit=`) |
| `POST` | `/api/interviews` | JWT | Schedule interview |
| `PUT` | `/api/interviews/:id` | JWT | Update interview |
| `DELETE` | `/api/interviews/:id` | JWT | Delete interview |
| `GET` | `/api/contacts` | JWT | List contacts (search: `?q=`, paginate: `?limit=`) |
| `POST` | `/api/contacts` | JWT | Create contact |
| `PUT` | `/api/contacts/:id` | JWT | Update contact |
| `DELETE` | `/api/contacts/:id` | JWT | Delete contact |
| `GET` | `/api/stats` | JWT | Dashboard analytics (pipeline counts, response rate, etc.) |

Full interactive docs: `http://localhost:5000/api-docs`
Raw OpenAPI JSON: `http://localhost:5000/api-docs.json`

---

## Features

### Web App
- **Auth** — Register → email verification → login → forgot/reset password (JWT)
- **Applications** — Kanban board with drag-and-drop status updates (snapCenterToCursor, scroll arrows, dot indicators), table view with sort, salary column, linked contact name column, interview indicator dot
- **Interviews** — Schedule, prep notes, post-interview reflection, self-rating (1–5)
- **Calendar** — Monthly view of all scheduled interviews
- **Contacts** — Track recruiters/hiring managers, link to a specific application
- **Dashboard** — Pipeline summary, next interview, response rate, follow-up reminders for applications stuck in "Applied" for 14+ days
- **API Docs** — Swagger UI at `/api-docs`

### Mobile App (React Native / Expo)
- **Auth** — Login with JWT stored in SecureStore, auto-logout on 401
- **Dashboard** — Pipeline counts, next interview card, follow-up reminder for stale applications (14+ days in Applied)
- **Applications** — Scrollable card list with status badges, salary range, interview indicator dot, linked contact name
- **Interviews** — List with type, date, company; add/edit/delete
- **Contacts** — List with linked application; add/edit/delete
- **Profile** — Displays account info, logout
- **Navigation** — Bottom tab bar (Home, Applications, Interviews, Contacts, Profile) + stack modals for add/edit flows

### Tests

**Web (`client/`) — Vitest**
- Unit: Salary Formatter, Application Statuses, Stale Application Detection, Dashboard Greeting
- Integration: Contact Map Builder, Interview Set Builder, Pagination

**Mobile (`mobile/`) — Jest**
- Unit: Salary Formatter, Dashboard Greeting, Status Style Lookup, Initials Generator
- Integration: Contact Map Builder, Interview Set Builder, Stale Application Filter

**API (`api/`) — Jest + Supertest**
- Auth: register, login, email verification, forgot password, JWT protection
- Applications: CRUD, search, pagination, status update

```bash
# Run web tests
cd client && npm test

# Run mobile tests
cd mobile && npm test

# Run API tests
cd api && npm test
```

---

## Mobile — EAS Build & TestFlight

The mobile app uses EAS Build for creating standalone iOS builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Development build (installs Trackr Dev on device, connects to Metro)
eas build --profile development --platform ios

# Production build (for TestFlight / App Store)
eas build --profile production --platform ios

# Submit production build to TestFlight
eas submit --platform ios
```

**Running the dev server after installing a dev build:**
```bash
cd mobile && npx expo start --dev-client
# or for physical device outside local network:
npx expo start --dev-client --tunnel
```

App bundle identifier: `com.ethangoedelman.trackr`

---

## Deployment

The web app and API are deployed to a DigitalOcean Droplet at `137.184.237.129`.

### Deploy web client (from Windows cmd)

```bash
cd C:\Users\Ethan\Trackr\client
npm run build
scp -r dist\* root@137.184.237.129:/var/www/html/
```

### Docker (API + web together)

```bash
docker-compose up --build -d
docker-compose logs -f
```

This starts:
- `trackr-api` on port `5000`
- `trackr-client` (nginx) on port `80`

The nginx config in `client/nginx.conf` handles SPA routing and proxies `/api/*` to the backend.

### Updating the API base URL for production

| File | Variable | Value |
|---|---|---|
| `api/.env` | `CLIENT_URL` | `http://137.184.237.129` |
| `mobile/src/services/api.tsx` | `BASE_URL` | `http://137.184.237.129/api` |

---

## SwaggerHub

To publish the API spec to SwaggerHub:

```bash
# Start the API
cd api && npm run dev

# Export the spec
curl http://localhost:5000/api-docs.json > trackr-openapi.json

# Import at swaggerhub.com → Create API → Import from file
```
