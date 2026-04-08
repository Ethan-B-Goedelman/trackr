# Trackr — Interview Tracker

A full-stack MERN application for managing your entire job application pipeline.

## Project Structure

```
Trackr/
├── api/          Express + Mongoose REST API
├── client/       React (Vite + MUI) web app
├── mobile/       React Native (Expo) mobile app
└── docker-compose.yml
```

---

## Quick Start

### 1. Clone & configure environment

```bash
# API
cp api/.env.example api/.env
# Fill in MONGODB_URI, JWT_SECRET, and SMTP credentials in api/.env
```

### 2. Install dependencies

```bash
# API
cd api && npm install

# Client
cd ../client && npm install

# Mobile
cd ../mobile && npm install
```

### 3. Run in development

```bash
# Terminal 1 — API (port 5000)
cd api && npm run dev

# Terminal 2 — React client (port 3000)
cd client && npm run dev

# Terminal 3 — Mobile (Expo)
cd mobile && npx expo start
```

Open `http://localhost:3000` in your browser.
Swagger API docs are at `http://localhost:5000/api-docs`.

---

## Environment Variables (`api/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs (64+ chars) | — |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |
| `SMTP_HOST` | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | TLS (true/false) | `false` |
| `SMTP_USER` | SMTP username / email | `you@gmail.com` |
| `SMTP_PASS` | SMTP password / App Password | — |
| `EMAIL_FROM` | From address shown in emails | `"Trackr <no-reply@trackr.app>"` |
| `CLIENT_URL` | Frontend URL (for email links) | `http://localhost:3000` |

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Use that as `SMTP_PASS`

### MongoDB Atlas Setup
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist your IP
3. Copy the connection string and set `MONGODB_URI`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register (sends verification email) |
| `GET` | `/api/auth/verify-email?token=` | — | Verify email |
| `POST` | `/api/auth/login` | — | Login → JWT |
| `POST` | `/api/auth/forgot-password` | — | Request password reset |
| `POST` | `/api/auth/reset-password` | — | Reset password |
| `GET` | `/api/auth/me` | JWT | Current user |
| `GET` | `/api/applications` | JWT | List (search: `?q=`, filter: `?status=`, paginate: `?page=&limit=`) |
| `POST` | `/api/applications` | JWT | Create |
| `GET` | `/api/applications/:id` | JWT | Get one |
| `PUT` | `/api/applications/:id` | JWT | Update |
| `DELETE` | `/api/applications/:id` | JWT | Delete (cascades interviews) |
| `PATCH` | `/api/applications/:id/status` | JWT | Update status only (Kanban) |
| `GET` | `/api/interviews` | JWT | List (filter: `?applicationId=&from=&to=`) |
| `POST` | `/api/interviews` | JWT | Create |
| `PUT` | `/api/interviews/:id` | JWT | Update |
| `DELETE` | `/api/interviews/:id` | JWT | Delete |
| `GET` | `/api/contacts` | JWT | List (search: `?q=`) |
| `POST` | `/api/contacts` | JWT | Create |
| `PUT` | `/api/contacts/:id` | JWT | Update |
| `DELETE` | `/api/contacts/:id` | JWT | Delete |
| `GET` | `/api/stats` | JWT | Dashboard analytics |

Full interactive documentation: `http://localhost:5000/api-docs`
Raw OpenAPI spec (for SwaggerHub import): `http://localhost:5000/api-docs.json`

---

## Running Tests

```bash
cd api

# Set your test DB URI (or use the default localhost one)
export TEST_MONGODB_URI=mongodb://localhost:27017/trackr_test

npm test
# or with coverage:
npm run test:coverage
```

Tests cover:
- Auth: register, login, verify email, forgot password, JWT protection
- Applications: CRUD, server-side search, pagination, status update

---

## Docker / Production Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

This starts:
- `trackr-api` on port `5000`
- `trackr-client` (nginx) on port `80`

### Deployment to DigitalOcean (Droplet)

1. Create a Droplet (Ubuntu 22.04, 2GB RAM minimum)
2. Install Docker and Docker Compose
3. Clone the repo and fill in `api/.env`
4. Run `docker-compose up --build -d`
5. Point your domain's A record to the Droplet IP
6. Add SSL with Let's Encrypt:
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

### Domain Configuration

Update these values before deploying:
- `CLIENT_URL` in `api/.env` → `https://yourdomain.com`
- `server.url` in `api/swagger/swagger.js` → `https://yourdomain.com`
- `BASE_URL` in `mobile/src/services/api.js` → `https://yourdomain.com/api`

The nginx config in `client/nginx.conf` handles SPA routing and proxies `/api/*` to the backend — no CORS issues in production.

---

## SwaggerHub

To publish your API to SwaggerHub:

1. Start the API: `cd api && npm run dev`
2. Download the spec: `curl http://localhost:5000/api-docs.json > trackr-openapi.json`
3. Go to [swaggerhub.com](https://swaggerhub.com) → Create API → Import from file
4. Upload `trackr-openapi.json`

Or use the SwaggerHub CLI:
```bash
npm install -g swaggerhub-cli
swaggerhub api:create YourOrg/Trackr/1.0.0 --file trackr-openapi.json --visibility public
```

---

## Mobile App

The Expo app connects to the same API. To test on a physical device:
1. Update `BASE_URL` in `mobile/src/services/api.js` to your machine's local IP (e.g., `http://192.168.1.x:5000/api`)
2. Run `cd mobile && npx expo start`
3. Scan the QR code with the Expo Go app

---

## Features

- **Auth**: Register → email verification → login → forgot/reset password (JWT)
- **Applications**: Kanban board + table view, server-side search, pagination, DnD status updates
- **Interviews**: Schedule, prep notes, post-interview reflection, self-rating
- **Calendar**: Monthly view of all scheduled interviews
- **Contacts**: Track recruiters/hiring managers, link to applications
- **Analytics**: Dashboard with response rate, interviews this week, offers, activity chart
- **Mobile**: Login, browse applications, add applications, search (Expo/React Native)
- **API Docs**: Swagger UI at `/api-docs`, importable JSON spec at `/api-docs.json`
- **Tests**: Jest + Supertest covering auth and application CRUD routes
- **Docker**: Multi-stage builds, nginx with gzip + SPA fallback + API proxy
