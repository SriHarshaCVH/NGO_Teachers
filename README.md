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
| `DIRECT_URL` | Direct (non-pooled) URL for Prisma Migrate and `db push`. |
| `AUTH_SECRET` | Secret for Auth.js session encryption. Generate with: `openssl rand -base64 32`. |
| `AUTH_URL` | App base URL: `http://localhost:3000` locally; production URL on Vercel (e.g. `https://your-app.vercel.app`). |

**First deploy manual step:** In the Vercel project, add all of the above. Set `AUTH_URL` to the production URL after the first deployment (or use the preview URL for preview environments).

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
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | Run `prisma/seed.ts` (demo data) |
| `npm run db:studio` | Prisma Studio |

## Deploy to Vercel + Neon

1. Create a Neon database. Copy the **pooled** connection string into Vercel as `DATABASE_URL` and the **direct** string as `DIRECT_URL`.

2. Create a Vercel project from this repo. Set `AUTH_SECRET`, `AUTH_URL` (production site URL), `DATABASE_URL`, and `DIRECT_URL` in **Project → Settings → Environment Variables**.

3. **Build command:** default (`next build`). **Install command:** default (`npm install`). `postinstall` runs `prisma generate`.

4. **First production deploy:** run migrations against production (from your machine with `DIRECT_URL` pointing at production, or using Neon SQL / CI):

   ```bash
   npx prisma migrate deploy
   ```

   Use the same migration workflow you use locally; do not run `migrate dev` against production.

5. (Optional) Seed demo data only on a **non-production** database — never run demo seed against real user data.

6. After deploy, confirm login, dashboards, and listing flows at the live `AUTH_URL`.

## Manual checklist before first production deploy

- [ ] All env vars set on Vercel (including `AUTH_URL` matching the deployed hostname).
- [ ] `prisma migrate deploy` applied to the production database (or initial schema applied once via an approved process).
- [ ] `AUTH_SECRET` is unique and not committed to git.
