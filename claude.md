# Claude AI Assistant Context - Return Address

## Project Overview

**Return Address** is a platform for expert-owned, high-signal AI agents with clear provenance, enforced guardrails, and direct revenue for their creators.

- **Live Site**: https://returnaddress.io
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: Clerk v5
- **Payments**: Stripe + Stripe Connect
- **Storage**: Supabase Storage (S3-compatible)
- **Node Version**: 22.x

## AI Assistant Workflow - Superpowers Plugin

**CRITICAL**: This project uses the **Superpowers** plugin for Claude Code. You MUST follow these workflows:

### Mandatory First Response Protocol
Before responding to ANY user message:
1. ☐ List available skills in your mind
2. ☐ Ask yourself: "Does ANY skill match this request?"
3. ☐ If yes → Use the Skill tool to read and run the skill file
4. ☐ Announce which skill you're using
5. ☐ Follow the skill exactly

### Key Superpowers Skills to Use

**Core Workflow (Use These Often)**
- `brainstorming` - ALWAYS use before coding to refine rough ideas into designs
- `writing-plans` - Create detailed implementation plans for complex tasks
- `executing-plans` - Execute plans in batches with review checkpoints
- `subagent-driven-development` - Dispatch subagents for independent tasks

**Development Quality**
- `test-driven-development` - TDD workflow: write test first, watch fail, implement
- `systematic-debugging` - Four-phase debugging framework for any bug/failure
- `verification-before-completion` - ALWAYS verify work before claiming complete
- `requesting-code-review` - Request review before merging/completing major work

**Git Workflows**
- `using-git-worktrees` - Create isolated worktrees for feature work
- `finishing-a-development-branch` - Complete dev work with merge/PR/cleanup options

**Anti-Patterns to Avoid**
- `testing-anti-patterns` - Prevent mocking issues and test-only production code
- Never skip brainstorming on "simple" tasks
- Never rationalize away skill usage
- Never work through checklists mentally (use TodoWrite)

### Rules
1. **If a skill exists for your task, you MUST use it** - no exceptions
2. **Brainstorm before coding** - always refine ideas first
3. **Skills with checklists require TodoWrite** - one todo per checklist item
4. **Announce skill usage** - "I'm using [skill] to [what you're doing]"
5. **Follow skills exactly** - they encode proven techniques

## Key Features

1. **Creator Onboarding**: Auth via Clerk, creator profile setup, Stripe Connect integration
2. **Agent Creation**: Form-based wizard to define agent specifications
3. **Agent Runtime**: API endpoint for invoking agents with subscription/trial checks
4. **Marketplace**: Public listing of published agents
5. **Payments**: Stripe + Stripe Connect for monthly subscriptions
6. **Analytics**: Basic stats for creators (subscribers, messages)
7. **RAG Support**: Optional knowledge retrieval with pgvector embeddings

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── creator/        # Creator-specific endpoints
│   │   ├── admin/          # Admin endpoints
│   │   ├── agents/         # Agent runtime & management
│   │   ├── stripe/         # Stripe webhooks
│   │   └── health/         # Health check endpoints
│   ├── components/          # Shared React components
│   ├── creator/            # Creator dashboard & tools
│   │   ├── agents/        # Agent management UI
│   │   └── onboarding/    # Creator onboarding flow
│   ├── agents/             # Public agent pages
│   ├── marketplace/        # Public marketplace
│   ├── admin/              # Admin dashboard
│   └── layout.tsx          # Root layout
├── lib/                     # Utility libraries & business logic
│   ├── auth.ts            # Authentication helpers (Clerk)
│   ├── authApi.ts         # Server-side auth utilities
│   ├── db.ts              # Prisma database client
│   ├── agentSpec.ts       # Agent specification types & validation
│   ├── stripe.ts          # Stripe integration & Connect
│   ├── llmClient.ts       # LLM abstraction layer (OpenAI)
│   ├── rag.ts             # RAG & embeddings (pgvector)
│   ├── storage.ts         # Supabase Storage client
│   ├── rateLimit.ts       # Rate limiting utilities
│   ├── env.ts             # Environment variable validation
│   └── log.ts             # Logging utilities
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma      # Prisma schema definition
│   └── migrations/        # Database migrations
├── scripts/                 # Utility scripts
│   └── smoke.ts           # Smoke test script
├── middleware.ts            # Next.js middleware (auth & routing)
└── docs/                    # Additional documentation
```

## Database Schema (Prisma)

### Core Models

1. **User** - User accounts (synced from Clerk)
   - `id`, `email`, `name`, `handle`, `shortBio`
   - `authProvider`, `authId` (Clerk integration)
   - `isCreator`, `stripeAccountId`, `stripeCustomerId`

2. **Agent** - AI agent definitions
   - `id`, `slug`, `ownerId`, `status`, `isApproved`
   - Relations: `owner` (User), `specs`, `subscriptions`

3. **AgentSpec** - Agent configuration & versions
   - `id`, `agentId`, `version`, `name`, `description`
   - `systemPrompt`, `llmModel`, `temperature`
   - `ragEnabled`, `knowledgeBaseId`, `guardrails`

4. **Subscription** - User subscriptions to agents
   - `id`, `userId`, `agentId`, `status`
   - `stripeSubscriptionId`, `currentPeriodEnd`

5. **Message** - Agent conversation messages
   - `id`, `agentId`, `userId`, `role`, `content`

6. **KnowledgeBase** - RAG knowledge bases
   - `id`, `ownerId`, `name`, `description`
   - Vector embeddings support via pgvector

## Important Environment Variables

Key environment variables (see [ENV_VARIABLES.md](./ENV_VARIABLES.md) for complete list):

- `DATABASE_URL` - Supabase connection pooler (port 6543)
- `DIRECT_URL` - Supabase direct connection (port 5432) for migrations
- `NEXT_PUBLIC_CLERK_*` - Clerk authentication
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `OPENAI_API_KEY` - LLM provider
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - Storage & RAG

**IMPORTANT**: Database connections use PgBouncer pooling. Set `?pgbouncer=true` in `DATABASE_URL` or use `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true` environment variable. See [DATABASE_PGBOUNCER_FIX.md](./DATABASE_PGBOUNCER_FIX.md).

## Key API Routes

### Public Routes
- `GET /api/agents/[slug]` - Get agent details
- `POST /api/agents/[slug]/invoke` - Invoke agent (requires subscription or trial)
- `GET /marketplace` - List published agents

### Creator Routes (Auth Required)
- `GET/POST /api/creator/agents` - List/create agents
- `GET/PATCH/DELETE /api/creator/agents/[id]` - Manage agent
- `POST /api/creator/agents/[id]/publish` - Publish agent
- `GET /api/creator/analytics` - Creator analytics

### Admin Routes (Admin Only)
- `GET /api/admin/agents` - List all agents
- `POST /api/admin/agents/[id]/suspend` - Suspend agent
- `POST /api/admin/agents/[id]/approve` - Approve agent

### Stripe Routes
- `POST /api/stripe/connect/account` - Create Stripe Connect account
- `POST /api/stripe/webhooks` - Stripe webhook handler

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Configure environment
npx prisma generate           # Generate Prisma client
npx prisma migrate deploy     # Apply migrations
npm run dev                   # Start dev server
```

