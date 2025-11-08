# Return Address

Return Address is the platform for expert-owned, high-signal AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **React** + **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Supabase)
- **Clerk** - Authentication
- **Stripe** - Payments & Connect (creator payouts)
- **OpenAI** - LLM provider
- **Supabase Storage** - S3-compatible file storage
- **pgvector** - Vector embeddings for RAG

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration. See `.env.example` for all required variables:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_APP_URL` - Application URL (e.g., `http://localhost:3000`)
- `S3_ENDPOINT` - Supabase Storage S3 endpoint
- `S3_ACCESS_KEY_ID` - Storage access key
- `S3_SECRET_ACCESS_KEY` - Storage secret key
- `S3_BUCKET_NAME` - Storage bucket name
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ADMIN_EMAILS` - Comma-separated admin email addresses
- `PLATFORM_FEE_BPS` - Platform fee in basis points (default: 500 = 5%)

3. Generate Prisma Client:
```bash
npm run db:generate
```

4. Push the database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
/app
  /api            # Next.js API routes
    /agents       # Agent runtime & subscription
    /creator      # Creator management APIs
    /admin        # Admin APIs
    /stripe       # Stripe webhooks
  /agents         # Agent detail pages
  /creator        # Creator dashboard & onboarding
  /admin          # Admin panel
  /components     # React components
  layout.tsx      # Root layout
  page.tsx        # Homepage/Marketplace
/lib
  agentSpec.ts    # AgentSpec types & validation
  auth.ts         # Authentication helpers
  db.ts           # Prisma client
  llmClient.ts    # LLM abstraction
  rag.ts          # RAG helpers
  storage.ts      # S3-compatible storage
  stripe.ts       # Stripe integration
/prisma
  schema.prisma   # Database schema
```

## Features

- **Creator Onboarding** - Become a creator, connect Stripe account
- **Agent Creation** - Form-based agent builder with full AgentSpec configuration
- **Agent Runtime** - Invoke endpoint with subscription/trial management, RAG support
- **Marketplace** - Discover and subscribe to agents
- **Payments** - Stripe subscriptions with Connect payouts for creators
- **Analytics** - Basic creator analytics (subscribers, messages)
- **Admin Controls** - Agent approval and suspension

## Reference

See `AGENT-STUDIO-V0.md` for the complete project specification (internal reference).
See `BUILD_STATUS_REPORT.md` for current build status and feature completion.

