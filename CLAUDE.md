# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MarketiStats** ([marketistats.com](https://marketistats.com)) is a full-stack SaaS application with **separated frontend and backend**:
- **Frontend**: Next.js 16 (TypeScript) in `frontend/` directory
- **Backend**: Spring Boot 3.2.2 (Java 21) in `backend/` directory
- **Authentication**: Supabase JWT with Google OAuth (validated by backend, issued by frontend)
- **Database**: PostgreSQL (Supabase) with Flyway migrations
- **Payments**: Stripe only (LemonSqueezy removed)

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm install              # Install dependencies (first time)
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run lint             # Lint code
```

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run      # Start backend on port 8080
mvn clean install        # Build and install
mvn test                 # Run tests
mvn clean package        # Build production JAR
```

### Full Stack Development
Run in separate terminals:
```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Stripe webhooks (optional)
stripe listen --forward-to http://localhost:8080/api/webhooks/stripe
```

### Docker
```bash
# From project root
docker-compose up              # Start both services
docker-compose up --build      # Rebuild and start
docker-compose down            # Stop all services
```

## Critical Architecture Patterns

### 1. Authentication Flow (Supabase JWT)

**Cookie-Based JWT Authentication**:
- Frontend: Supabase Auth creates JWT in cookie `sb-*-auth-token`
- Backend: `SupabaseJwtAuthenticationFilter` extracts JWT from cookie (lines 59-90)
- Backend: `SupabaseJwtValidator` validates JWT against Supabase JWKS endpoint
- Cookie value is JSON: `{"access_token":"...","refresh_token":"..."}`
- Backend extracts `access_token` via string parsing (lines 74-88)

**Important**: Backend does NOT use Authorization header - it reads cookies directly. All protected endpoints require `credentials: 'include'` in frontend fetch requests.

### 2. Frontend-Backend Communication

**API Client Pattern** (`frontend/src/lib/api-client.ts`):
```typescript
// ALL requests MUST include credentials: 'include' to send cookies
await apiClient.post('/api/stripe/checkout', { priceId });
```

