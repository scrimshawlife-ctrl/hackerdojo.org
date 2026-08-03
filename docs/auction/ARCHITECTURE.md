# Architecture — Silent Auction MVP

Design constrained by the audited repository. Existing pieces are reused; gaps are labeled **NEW (required)**.

## Principles

- Do not redesign the marketing site.
- Prefer Jekyll pages + existing layout/CSS.
- Extend the existing `api/` serverless handler style.
- No WebSockets, Redis, queues, or microservices.
- Introduce only the minimum backend needed for durable bids, auth, and email.

## System diagram

```text
Browser
  |  Jekyll HTML (GitHub Pages)
  |  GET /auction/  GET /auction/:id/
  |  admin HTML pages
  v
+---------------------------+         +----------------------+
| Static site (existing)    |         | Serverless API (ext) |
| Jekyll + static/css/js    | ------> | api/auction/*.js     |
+---------------------------+  fetch  | (same style as       |
                                      |  api/waitlist.js)    |
                                      +----------+-----------+
                                                 |
                         +-----------------------+-----------------------+
                         |                       |                       |
                         v                       v                       v
                  +-------------+         +-------------+         +-------------+
                  | Database    |         | Auth/session|         | Email       |
                  | NEW         |         | NEW         |         | NEW         |
                  +-------------+         +-------------+         +-------------+
```

## Frontend

**Existing**

- Jekyll static pages, `_layouts/default.html`, `_includes/header.html` / `footer.html`
- `static/css/style.css`, site fonts, small `static/js/functions.js`
- Optional page-local Tailwind CDN pattern (seen on waitlist) — use only if it speeds admin/forms without a new build pipeline

**MVP additions (proposed)**

| Page | Role |
|------|------|
| `/auction/` | Gallery (F1) |
| `/auction/artwork/` or `/auction/:slug/` | Detail + countdown + bid CTA (F2–F4) |
| `/auction/admin/` | Admin list/create/edit (F5) |

Rendering: **server-rendered HTML via Jekyll** for chrome and static structure; dynamic bid/current price loaded from API (same general approach as waitlist form → `/api/...`).

No SPA framework. No site-wide React/Vue.

## Backend

**Existing pattern:** `api/waitlist.js` default export handler with method checks and JSON in/out.

**MVP:** Add handlers under `api/` (exact filenames free within this pattern), for example:

- `api/auction/artworks.js`
- `api/auction/bids.js`
- `api/auction/admin.js`
- `api/auction/auth.js` (if magic-link/session lives here)

Keep handlers thin: validate → authorize → DB → optional email → JSON response.

**Not used:** background workers, separate auction microservice, GraphQL.

## Database

**Existing:** none in-repo.

**NEW (required):** one relational database (reviewer choice). Candidates for decision — not prescriptions:

- Hosted Postgres (simplest for bid integrity / transactions)
- Or another durable store explicitly approved in PR review

Airtable is **observed** for waitlist intake only. It is a weak fit for concurrent bid increments; do not default auction bids to Airtable unless reviewers explicitly accept the integrity tradeoffs.

Schema: see [DATA_MODEL.md](./DATA_MODEL.md).

## Email

**Existing:** none (waitlist only stores email via Airtable; does not send mail from this repo).

**NEW (required):** one transactional email provider (reviewer choice). Send from API handlers or a single shared `lib/email` helper used by those handlers.

Templates: [EMAILS.md](./EMAILS.md).  
Record rows in `Notification` for audit / dedupe.

**Ending soon:** implement with a simple scheduled invoke (platform cron hitting an API route) **or** check-on-read that enqueues send once — prefer the hosting platform’s native cron if available. Do not add Redis/queues.

## Authentication

**Existing in-repo:** none. External Nexudus links only; no API integration observed.

**NEW (required for MVP bidding + admin):**

| Actor | Approach (proposed minimum) |
|-------|-----------------------------|
| Bidder | Email magic link or email + one-time code → HTTP-only session cookie |
| Admin | Same auth, `role = admin` (seeded allowlist of emails) |

Do **not** claim Nexudus reuse until CURRENT_STATE unknowns are resolved. If later Nexudus SSO is approved, migrate session issuance — keep User table as the app identity.

“Reuse existing User model” from the product brief: **there is no User model to reuse**. MVP introduces a minimal User table (see DATA_MODEL.md) and must not duplicate persons across multiple local user stores.

## Deployment

**Observed today**

- Static site → GitHub Pages (`hackerdojo.org`)
- `api/waitlist.js` suggests a Vercel-compatible serverless host (unconfirmed config in-repo)

**MVP deployment shape (proposed)**

```text
GitHub repo
   ├── Jekyll build → GitHub Pages (unchanged path)
   └── api/*        → serverless host (confirm/document in implementation PR)
```

Implementation PR must check in whatever host config is required (e.g. `vercel.json` if Vercel is confirmed) so auction APIs are reproducible.

## Simple request flows

### Place bid

```text
User (session) → POST /api/auction/bids
                 → authn
                 → load artwork (row lock / transactional update)
                 → validate amount & ends_at & status
                 → insert Bid; update current_bid
                 → send bid_received + outbid emails
                 → return 201 + artwork summary
```

### Admin create artwork

```text
Admin (session) → POST /api/auction/artworks
                → require role=admin
                → validate payload
                → insert Artwork
                → return 201
```

## Explicit non-architecture

| Rejected | Reason |
|----------|--------|
| WebSockets / SSE live board | Out of scope; refresh/fetch enough |
| Redis | Not in repo; not needed for MVP |
| Message queue | Not in repo; emails send inline/simple retry |
| Microservices | Violates simplicity |
| New SPA | Violates reuse / static site fit |
