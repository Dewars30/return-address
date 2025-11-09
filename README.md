# Return Address

Return Address is the platform for expert-owned, high-signal AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.

## Overview

This is a monolithic web application built with Next.js, TypeScript, Prisma, and Supabase. Creators can create AI agents, host them on the platform, charge monthly subscriptions, and users can discover, trial, and subscribe to agents.

## Key Features

- **Creator Onboarding**: Auth via Clerk, creator profile setup, Stripe Connect integration
- **Agent Creation**: Form-based wizard to define agent specifications
- **Agent Runtime**: API endpoint for invoking agents with subscription/trial checks
- **Marketplace**: Public listing of published agents with filters
- **Payments**: Stripe + Stripe Connect for monthly subscriptions
- **Analytics**: Basic stats for creators (subscribers, messages)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: Clerk
- **Payments**: Stripe + Stripe Connect
- **Storage**: Supabase Storage (S3-compatible)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 22.x
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Clerk account
- Stripe account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd return-address
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Set up the database:
\`\`\`bash
npx prisma generate
npx prisma migrate deploy
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Documentation

- **Specification**: See `AGENT-STUDIO-V0.md` for the canonical specification
- **Database Setup**: See `DATABASE_SETUP.md` for database configuration
- **Storage Setup**: See `SUPABASE_STORAGE_SETUP.md` for storage configuration
- **Recent Fixes**: See `NEXT_REDIRECT_ERROR_FIX.md` and `CREATOR_DASHBOARD_404_FIX.md` for recent bug fixes

## Project Structure

\`\`\`
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── creator/           # Creator pages
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database client
│   ├── agentSpec.ts      # Agent specification types
│   └── ...
├── prisma/               # Prisma schema and migrations
└── ...
\`\`\`

## Development

### Running Tests

\`\`\`bash
npm run lint
npm run build
\`\`\`

### Database Migrations

\`\`\`bash
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations in production
\`\`\`

## Deployment

The application is deployed on Vercel. See the Vercel dashboard for deployment configuration.

## License

[Your License Here]