**Backend URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8080`)

**CORS**: Backend `CorsConfig.java` allows frontend URL specified in `FRONTEND_URL` env var with credentials enabled.

### 3. Database Migrations (Flyway)

**Location**: `backend/src/main/resources/db/migration/`

**Naming**: `V<number>__<description>.sql` (e.g., `V1__initial_schema.sql`, `V2__add_column.sql`)

**Execution**: Automatic on backend startup. Flyway tracks which migrations have run in `flyway_schema_history` table.

**Creating New Migration**:
1. Create new file with next version number
2. Write SQL (use `IF NOT EXISTS` for safety)
3. Restart backend - Flyway auto-detects and runs it

### 4. Service Layer Pattern (Backend)

**Controller → Service → Repository** architecture:

- **Controllers** (`backend/src/main/java/com/javanextboilerplate/controller/`): Handle HTTP, validate input, return DTOs
- **Services** (`backend/src/main/java/com/javanextboilerplate/service/`): Business logic, orchestration
- **Repositories** (`backend/src/main/java/com/javanextboilerplate/repository/`): Database access (Spring Data JPA)

**Example**: Stripe checkout flow:
1. `StripeController.createCheckoutSession()` receives request
2. Calls `StripeService.createCheckoutSession()` for business logic
3. Service calls `UserService.getOrCreateStripeCustomer()` for user management
4. Returns checkout URL to controller

### 5. Webhook Security

**All webhooks self-verify via signatures** (not JWT):

- **Stripe**: `Webhook.constructEvent()` validates HMAC SHA256 signature with timestamp
- **Mailgun**: `WebhookSignatureValidator.validateMailgunSignature()` validates HMAC with timestamp + token

**Important**: Webhook endpoints are public (`/api/webhooks/**`) in `SecurityConfig.java` - they rely on signature verification, not JWT.

## Environment Variables

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080           # Backend URL
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (`backend/.env` or `backend/.env.local`)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret              # From Supabase Settings > API
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...                  # From stripe listen or dashboard
MAILGUN_API_KEY=...
MAILGUN_SIGNING_KEY=...                          # Optional, for webhooks only
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FORWARD_TO=your-email@example.com
FRONTEND_URL=http://localhost:3000
```

**Note**: LemonSqueezy has been removed. If you see references to it in older docs, ignore them.

## Key Files & Responsibilities

### Backend Entry Points
- `JavaNextBoilerplateApplication.java` - Spring Boot main class
- `SecurityConfig.java` - Security configuration (JWT filter, CORS, public endpoints)
- `SupabaseJwtAuthenticationFilter.java` - Extracts & validates JWT from cookies

### Frontend Entry Points
- `frontend/src/lib/api-client.ts` - HTTP client for backend communication
- `frontend/src/components/CheckoutButton.tsx` - Stripe checkout integration example

### Database
- `backend/src/main/resources/db/migration/V1__initial_schema.sql` - Initial schema
- `backend/src/main/java/com/javanextboilerplate/entity/User.java` - User entity (Supabase + Stripe IDs)
- `backend/src/main/java/com/javanextboilerplate/entity/Subscription.java` - Subscription tracking

## Common Tasks

### Adding a New Backend Endpoint

1. Create DTO in `backend/src/main/java/com/javanextboilerplate/dto/request/` or `response/`
2. Add business logic in `backend/src/main/java/com/javanextboilerplate/service/`
3. Create controller method in `backend/src/main/java/com/javanextboilerplate/controller/`
4. If protected: Use `@AuthenticationPrincipal SupabaseUserDetails` to get user
5. Update frontend `api-client.ts` to call new endpoint

### Adding a Database Column

1. Create new migration: `backend/src/main/resources/db/migration/V<next>__<description>.sql`
2. Add column to JPA entity in `backend/src/main/java/com/javanextboilerplate/entity/`
3. Restart backend to apply migration

### Testing Stripe Webhooks Locally

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward: `stripe listen --forward-to http://localhost:8080/api/webhooks/stripe`
4. Copy webhook secret from output to `backend/.env` as `STRIPE_WEBHOOK_SECRET`
5. Restart backend
6. Test: `stripe trigger customer.subscription.created`

## Project-Specific Conventions

### Backend
- Use **Lombok** annotations (`@Data`, `@Builder`, `@RequiredArgsConstructor`) to reduce boilerplate
- Controllers should be thin - delegate to services
- Use `@Transactional` on service methods that modify data
- DTOs for all API requests/responses (not entities)
- Use Spring Boot's `@Value` for config injection

### Frontend
- All backend API calls go through `api-client.ts`
- **Always** use `credentials: 'include'` for authenticated requests
- Environment variables must start with `NEXT_PUBLIC_` to be available in browser

### Git
- Frontend secrets in `frontend/.env.local` (gitignored)
- Backend secrets in `backend/.env` or `backend/.env.local` (gitignored)
- Each directory has its own `.gitignore`

## Troubleshooting

### "401 Unauthorized" on backend requests
- Check JWT cookie exists in browser DevTools > Application > Cookies (pattern: `sb-*-auth-token`)
- Verify `credentials: 'include'` in fetch request
- Ensure `SUPABASE_JWT_SECRET` in backend matches Supabase dashboard (Settings > API > JWT Settings)
- Check CORS allows frontend URL (set in `FRONTEND_URL` env var)

### "CORS policy" errors
- Verify `FRONTEND_URL` in backend/.env matches actual frontend URL
- Check `CorsConfig.java` allows credentials
- Ensure frontend sends `credentials: 'include'`

### Flyway migration fails
- Check SQL syntax in migration file
- Ensure no conflicting migrations (version numbers must be sequential)
- Check database is accessible (verify `DATABASE_URL`)
- View migration history: `SELECT * FROM flyway_schema_history;`

### Webhook signature verification fails
- **Stripe**: Use `stripe listen` for local dev (copies webhook secret to terminal)
- **Mailgun**: Signing key only needed for webhooks (optional for now)
- Check raw request body is used for signature (not parsed JSON)

## Documentation References

- `README.md` - Project overview and setup
- `backend/README.md` - Backend-specific documentation

## Custom user instructions

### Java/Spring Boot Standards:
- Use Java 21+ features (Records, Pattern Matching).
- Use Constructor Injection only (No @Autowired on fields).
- Use Lombok @Data or @Value for DTOs.
- Always include @Valid for request body validation.

### Next.js Interface Sync:
- Every time you modify a Java Record/DTO, check the corresponding TypeScript interface in /frontend/types/. They MUST match.

### Supabase Auth:

- The backend validates the Supabase JWT via a custom OncePerRequestFilter. Do not attempt to use Node-based Supabase Auth libraries in the Java code.