### Database Commands
```bash
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Create & apply migration (dev)
npm run db:push               # Push schema (dev, no migration)
npm run db:studio             # Open Prisma Studio
```

### Code Quality
```bash
npm run lint                  # Run ESLint
npm run build                 # Build for production
npm run smoke                 # Run smoke tests
```

## Authentication Flow

1. User signs up/in via Clerk (`/sign-up`, `/sign-in`)
2. Clerk webhook creates/updates User record in database
3. Middleware protects routes via `clerkMiddleware`
4. Server components use `auth()` from `@clerk/nextjs/server`
5. Client components use `useUser()` from `@clerk/nextjs`

## Creator Onboarding Flow

1. User creates account via Clerk
2. Navigates to `/creator/onboarding`
3. Fills out creator profile (handle, bio)
4. Sets up Stripe Connect Express account
5. Marked as `isCreator = true`
6. Can now create agents at `/creator/agents/new`

See [CREATOR_ONBOARDING.md](./CREATOR_ONBOARDING.md) for details.

## Agent Creation Flow

1. Creator fills out agent specification form
2. Submits via `POST /api/creator/agents`
3. Creates Agent + AgentSpec records
4. Agent starts in `draft` status
5. Creator publishes via `POST /api/creator/agents/[id]/publish`
6. Admin approves via `POST /api/admin/agents/[id]/approve`
7. Agent appears in marketplace when `status=published` and `isApproved=true`

## Subscription & Trial Flow

1. User discovers agent in marketplace
2. Clicks subscribe button
3. If first time with agent, gets 10 free messages (trial)
4. After trial, redirects to Stripe Checkout
5. Stripe creates subscription via Connect
6. Webhook updates Subscription record
7. User can invoke agent via API

## Known Issues & Fixes

### PgBouncer Prepared Statement Error (42P05)
**Issue**: Prisma generates prepared statements that conflict with PgBouncer transaction pooling.

**Fix**: Add `?pgbouncer=true` to `DATABASE_URL` or set `PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS=true`.

See [DATABASE_PGBOUNCER_FIX.md](./DATABASE_PGBOUNCER_FIX.md).

### Next.js Redirect API Usage
**Issue**: `redirect()` from `next/navigation` can't be used in API routes.

**Fix**: Use `NextResponse.redirect()` for API routes, `redirect()` only in Server Components/Actions.

See [REDIRECT_FIXES_SUMMARY.md](./REDIRECT_FIXES_SUMMARY.md).

## Documentation Reference

### Core Documentation
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Comprehensive architecture & implementation
- [AGENT-STUDIO-V0.md](./AGENT-STUDIO-V0.md) - Original specification
- [README.md](./README.md) - Quick start guide

