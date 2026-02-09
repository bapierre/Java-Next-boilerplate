# Java-Next Boilerplate

Full-stack SaaS boilerplate with a **Next.js 16** frontend and **Spring Boot 3.2** backend, designed to be cloned and customized for new projects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Spring Boot 3.2, Java 21, Lombok |
| Auth | Supabase (JWT, cookie-based) |
| Database | PostgreSQL (Supabase) + Flyway migrations |
| Payments | Stripe (checkout sessions, subscriptions, webhooks) |
| Email | Mailgun (transactional emails, webhook forwarding) |
| Containerization | Docker + Docker Compose |

## What's Included

- **Authentication** -- Supabase Auth with email/password, magic links, and Google OAuth
- **Payments** -- Stripe checkout sessions, subscription management, and webhook handling
- **Email** -- Mailgun transactional emails with webhook signature verification
- **Database** -- PostgreSQL with Flyway migrations and Spring Data JPA
- **Security** -- CSP headers, CORS, JWT validation with JWKS caching, webhook signature verification, non-root Docker containers
- **Performance** -- Virtual threads (Java 21), Spring Cache, async webhook processing, AVIF/WebP image optimization, server components
- **UI** -- Tailwind CSS v4, Radix UI primitives, Lucide icons
- **Docker** -- Production-ready multi-stage Dockerfiles for both services

## Prerequisites

