# NGO Teachers

Phase 1 MVP: NGO and volunteer matching for teaching opportunities (Next.js, PostgreSQL, Prisma, Auth.js, Zod).

## Prerequisites

- Node.js 20+ (recommended)
- PostgreSQL (local or [Neon](https://neon.tech))

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled PostgreSQL URL (e.g. Neon **pooler** connection — serverless-friendly). |
| `DIRECT_URL` | Direct (non-pooled) URL for Prisma Migrate; must match the same DB as `DATABASE_URL`. |
| `AUTH_SECRET` | Secret for Auth.js session encryption. Generate with: `openssl rand -base64 32`. |
| `AUTH_URL` | App base URL: `http://localhost:3000` locally; your production HTTPS URL on Vercel. |

Auth.js is configured with `trustHost: true` in `src/auth.config.ts`, which helps on Vercel. Still set `AUTH_URL` on **Production** to your canonical site URL (e.g. `https://your-app.vercel.app` or custom domain) so server-side URLs and callbacks stay consistent.

### Local vs production

| Variable | Local development | Vercel production |
|----------|-------------------|-------------------|
| `DATABASE_URL` | Neon dev branch, or local Postgres (pooled URL if using Neon) | Neon **production** branch, **pooled** connection string |
| `DIRECT_URL` | Same DB, **direct** Neon host (non-pooler) | Same Neon DB, **direct** connection string |
| `AUTH_SECRET` | Any dev secret; keep out of git | **Unique** secret; never reuse dev or commit |
| `AUTH_URL` | `http://localhost:3000` | `https://<your-production-host>` (no trailing slash) |

Preview deployments: use a separate Neon branch/database if you want; set `AUTH_URL` to that preview URL if you see auth/callback issues, or rely on `trustHost` for dynamic hosts.

## Local setup (clean machine)

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `AUTH_URL`.

3. Apply the database schema (choose one):

   - **Migrations (recommended if `prisma/migrations` exists):**

     ```bash
     npx prisma migrate dev
     ```

   - **Prototyping without migration history:**

     ```bash
     npx prisma db push
     ```

4. `postinstall` runs `prisma generate` automatically. To run it explicitly:

   ```bash
   npm run db:generate
   ```

5. (Optional) Load **dev/demo-only** sample users and listings:

   ```bash
   npm run db:seed
   ```

   The seed script **refuses to run** when `NODE_ENV=production`. It is only for local or non-production databases.

   Demo accounts (do not use in production):

   - NGO: `demo-ngo@example.com` / `DemoPassword123!`
   - Volunteer: `demo-volunteer@example.com` / `DemoPassword123!`

6. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` (local dev only) |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | Run `prisma/seed.ts` (blocked in production `NODE_ENV`) |
| `npm run db:studio` | Prisma Studio |

## Deploy to Vercel + Neon

### 1. Neon database setup (before first deploy)

1. Create a Neon project and a **production** database (or branch).
2. In **Connection details**, copy:
   - **Pooled** connection string → use as `DATABASE_URL` on Vercel.
   - **Direct** (non-pooled) connection string → use as `DIRECT_URL` on Vercel.
3. Ensure SSL mode matches Neon (typically `?sslmode=require` appended).
4. Optional: create a separate Neon branch for **preview** deployments and wire it in Vercel preview env vars.

### 2. Prisma migration flow (Neon / production)

- **Never** run `prisma migrate dev` against production.
- Use **`prisma migrate deploy`** to apply existing migrations in `prisma/migrations` to the production database (uses `DIRECT_URL` from your environment).

**First deploy:** Run migrations **before** users hit the app (or immediately after provisioning the DB), from a machine with production `DATABASE_URL` and `DIRECT_URL` in `.env`:

```bash
npx prisma migrate deploy
```

Confirm with `npx prisma migrate status` if needed.

### 3. Vercel project settings

- **Framework:** Next.js (default).
- **Build command:** `next build` (default).
- **Install command:** `npm install` (default). `postinstall` runs `prisma generate`.
- **Node.js:** 20.x (recommended; matches local “Node 20+”).
- Add **Environment Variables** for Production (and Preview if applicable): `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`.

### 4. First production deploy

1. Set all env vars on Vercel (Production). Set `AUTH_URL` to the final HTTPS origin you will use (custom domain or `*.vercel.app`).
2. **Apply migrations** to the production Neon DB (`prisma migrate deploy` with prod credentials).
3. Trigger deploy (push to connected branch or deploy from Vercel dashboard).
4. **Do not** run `npm run db:seed` against production (blocked in production `NODE_ENV` anyway; never force it).

### 5. Post-deploy smoke test (manual)

Run these against the **live** `AUTH_URL`:

- [ ] Home loads (`/`).
- [ ] Sign up a new NGO and a new volunteer (or use test accounts you created manually in the DB).
- [ ] Log in as NGO → redirect to `/ngo`; open NGO profile and save.
- [ ] Create a listing, publish/open as appropriate; confirm it appears under NGO listings.
- [ ] Log in as volunteer → `/volunteer`; complete profile if required.
- [ ] Open **Opportunities** (`/opportunities`), open a listing, submit an application.
- [ ] Log back in as NGO → open listing applications → change application status.
- [ ] Log out → confirm protected routes (`/ngo`, `/volunteer`) send unauthenticated users to login (or role-appropriate redirects).
- [ ] Wrong-role: NGO user visiting `/volunteer` redirects to `/ngo`; volunteer visiting `/ngo` redirects to `/volunteer`.

### 6. If deploy fails or you need a safe fix

- **Fix forward:** Push a small fix to the same branch and redeploy; Vercel rolls out a new deployment.
- **Rollback:** In Vercel → **Deployments** → select the last **Ready** deployment → **Promote to Production** (or restore previous deployment). This reverts app code only; **database schema** is not rolled back automatically — avoid destructive migrations without a plan.
- **Database issues:** If migrations partially applied, inspect `npx prisma migrate status` against production and resolve with Prisma’s migration workflow (do not run `migrate dev` on prod).

---

## Manual checklist before first production deploy

- [ ] All env vars set on Vercel Production (`AUTH_URL` matches the deployed hostname / HTTPS).
- [ ] `prisma migrate deploy` applied to the production database before relying on the app.
- [ ] `AUTH_SECRET` is unique for production and not committed to git.
- [ ] Demo seed not run on production DB.

## Deployment risk notes (high-signal)

1. **Schema missing:** Deploying before `migrate deploy` causes runtime DB errors — migrate first.
2. **Wrong `AUTH_URL`:** Callbacks/cookies can misbehave — set to canonical HTTPS origin.
3. **Shared `AUTH_SECRET`:** Session forgery risk — use a unique secret per environment.
4. **Pooled vs direct:** `DATABASE_URL` must be pooled; `DIRECT_URL` must be direct — both same DB; Prisma schema requires both.
5. **Preview vs production DB:** Accidentally pointing previews at production DB is a data leak risk — use separate Neon branches or env vars per environment.
