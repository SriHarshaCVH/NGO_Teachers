# NGO Teachers — UI/UX Redesign Plan

**Status:** Planning reference for future implementation  
**Stack decision:** **Tailwind CSS** for styling (see [Implementation approach](#6-implementation-approach-tailwind--nextjs))  
**Constraints:** Do not change backend logic, database schema, auth flow, or product rules unless strictly required for UI integration. No new product features—visual and UX structure only.

---

## Context

- **Product:** Platform connecting NGOs and volunteer teachers; flows are working end-to-end.
- **Current codebase:** Next.js App Router (`src/app`), global CSS in `globals.css`, narrow single-column `main`, semantic HTML, no UI framework in dependencies today.
- **Goals:** Clean, modern, trustworthy, simple, accessible; mission-driven, credible, warm, professional—not outdated, overly corporate, or cluttered.

---

## 1. Design direction

**“Quiet mission SaaS”** — calm, editorial-meets-product: generous spacing, clear hierarchy, soft neutrals with one confident accent.

| Aspect | Direction |
|--------|------------|
| **Personality** | Warm-neutral base, deep text (avoid pure black everywhere), one accent for links, primary actions, focus rings (e.g. deep teal or muted indigo—mission-aligned, not startup-neon or default “bank blue”). |
| **Tone** | Headlines human and purposeful; body copy plain and reassuring; minimal jargon. |
| **Density** | Low clutter; lists become scannable **rows/cards** instead of long inline ` — ` strings. |
| **Trust** | Predictable chrome (header with role + nav in authenticated areas), consistent status vocabulary, visible focus and error states. |

Optional later: sparse imagery (one hero or one strip), not stock-photo grids.

---

## 2. UI principles

1. **Clarity over decoration** — Listing title first, status second, meta (mode, location) tertiary.
2. **One primary action per view** — e.g. opportunity detail: “Apply” dominates when allowed; everything else is secondary links.
3. **Progressive disclosure** — Long forms stay one logical page but use **section grouping**, clear anchors, sticky save context (presentation only).
4. **Consistent status language** — Same badge styles and labels across dashboards, lists, and detail.
5. **Accessible by default** — Real `<label>` associations; `fieldset`/`legend` where appropriate; contrast for muted text; `aria-live` for async success/error where needed.
6. **Responsive first** — Fluid max-width + breakpoints; filters as grid desktop / stacked or collapsible mobile.
7. **Warmth without whimsy** — Single tier of radius/shadow; avoid decorative noise.

---

## 3. Component / design system proposal

Introduce a **token-based** system, implemented with **Tailwind theme extension** (CSS variables in `@theme` or `tailwind.config`).

### Design tokens (map to Tailwind)

- **Color:** `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-muted`, `--danger`, `--success`, `--focus-ring`.
- **Type:** Font stack (system or one webfont later); scale from `sm`–`2xl`; line-height for body vs headings.
- **Space:** 4px or 8px base; consistent section vertical rhythm.
- **Radius / shadow:** `sm`/`md` radius; optional single card shadow token.

### Reusable UI pieces (React + Tailwind)

| Component | Role |
|-----------|------|
| **AppShell** | Optional top bar: product name, role-aware links, sign out—reduces repeated inline nav paragraphs. |
| **PageHeader** | Title, optional description, back/breadcrumb. |
| **Card** | Dashboard sections, listing rows, application rows. |
| **StatGrid** | NGO/Volunteer dashboard metrics (keep `dl` semantics where useful). |
| **Badge** | Listing status, application status, match labels (evolve `MatchBadge`). |
| **Button / ButtonLink** | Primary / secondary / ghost; loading + disabled for Apply and submits. |
| **FormField** | Label, hint, control, inline error. |
| **Alert** | Success / info / warning / error (maps from `.notice`, `.error`). |
| **EmptyState** | Headline, one line, CTA. |
| **FilterBar** | Opportunities filters: responsive grid; Clear as secondary. |
| **Data list** | Applications: title, status badge, date—responsive without horizontal scroll issues. |

---

## 4. Page-by-page redesign plan

### Global

- **`src/app/layout.tsx`:** Skip link optional; link to global styles; consider minimal **header/footer** on public pages vs **app shell** for `/volunteer/*`, `/ngo/*` (same routes).
- **`globals.css`:** Migrate to Tailwind + tokens; keep legacy class aliases during migration if needed (`.error` → alert component or utility).

### Pages

| Route | Focus |
|-------|--------|
| **`/`** | Short landing: mission, CTA to opportunities; signed-in: role-based cards/links. |
| **`/login`** + `LoginForm` | Centered auth card; notice for `registered=1`; errors in Alert. |
| **`/signup`** + `SignupForm` | Same card; role as clear segmented/cards UI (radios unchanged in DOM). |
| **`/volunteer`** | Completeness banner; Card sections; StatGrid; recommended rows/cards; quick links; logout in header pattern. |
| **`/volunteer/profile`** + form | Sectioned form (Identity, Teaching, Logistics, Links); hints; sticky save area; field-level errors from API. |
| **`/volunteer/applications`** | EmptyState; list with badges + dates. |
| **`/ngo`** | Same patterns as volunteer dashboard. |
| **`/ngo/profile`** + form | Org vs contact blocks; same form discipline. |
| **`/ngo/listings`** | Primary “Create listing”; rows with status + actions; empty state. |
| **`/ngo/listings/new`**, **`/edit`** + `ListingForm` | Draft vs Publish clarity; sections for role details, logistics, deadline, description. |
| **`/ngo/listings/[id]/applications`** + client | Card list; expand/collapse focus; loading on status change; same API. |
| **`/opportunities`** | PageHeader + FilterBar; result cards; empty/filter-empty states. |
| **`/opportunities/[id]`** | Title + match badge; details grid/`dl` responsive; Apply region prominent; `ApplyToListing` states as clear blocks. |
| **`not-found`** | Home + opportunities links; optional minimal illustration. |

---

## 5. Implementation order

### Phase 1 — Foundation + high-traffic surfaces

1. Tailwind setup + design tokens (theme).
2. Shared primitives: Button, Card, Alert, PageHeader, Badge.
3. **`/`** — First impression.
4. **`/login`**, **`/signup`** — Small forms, low risk.
5. **`/opportunities`**, **`/opportunities/[id]`** — Core discovery and apply.

### Phase 2 — Dashboards and lists

6. **`/volunteer`**, **`/ngo`**
7. **`/volunteer/applications`**, **`/ngo/listings`**

### Phase 3 — Dense UI

8. Profile pages + **`VolunteerProfileForm`**, **`NgoProfileForm`**, **`ListingForm`**
9. **`/ngo/listings/[id]/applications`** (`ApplicationsReviewClient`)

---

## 6. Implementation approach: Tailwind + Next.js

**Chosen stack:** **Tailwind CSS** (v4 `@import "tailwindcss"` or v3 with PostCSS—follow project convention when added).

**Recommended companions (optional, incremental):**

- **Radix UI** — Accessible primitives (Dialog for mobile filters later, Dropdown, Tabs for form sections) if you want behavior without heavy styling.
- **Lucide React** — Icons sparingly (empty states, CTAs, status).
- **shadcn/ui** — Optional accelerator: copy-paste Tailwind + Radix components into `src/components/ui` (Card, Button, Alert)—align tokens first.

**Why Tailwind here:** Fast responsive layout, consistent spacing, easy token mapping, fits “modern minimal SaaS” without adopting a full Material-style kit.

---

## 7. Safe migration without breaking flows

1. **Do not change** `name` attributes, API routes, JSON bodies, or server actions—only markup, classes, and layout wrappers.
2. **Strangler pattern:** Add `src/components/ui/*` (or similar); migrate page by page; temporary aliases from old classes to new utilities.
3. **Layouts:** Add visual shells to `volunteer/layout.tsx` / `ngo/layout.tsx` without changing `redirect` logic.
4. **Client components** (`ApplyToListing`, `ApplicationsReviewClient`, profile/listing forms): preserve `fetch` URLs and payloads; update UI only.
5. **QA per page:** Keyboard, focus, contrast, mobile filters, apply flow, NGO status updates.

---

## 8. File inventory (reference)

**Key pages:** `src/app/page.tsx`, `login/`, `signup/`, `volunteer/page.tsx`, `volunteer/profile/`, `volunteer/applications/`, `ngo/page.tsx`, `ngo/profile/`, `ngo/listings/`, `opportunities/`, `not-found.tsx`.

**Key client UI:** `login-form.tsx`, `signup-form.tsx`, `volunteer-profile-form.tsx`, `ngo-profile-form.tsx`, `listing-form.tsx`, `apply-to-listing.tsx`, `applications-review-client.tsx`, `match-badge.tsx`.

**Global styles:** `src/app/globals.css`, `src/app/layout.tsx`.

---

*Last updated: 2026-03-22*
