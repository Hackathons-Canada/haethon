## Hackathons North America

This repository is scaffolded for the MVP stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk auth
- Neon Postgres + Drizzle ORM
- TanStack Query
- React Hook Form + Zod
- PostHog
- Sentry
- Resend
- Discord.js
- Vitest + Playwright

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Minimum required to boot the app:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Recommended to fully wire the stack:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_FROM`
- `DISCORD_BOT_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `UPLOADTHING_TOKEN`
- `CRON_SECRET`

## Neon Setup

1. Create a Neon Postgres database.
2. Confirm the selected Neon branch and database match your `DATABASE_URL`.
3. Run the setup command. This installs PostGIS and `pg_trgm` on the exact database in `DATABASE_URL`:

```bash
pnpm db:setup
```

4. If you prefer the Neon SQL editor, run [scripts/db/setup.sql](/Users/jamescow/Desktop/Software/haethon/scripts/db/setup.sql:1):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

5. Verify PostGIS is available:

```sql
SELECT postgis_version();
```

6. Push the initial schema:

```bash
pnpm db:push
```

## Clerk Setup

1. Create a Clerk application.
2. Enable email sign-in and whichever OAuth providers you want.
3. Add the publishable and secret keys to `.env.local`.
4. Set the redirect URLs to:
   - `http://localhost:3000/sign-in`
   - `http://localhost:3000/sign-up`
5. For admin access later, add `publicMetadata.role = "admin"` to the relevant Clerk user.

## Local Development

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm db:studio
```

## Current App Surface

- `/` marketing shell with Clerk auth buttons
- `/submit` organizer submission form scaffold
- `/admin` protected admin route with role gate
- `/api/health` health check
- `/api/hackathons` starter search endpoint

## What Still Needs Building

- Real server actions or route handlers for submissions, saves, reminders, and profiles
- Import batch review UI for admins
- Scheduled GitHub Actions for reminders, crawls, and status updates
- UploadThing route handlers and UI components once file upload flows exist
- Production analytics and error dashboards in PostHog and Sentry
