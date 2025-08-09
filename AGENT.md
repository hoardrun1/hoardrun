# Hoardrun Agent Guide

## Build/Test Commands
- **Build**: `npm run build` (requires Prisma client generation)
- **Dev**: `npm run dev` (starts Next.js dev server)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Deploy**: `npm run build:render` (uses scripts/build.sh for Render)
- **DB Setup**: `npx prisma migrate deploy && npx prisma generate`
- **Test**: No test framework configured yet (see tests/TODO-tests.md for planned testing)

## Architecture
- **Framework**: Next.js 14 App Router with TypeScript
- **Database**: PostgreSQL with Prisma ORM (schema.prisma defines financial models)
- **Auth**: NextAuth.js with custom JWT tokens, session management, auth bypass for dev
- **State**: Zustand for client state, Context providers for auth/finance/navigation
- **Styling**: Tailwind CSS with shadcn/ui components, CSS variables for theming
- **API**: App Router API routes in /app/api with structured error handling

## Code Style
- **Imports**: Use @ alias for root imports (@/lib, @/components)
- **Components**: shadcn/ui patterns, functional components with TypeScript
- **Utilities**: cn() for className merging, consistent formatters (currency, date)
- **Error Handling**: NextResponse.json with HTTP status codes, Zod validation
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Database**: Prisma with cuid() IDs, proper relations, enums for status fields
- **Auth**: getServerSession() for API routes, middleware for protected routes
