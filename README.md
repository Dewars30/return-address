# Return Address

A monolithic web app for creating, hosting, and monetizing AI agents.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **React** + **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **Stripe** (for payments - to be added)
- **Auth** (Clerk or Supabase - to be added)

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

Edit `.env` and add your configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/return_address?schema=public"

# Stripe (required for creator payouts)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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
  /components      # React components
  /api            # Next.js API routes (to be added)
  layout.tsx      # Root layout
  page.tsx        # Homepage
/prisma
  schema.prisma   # Database schema
```

## Reference

See `AGENT-STUDIO-V0.md` for the complete project specification (internal reference).

