# ⚡ ShipFree

A free, open-source SaaS boilerplate to ship your product fast. Built with Next.js, Supabase, Stripe, and everything you need to launch.

## What's Included

- 🔐 **Authentication** - Supabase Auth with email/password and social logins
- 💳 **Payments** - Stripe and LemonSqueezy integration for subscriptions and one-time payments
- 📧 **Email** - Mailgun for transactional emails and notifications
- 🗄️ **Database** - PostgreSQL with Drizzle ORM (type-safe queries)
- 🎨 **UI Components** - Beautiful, responsive components with TailwindCSS and Radix UI
- 🚀 **SEO Optimized** - Meta tags, sitemaps, and best practices built-in
- 🐳 **Docker Ready** - Development and production Docker configurations
- 🔒 **Security** - Security headers and best practices configured

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account (free tier available)
- A Stripe account (free test mode)
- A Mailgun account (free tier available)
- Optional: LemonSqueezy account

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ShipFree
pnpm install
```

### 2. Set Up Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

Now fill in your `.env` file with the following credentials:

### 3. Set Up Supabase (Authentication & Backend)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to **Settings** → **API**
4. Copy your credentials to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. In Supabase dashboard, go to **Authentication** → **Providers**
6. Enable **Email** provider (enabled by default)
7. Optional: Enable social providers (Google, GitHub, etc.)

### 4. Set Up PostgreSQL Database

**Option A: Use Supabase Database (Recommended for beginners)**

1. Supabase provides a PostgreSQL database automatically
2. Go to **Settings** → **Database** in Supabase
3. Copy the connection string (URI format)
4. Add to `.env`:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Option B: Use Local PostgreSQL with Docker**

```bash
# Start PostgreSQL with Docker
docker-compose -f docker/dev/docker-compose.yml -f docker/dev/docker-compose.postgres.yml up -d

# Add to .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shipfree
```

5. Run database migrations:

```bash
pnpm drizzle-kit push
```

### 5. Set Up Stripe (Payments)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key** (use test mode keys)
4. Add to `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

5. Set up webhooks for production:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 6. Set Up Mailgun (Email)

1. Go to [mailgun.com](https://mailgun.com) and create an account
2. Add and verify your domain (or use Mailgun's sandbox domain for testing)
3. Go to **Settings** → **API Keys**
4. Copy your **Private API key**
5. Add to `.env`:

```env
MAILGUN_API_KEY=your-api-key-here
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

6. Update email settings in `src/config.ts`:

```typescript
export const config = {
  appName: "YourAppName",
  domainName: "https://yourdomain.com",
  mailgun: {
    subdomain: "mg",
    fromNoReply: `YourApp <noreply@mg.yourdomain.com>`,
    fromAdmin: `YourName at YourApp <admin@mg.yourdomain.com>`,
    supportEmail: "support@yourdomain.com",
    forwardRepliesTo: "youremail@gmail.com",
  },
};
```

### 7. Optional: Set Up LemonSqueezy (Alternative Payment Processor)

1. Go to [lemonsqueezy.com](https://lemonsqueezy.com) and create an account
2. Go to **Settings** → **API**
3. Create an API key
4. Find your Store ID in **Settings** → **Stores**
5. Add to `.env`:

```env
LEMON_SQUEEZY_API_KEY=your-api-key-here
LEMON_SQUEEZY_STORE_ID=your-store-id
```

### 8. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (site)/              # Public landing page components
│   ├── api/                 # API routes (Stripe, Mailgun, etc.)
│   ├── auth/                # Authentication pages (login, register)
│   ├── dashboard/           # Protected dashboard area
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   └── ui/                  # UI components (buttons, cards, etc.)
├── db/                      # Database configuration
│   ├── schema.ts            # Database schema (Drizzle ORM)
│   └── index.ts             # Database connection
├── lib/                     # Third-party integrations
│   ├── supabase/            # Supabase client setup
│   ├── mailgun.ts           # Mailgun email service
│   └── utils.ts             # Utility functions
└── config.ts                # App configuration
```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database
pnpm drizzle-kit generate    # Generate migrations
pnpm drizzle-kit push        # Push schema to database
pnpm drizzle-kit studio      # Open database GUI
```

## Docker Setup

### Development with Docker

```bash
# With PostgreSQL
docker-compose -f docker/dev/docker-compose.yml -f docker/dev/docker-compose.postgres.yml up --build

# With MongoDB
docker-compose -f docker/dev/docker-compose.yml -f docker/dev/docker-compose.mongodb.yml up --build
```

Access Portainer at [http://localhost:9000](http://localhost:9000) for container management.

### Production with Docker

```bash
# With PostgreSQL
docker-compose -f docker/prod/docker-compose.yml -f docker/prod/docker-compose.postgres.yml up --build -d

# With MongoDB
docker-compose -f docker/prod/docker-compose.yml -f docker/prod/docker-compose.mongodb.yml up --build -d
```

## Customization

### Update Branding

1. Edit `src/config.ts` - Update app name and domain
2. Edit `src/app/layout.tsx` - Update metadata
3. Replace logo in `public/` folder
4. Update colors in `tailwind.config.ts`

### Add Database Tables

1. Edit `src/db/schema.ts`:

```typescript
export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  userId: integer().references(() => usersTable.id),
});
```

2. Push changes:

```bash
pnpm drizzle-kit push
```

### Add New Pages

Create a new file in `src/app/your-page/page.tsx`:

```typescript
export default function YourPage() {
  return <div>Your content here</div>;
}
```

### Add API Routes

Create `src/app/api/your-route/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables from your `.env` file
5. Deploy!

### Other Platforms

ShipFree works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

## Testing Payments

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## Troubleshooting

### "Database connection failed"

- Check your `DATABASE_URL` is correct
- Ensure your database is running
- For Supabase, verify your password is correct

### "Stripe webhook failed"

- Webhooks only work in production or with Stripe CLI
- For local testing, install [Stripe CLI](https://stripe.com/docs/stripe-cli)
- Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### "Email not sending"

- Verify Mailgun API key and domain
- Check if domain is verified in Mailgun dashboard
- For testing, use Mailgun's sandbox domain

### Port already in use

```bash
lsof -ti:3000 | xargs kill -9
```

## Documentation

For detailed documentation, visit: [https://shipfree.idee8.agency/docs](https://shipfree.idee8.agency/docs)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- 📖 [Documentation](https://shipfree.idee8.agency/docs)
- 🐛 [Report Issues](https://github.com/yourusername/shipfree/issues)
- 💬 [Discussions](https://github.com/yourusername/shipfree/discussions)

## License

This project is open source and available under the MIT License.

---

Built with ❤️ by [Revoks](https://revoks.dev)