- Node.js 20+
- npm
- Java 21+
- Maven 3.9+
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account
- A [Mailgun](https://mailgun.com) account (optional)

## Project Structure

```
java-next-boilerplate/
├── frontend/                  # Next.js 16 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/       # Landing page components (server components)
│   │   │   ├── api/          # API routes (mailgun webhook)
│   │   │   ├── auth/         # Login, register, confirm pages
│   │   │   ├── dashboard/    # Protected dashboard
│   │   │   └── layout.tsx    # Root layout with metadata
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # Base UI (button, card, input, label)
│   │   │   ├── CheckoutButton.tsx
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts # Backend HTTP client (fetch + timeout)
│   │   │   ├── supabase/     # Supabase client/server/middleware
│   │   │   └── mailgun.ts    # Mailgun email sending
│   │   └── config.ts         # App name, domain, email settings
│   ├── middleware.ts          # Supabase auth middleware
│   ├── next.config.ts         # Security headers, image optimization
│   └── Dockerfile
│
├── backend/                   # Spring Boot 3.2 application
│   ├── src/main/java/com/javanextboilerplate/
│   │   ├── config/           # CORS, Security, Stripe configuration
│   │   ├── controller/       # REST controllers (Stripe, webhooks)
│   │   ├── dto/              # Request/response DTOs
│   │   ├── entity/           # JPA entities (User, Subscription)
│   │   ├── exception/        # Global error handler
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT filter, validator, webhook signatures
│   │   └── service/          # Business logic (Stripe, User, Subscription)
│   ├── src/main/resources/
│   │   ├── application.yml   # All configuration
│   │   └── db/migration/     # Flyway SQL migrations (V1, V2, V3)
│   ├── pom.xml
│   └── Dockerfile
│
├── docker-compose.yml         # Run both services together
└── CLAUDE.md                  # AI assistant instructions
```

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd java-next-boilerplate
```

### 2. Configure environment variables

**Frontend** -- copy and fill in `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend** -- copy and fill in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAILGUN_API_KEY=...
MAILGUN_SIGNING_KEY=...
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FORWARD_TO=your-email@example.com
FRONTEND_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** -- copy the URL and anon key
3. Go to **Settings > API > JWT Settings** -- copy the JWT secret
4. Go to **Settings > Database** -- copy the connection string
5. Enable **Email** provider under **Authentication > Providers**
6. (Optional) Enable Google OAuth provider

### 4. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your test **Publishable key** and **Secret key** from **Developers > API keys**
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to http://localhost:8080/api/webhooks/stripe
   ```
   Copy the webhook signing secret from the CLI output.

### 5. Run the application

**Option A: Single command (recommended)**

From the project root:

```bash
./dev.sh
```

This starts both frontend and backend, showing combined logs. Press `Ctrl+C` to stop, or use `./stop.sh` in another terminal.

**Option B: Manual (two terminals)**

```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run with Docker (alternative)

```bash
docker-compose up --build
```

Frontend at `localhost:3000`, backend at `localhost:8080`.

## Development Commands

```bash
# Run both services (from root)
./dev.sh             # Start frontend + backend with combined logs
./stop.sh            # Stop all services

# Frontend
cd frontend
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint

# Backend
cd backend
mvn spring-boot:run  # Dev server
mvn clean package    # Production JAR
mvn test             # Run tests

# Stripe webhooks (local)
stripe listen --forward-to http://localhost:8080/api/webhooks/stripe
```

## Architecture

### Authentication Flow

1. User signs in via Supabase Auth on the frontend
2. Supabase stores a JWT in an `sb-*-auth-token` cookie
3. Frontend sends requests to the backend with `credentials: 'include'`
4. Backend's `SupabaseJwtAuthenticationFilter` extracts and validates the JWT from the cookie
5. JWKS keys are cached (24h) to avoid per-request fetches to Supabase

### Payments Flow

1. User clicks checkout on the frontend
2. Frontend calls `POST /api/stripe/checkout` on the backend (via `api-client.ts`)
3. Backend validates the price ID, gets/creates a Stripe customer, creates a checkout session
4. User completes payment on Stripe's hosted checkout page
5. Stripe sends a webhook to `POST /api/webhooks/stripe` on the backend
6. Backend verifies the webhook signature and processes the event asynchronously

### Key Design Decisions

- **Cookie-based auth** -- backend reads JWT from cookies, not Authorization headers. All frontend requests use `credentials: 'include'`.
- **Server components by default** -- FAQ, pricing, testimonials, footer are all server components (zero client JS). Only interactive components (login forms, mobile menu) use `"use client"`.
- **Async webhooks** -- Stripe webhooks are acknowledged immediately and processed asynchronously via `@Async` to avoid timeout retries.
- **Flyway migrations** -- database schema is version-controlled in `backend/src/main/resources/db/migration/`. New migrations run automatically on startup.

## Customizing for a New Project

### 1. Rename and rebrand

- Update `frontend/src/config.ts` with your app name, domain, and email settings
- Update `frontend/src/app/layout.tsx` metadata
- Replace `frontend/public/techstack.webp` and other assets with your branding
- Update landing page copy in `frontend/src/app/(site)/`

### 2. Add a new backend endpoint

1. Create a DTO in `backend/src/.../dto/request/` or `dto/response/`
2. Add business logic in `backend/src/.../service/`
3. Create a controller method -- use `@AuthenticationPrincipal SupabaseUserDetails` for the authenticated user
4. Call it from the frontend via `api-client.ts`

### 3. Add a database table

1. Create a new migration file: `backend/src/main/resources/db/migration/V4__description.sql`
2. Add a JPA entity in `backend/src/.../entity/`
3. Add a repository in `backend/src/.../repository/`
4. Restart the backend -- Flyway runs the migration automatically

### 4. Configure Stripe price IDs

Set `STRIPE_ALLOWED_PRICE_IDS` in `backend/.env` to restrict which Stripe prices can be used:
```env
STRIPE_ALLOWED_PRICE_IDS=price_xxx,price_yyy
```

## Testing Payments

Use Stripe test cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Any future expiry, any 3-digit CVC

## Troubleshooting

**401 Unauthorized on backend requests**
- Check the `sb-*-auth-token` cookie exists in browser DevTools
- Verify `credentials: 'include'` in the fetch request
- Ensure `SUPABASE_JWT_SECRET` matches Supabase dashboard (Settings > API)

**CORS errors**
- Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL exactly
- Backend CORS is configured in `CorsConfig.java`

**Flyway migration fails**
- Check SQL syntax in the migration file
- Ensure version numbers are sequential (V1, V2, V3, V4...)
- View migration history: `SELECT * FROM flyway_schema_history;`

**Stripe webhooks not received locally**
- Run `stripe listen --forward-to http://localhost:8080/api/webhooks/stripe`
- Copy the webhook secret from the CLI output to `backend/.env`
- Restart the backend

## License

MIT
