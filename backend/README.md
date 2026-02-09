# Java-Next Boilerplate Backend

Spring Boot backend for Java-Next Boilerplate application with Supabase authentication, Stripe payments, and webhook integrations.

## Tech Stack

- **Framework**: Spring Boot 3.2.2
- **Java Version**: 21
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase JWT
- **Payment Processing**: Stripe, LemonSqueezy
- **Email**: Mailgun
- **ORM**: JPA/Hibernate
- **Migration**: Flyway

## Project Structure

```
backend/
├── src/main/java/com/javanextboilerplate/
│   ├── JavaNextBoilerplateApplication.java    # Main application entry point
│   ├── config/                          # Configuration classes
│   │   ├── SecurityConfig.java          # Spring Security + JWT
│   │   ├── CorsConfig.java              # CORS configuration
│   │   ├── StripeConfig.java            # Stripe initialization
│   │   ├── LemonSqueezyConfig.java
│   │   └── MailgunConfig.java
│   ├── security/                        # Authentication & security
│   │   ├── SupabaseJwtValidator.java
│   │   ├── SupabaseJwtAuthenticationFilter.java
│   │   ├── SupabaseUserDetails.java
│   │   └── WebhookSignatureValidator.java
│   ├── controller/                      # REST controllers
│   │   ├── StripeController.java        # Checkout endpoints
│   │   ├── StripeWebhookController.java
│   │   ├── LemonSqueezyWebhookController.java
│   │   └── MailgunWebhookController.java
│   ├── service/                         # Business logic
│   │   ├── StripeService.java
│   │   ├── SubscriptionService.java
│   │   ├── UserService.java
│   │   ├── MailgunService.java
│   │   └── LemonSqueezyService.java
│   ├── entity/                          # JPA entities
│   │   ├── User.java
│   │   └── Subscription.java
│   ├── repository/                      # Data repositories
│   │   ├── UserRepository.java
│   │   └── SubscriptionRepository.java
│   ├── dto/                             # Data transfer objects
│   │   ├── request/
│   │   └── response/
│   └── exception/                       # Exception handling
│       └── GlobalExceptionHandler.java
└── src/main/resources/
    ├── application.yml                  # Application configuration
    └── db/migration/
        └── V1__initial_schema.sql       # Database schema
```

## Setup Instructions

### Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL database (Supabase)
- Stripe account
- Supabase account

### Environment Variables

Create a `.env` file in the `backend/` directory or set the following environment variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# LemonSqueezy
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
LEMON_SQUEEZY_STORE_ID=...

# Mailgun
MAILGUN_API_KEY=...
MAILGUN_SIGNING_KEY=...
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FORWARD_TO=your-email@example.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. Create a Supabase project or use existing PostgreSQL database
2. Get the connection string from Supabase dashboard
3. The application will automatically run Flyway migrations on startup

### Running Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# Or run the jar directly
java -jar target/backend-1.0.0.jar
```

The backend will start on `http://localhost:8080`

### Running with Docker

```bash
# Build the Docker image
docker build -t java-next-boilerplate-backend .

# Run the container
docker run -p 8080:8080 --env-file .env java-next-boilerplate-backend

# Or use docker-compose from project root
cd ..
docker-compose up backend
```

## API Endpoints

### Authentication

All API endpoints (except webhooks) require a valid Supabase JWT token sent via cookies.

### Stripe

- `POST /api/stripe/checkout` - Create a Stripe checkout session
  - Body: `{ "priceId": "price_xxx" }`
  - Returns: `{ "url": "https://checkout.stripe.com/..." }`
  - Requires authentication

### Webhooks (Public)

- `POST /api/webhooks/stripe` - Stripe webhook events
- `POST /api/webhooks/lemonsqueezy` - LemonSqueezy webhook events
- `POST /api/webhooks/mailgun` - Mailgun webhook events

## Authentication Flow

1. User logs in via Next.js frontend using Supabase Auth
2. Supabase sets a cookie with JWT token (pattern: `sb-*-auth-token`)
3. Frontend makes request to backend with credentials
4. Backend extracts JWT from cookie
5. Backend validates JWT using Supabase JWKS endpoint
6. Backend extracts user details (userId, email, role)
7. Request proceeds with authenticated user context

## Webhook Security

All webhooks verify signatures before processing:

- **Stripe**: HMAC SHA256 with timestamp
- **LemonSqueezy**: HMAC SHA256
- **Mailgun**: HMAC SHA256 with timestamp + token

## Database Migrations

Migrations are managed by Flyway and run automatically on application startup.

Location: `src/main/resources/db/migration/`

To create a new migration:
```bash
# Create a new file: V2__description.sql
# Flyway will automatically detect and run it
```

## Testing Webhooks Locally

### Stripe
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:8080/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
```

### LemonSqueezy & Mailgun
Use webhook testing tools like [webhook.site](https://webhook.site) during development.

## Deployment

### Prerequisites
- Server with Java 21 installed
- PostgreSQL database
- Environment variables configured

### Build Production JAR
```bash
mvn clean package -DskipTests
```

### Run Production
```bash
java -jar target/backend-1.0.0.jar
```

### Docker Deployment
```bash
docker build -t java-next-boilerplate-backend .
docker push your-registry/java-next-boilerplate-backend
```

## Monitoring

Spring Boot Actuator endpoints are available (if enabled):

- `/actuator/health` - Health check
- `/actuator/info` - Application info

## Troubleshooting

### JWT Validation Fails
- Verify `SUPABASE_JWT_SECRET` matches the one in Supabase dashboard (Settings > API > JWT Secret)
- Check that cookies are being sent with credentials
- Verify CORS is properly configured

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is accessible from your network
- Verify Supabase project is active

### Webhook Signature Verification Fails
- Verify webhook secrets match those in payment provider dashboards
- Check that raw request body is being used (not parsed JSON)
- Ensure correct signing algorithm is used

## Development

### Code Style
- Use Lombok annotations to reduce boilerplate
- Follow Spring Boot best practices
- Keep controllers thin, business logic in services
- Use transactions appropriately

### Testing
```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## Support

For issues and questions, please create an issue in the GitHub repository.
