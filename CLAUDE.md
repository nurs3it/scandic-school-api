# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Watch mode dev server (port 3001)
npm run build           # Compile TypeScript to dist/

# Database
npx prisma migrate dev  # Apply migrations & regenerate client
npx prisma generate     # Regenerate Prisma client after schema changes
npx prisma studio       # GUI for inspecting data

# Code quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier

# Tests
npm test                # Unit tests (Jest)
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage report
```

## Architecture

NestJS 11 monolith with two main concerns:

**Public API** — `ApplicationsModule` exposes `POST /applications` (create enrollment) and `GET /applications` (list). After creating an application it fires-and-forgets an email notification via `MailModule` (Resend SDK).

**Admin dashboard** — `AdminController` (`/admin/*`) renders SSR HTML pages inline (no template engine). Auth is a simple cookie `scandic_admin` checked manually per handler. The controller is excluded from Swagger. Admin can view applications and manage `NotificationEmail` recipients.

**Shared infrastructure:**
- `PrismaModule` is `@Global()` — `PrismaService` available everywhere without re-importing. Uses `@prisma/adapter-pg` driver adapter with `DATABASE_URL`.
- `ConfigModule` is global — `ConfigService` available everywhere.
- `ValidationPipe` with `whitelist: true, transform: true` applied globally.
- Swagger UI served at `/api`.

## Database

PostgreSQL on Supabase. Two Prisma models:
- `Application` — enrollment submission (`parentName`, `grade`, `language`, `parentPhone`, `createdAt`)
- `NotificationEmail` — email recipients for new-application alerts

The `NotificationEmail` table exists in `prisma/schema.prisma` but the initial migration SQL only creates `Application`. A second migration may be needed if deploying to a fresh database.

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default `3001`) |
| `ADMIN_USER` / `ADMIN_PASS` | Admin panel credentials |
| `ADMIN_URL` | CTA button URL in notification emails |
| `RESEND_API_KEY` | Resend email API key |
| `FRONTEND_URL` | Intended CORS origin (CORS currently set to `origin: true`) |

`SMTP_*` variables exist in `.env` but are unused — `MailService` uses Resend only.
