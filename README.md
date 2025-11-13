# Return Address

Return Address is the platform for expert-owned, high-signal AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.

## Quick Links

- 📖 **[Comprehensive Documentation](./PROJECT_DOCUMENTATION.md)** — Complete project documentation
- 🚀 **Live Site:** https://returnaddress.io
- 📋 **Specification:** [AGENT-STUDIO-V0.md](./AGENT-STUDIO-V0.md)

## Overview

Return Address is a monolithic web application built with Next.js, TypeScript, Prisma, and Supabase. Creators can create AI agents, host them on the platform, charge monthly subscriptions, and users can discover, trial, and subscribe to agents.

## Key Features

- **Creator Onboarding**: Auth via Clerk, creator profile setup, Stripe Connect integration
- **Agent Creation**: Form-based wizard to define agent specifications
- **Agent Runtime**: API endpoint for invoking agents with subscription/trial checks
- **Marketplace**: Public listing of published agents
- **Payments**: Stripe + Stripe Connect for monthly subscriptions
- **Analytics**: Basic stats for creators (subscribers, messages)
- **RAG Support**: Optional knowledge retrieval with pgvector embeddings

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: Clerk v5
- **Payments**: Stripe + Stripe Connect
- **Storage**: Supabase Storage (S3-compatible)
- **Styling**: Tailwind CSS
- **LLM**: OpenAI (via abstraction layer)

## Quick Start

### Prerequisites

- Node.js 22.x
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Clerk account
- Stripe account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd return-address
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
   See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for complete reference.

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Documentation

### Core Documentation

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** — Comprehensive project documentation (architecture, API routes, database schema, etc.)
- **[AGENT-STUDIO-V0.md](./AGENT-STUDIO-V0.md)** — Original implementation specification

### Setup Guides

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** — Database configuration guide
- **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** — Storage & RAG setup guide
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** — Complete environment variables reference
- **[CREATOR_ONBOARDING.md](./CREATOR_ONBOARDING.md)** — Creator onboarding flow documentation

### Reference

- **[CLERK_DASHBOARD_FIELDS_EXPLAINED.md](./CLERK_DASHBOARD_FIELDS_EXPLAINED.md)** — Clerk configuration reference
- **[CI_STATUS_REPORT.md](./CI_STATUS_REPORT.md)** — CI setup and status report
- **[CI_VERIFICATION_REPORT.md](./CI_VERIFICATION_REPORT.md)** — Comprehensive CI verification results
- **[CI_SETUP_SUMMARY.md](./CI_SETUP_SUMMARY.md)** — Quick CI setup reference

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run smoke        # Run smoke tests
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio
```

### Code Quality

- ✅ **Linting:** `npm run lint` passes
- ✅ **Build:** `npm run build` succeeds
- ✅ **TypeScript:** Strict mode enabled

### Database Migrations

```bash
npx prisma migrate dev    # Create and apply migration (dev)
npx prisma migrate deploy # Apply migrations (production)
```

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/       # React components
│   ├── creator/          # Creator pages
│   ├── agents/           # Public agent pages
│   └── marketplace/      # Marketplace page
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database client
│   ├── agentSpec.ts      # Agent specification types
│   ├── stripe.ts         # Stripe integration
│   └── ...
├── prisma/               # Prisma schema & migrations
└── middleware.ts         # Next.js middleware (auth)
```

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for detailed structure.

## Deployment

The application is deployed on **Vercel** at https://returnaddress.io.

- **Framework:** Next.js (auto-detected)
- **Node Version:** 22.x
- **Build Command:** `npm run build`
- **Environment Variables:** Configured in Vercel dashboard

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#deployment) for deployment details.

## Status

- ✅ **Production:** Live at https://returnaddress.io
- ✅ **Build:** Passing
- ✅ **Lint:** Passing
- ✅ **Core Features:** Complete

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#current-state) for detailed status.

## License

[Your License Here]

