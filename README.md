# FocusBoard

A project and task manager that answers one question: **what should I work on right now?**

One backend and one database serve both a web app and an Android app. Log in on either one and see the same projects and tasks.

## Live links

| What | Link |
|---|---|
| Web app | https://focusboard-nu.vercel.app/ |
| Backend API | https://focusboard-api.onrender.com/api |
| Health check | https://focusboard-api.onrender.com/api/health |
| Android APK | https://expo.dev/accounts/palak329/projects/focusboard/builds/5feca224-cc7b-4e65-9738-0888cddda75e |
| Demo video | https://drive.google.com/file/d/1K4t2C2IlCXKJWjbuhVMnuXqTl0EBMCls/view?usp=sharing |

The backend runs on a free tier and sleeps when idle. The first request can take 30 to 60 seconds, so open the health check link first.

## What makes it different

- **Up Next:** the dashboard ranks open tasks by priority and deadline and explains why ("Overdue by 2 days").
- **Project health:** every project shows On track, At risk or Overdue, based on how much of the timeline has passed versus how many tasks are done.
- **Activity timeline:** every create, update, complete and delete is recorded (audit log).

## Tech stack

| Part | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Web | React, Vite, TypeScript, Tailwind CSS |
| Mobile | React Native with Expo (Android) |
| Validation | Zod (backend), matching rules on web and mobile |
| Auth | JWT, bcrypt |

## Repository structure

    backend/   Express API, Prisma schema and migrations
    web/       React web app
    mobile/    Expo mobile app
    docs/      ER diagram and API documentation

## Documentation

- [ER diagram](docs/ER-diagram.md)
- [API documentation](docs/API.md)

## Environment variables

### backend/.env

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | yes | PostgreSQL connection string |
| JWT_SECRET | yes | Random string, at least 32 characters |
| JWT_EXPIRES_IN | no | Token lifetime, default `1h` |
| PORT | no | Default `4000` |
| NODE_ENV | no | `development` or `production` |
| CORS_ORIGINS | no | Comma-separated list of allowed web origins, default `http://localhost:5173` |

### web/.env

| Variable | Description |
|---|---|
| VITE_API_URL | API base URL, for example `http://localhost:4000/api` |

### mobile/.env

| Variable | Description |
|---|---|
| EXPO_PUBLIC_API_URL | API base URL. On a real phone use your computer's Wi-Fi IP, not localhost |

Copy each `.env.example` to `.env` and fill in the values. Never commit `.env` files.

## Local setup

Requirements: Node.js 20 or newer, PostgreSQL 14 or newer, Git.

### 1. Database

~~~bash
createdb focusboard
~~~

On macOS with Homebrew Postgres, no password is needed and your user name is the database user.

### 2. Backend

~~~bash
cd backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, and generate a secret with: openssl rand -base64 48
npx prisma migrate dev
npm run dev
~~~

The API runs at http://localhost:4000. Check http://localhost:4000/api/health.

### 3. Web app

~~~bash
cd web
npm install
cp .env.example .env
npm run dev
~~~

Open http://localhost:5173.

### 4. Mobile app

~~~bash
cd mobile
npm install
cp .env.example .env
# edit .env: set EXPO_PUBLIC_API_URL to http://YOUR-COMPUTER-IP:4000/api
npx expo start -c
~~~

Find your IP on macOS with `ipconfig getifaddr en0`. Scan the QR code with Expo Go. The phone and computer must be on the same Wi-Fi.

## Running the mobile app against the deployed backend

Set this in `mobile/.env`, then restart with `npx expo start -c`:

~~~
EXPO_PUBLIC_API_URL=https://focusboard-api.onrender.com/api
~~~

Or install the APK from the link above. It already points to the deployed backend.

To build the APK yourself:

~~~bash
cd mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview
~~~

The API URL for the build is set in `mobile/eas.json`.

## Deployment

- **Database:** Neon (PostgreSQL)
- **Backend:** Render. Build: `npm install --include=dev && npx prisma generate && npm run build`. Start: `npx prisma migrate deploy && npm start`
- **Web:** Vercel, root directory `web`, with `VITE_API_URL` set
- **Mobile:** EAS Build (Android APK)

## Security

- Passwords hashed with bcrypt (cost 12); the hash is never returned by any endpoint
- JWT authentication middleware on all protected routes, with a distinct code for expired tokens
- Authorization: every query is scoped to the logged-in user. Another user's record returns 404, so IDs cannot be probed
- All input validated on the backend with Zod (required fields, email format, real calendar dates, enum values, length limits)
- SQL injection prevented by using Prisma's parameterized queries only
- Rate limiting on register and login (10 failed attempts per 15 minutes per IP)
- Helmet security headers, request body size limit, CORS restricted to the configured web origins
- Login uses a dummy hash comparison so unknown emails take as long as wrong passwords
- Mobile token stored with expo-secure-store (Android Keystore / iOS Keychain)
- Errors never expose stack traces or internals

## Design decisions

- **UUID primary keys** so record IDs cannot be guessed.
- **Tasks have no owner column.** Ownership comes from the task's project, which keeps the schema normalized.
- **Cascade deletes:** deleting a project removes its tasks.
- **Stateless JWT:** logout deletes the token on the client. Refresh tokens would be the next improvement.
- **Web token storage:** the web app keeps the token in localStorage for simplicity. An httpOnly cookie would be safer against XSS and is a known trade-off.

## Bonus features included

Pagination, sorting, audit log (activity timeline), and project health and Up Next scoring.

## Test data

Use fake data only. Example account for testing: create your own through the Register screen.