### Superpowers Plugin Documentation
- [SUPERPOWERS_SETUP_README.md](./SUPERPOWERS_SETUP_README.md) - Complete setup & usage guide
- [CLAUDE_RELAUNCH_PLAN.md](./CLAUDE_RELAUNCH_PLAN.md) - How to restart with hook loaded

### Setup & Configuration
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [DATABASE_PGBOUNCER_FIX.md](./DATABASE_PGBOUNCER_FIX.md) - PgBouncer fix
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables
- [CLERK_DASHBOARD_FIELDS_EXPLAINED.md](./CLERK_DASHBOARD_FIELDS_EXPLAINED.md) - Clerk config
- [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) - Storage & RAG setup

### Implementation Details
- [CREATOR_ONBOARDING.md](./CREATOR_ONBOARDING.md) - Creator onboarding flow
- [OPTION_B_IMPLEMENTATION.md](./OPTION_B_IMPLEMENTATION.md) - Implementation decisions

### CI/CD & Deployment
- [CI_STATUS_REPORT.md](./CI_STATUS_REPORT.md) - CI status
- [CI_VERIFICATION_REPORT.md](./CI_VERIFICATION_REPORT.md) - CI verification
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Deployment status

### Debugging & Fixes
- [RUNTIME_DEBUG_PLAN.md](./RUNTIME_DEBUG_PLAN.md) - Runtime debugging
- [RUNTIME_DEBUG_REPORT.md](./RUNTIME_DEBUG_REPORT.md) - Debug report
- [REDIRECT_FIXES_SUMMARY.md](./REDIRECT_FIXES_SUMMARY.md) - Redirect fixes
- [NEXT_REDIRECT_API_FIX_PLAN.md](./NEXT_REDIRECT_API_FIX_PLAN.md) - API redirect fix plan

## Code Conventions

### TypeScript
- Strict mode enabled
- Use interfaces for object types
- Use type inference where possible
- Prefer `async/await` over promises

### Components
- Server Components by default (App Router)
- Client Components only when needed (`'use client'`)
- Co-locate components with their routes when route-specific
- Shared components in `/app/components`

### API Routes
- Use route handlers (`route.ts`) in App Router
- Return `NextResponse` for API routes
- Handle errors with appropriate status codes
- Validate input with TypeScript types

### Database
- Use Prisma for all database operations
- Write migrations for schema changes
- Use transactions for multi-step operations
- Index frequently queried fields

### Security
- Always use `auth()` or `clerkMiddleware` for auth checks
- Validate user permissions before mutations
- Sanitize user input
- Use environment variables for secrets
- Rate limit public endpoints

## Deployment

**Platform**: Vercel
**URL**: https://returnaddress.io

### Build Configuration
- Framework: Next.js (auto-detected)
- Node Version: 22.x
- Build Command: `npm run build`
- Install Command: `npm install`

### Environment Variables
Configure in Vercel dashboard (all from `.env.vercel` or `.env.example`)

### Pre-deployment Checklist
1. Run `npm run lint` - must pass
2. Run `npm run build` - must succeed
3. Test locally with production build (`npm run start`)
4. Verify environment variables in Vercel
5. Apply database migrations (`npx prisma migrate deploy`)

## Testing

### Smoke Tests
```bash
npm run smoke
```
Tests basic functionality without requiring full environment setup.

### Manual Testing Checklist
- [ ] User signup/signin (Clerk)
- [ ] Creator onboarding flow
- [ ] Agent creation & publishing
- [ ] Marketplace listing
- [ ] Subscription flow
- [ ] Agent invocation
- [ ] Trial message limit

## Common Tasks

### Adding a New API Route
1. Create `app/api/your-route/route.ts`
2. Export `GET`, `POST`, `PATCH`, or `DELETE` handlers
3. Use `auth()` for authentication
4. Return `NextResponse.json()` or `NextResponse.redirect()`

### Adding a New Database Model
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Run `npx prisma generate`
4. Update TypeScript types as needed

### Adding a New Page
1. Create `app/your-page/page.tsx`
2. Use Server Component by default
3. Add `'use client'` only if needed (state, effects, etc.)
4. Use `auth()` for protected pages

## Git Workflow

**Current Branch**: `main`
**Main Branch**: `main`

### Commit Messages
Follow conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: restructure code`
- `test: add tests`
- `chore: update dependencies`

### Recent Commits
```
d9ec8af docs: final update to DATABASE_PGBOUNCER_FIX.md
4e4372f fix: update to use PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS env var
6aa9bca docs: add quick reference for pgbouncer=true env update
02dce32 docs: add pgbouncer=true fix for 42P05 prepared statement error
22c2de5 fix: gate Creator Dashboard with Clerk SignedIn/SignedOut components
```

## Support & Resources

- **Issues**: https://github.com/anthropics/claude-code/issues (for Claude Code)
- **Live Site**: https://returnaddress.io
- **Vercel Dashboard**: (access via Vercel account)
- **Supabase Dashboard**: (access via Supabase account)
- **Stripe Dashboard**: (access via Stripe account)

---

**Last Updated**: 2025-11-13
**Status**: ✅ Production (Live)
