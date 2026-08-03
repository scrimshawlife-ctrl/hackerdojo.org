# TODO — Implementation tasks (~2 hours each)

Full task list aligned to [ROADMAP.md](./ROADMAP.md).  
Do not start Phase 1 until Phase 0 PR is reviewed and infrastructure choices (DB, auth, email, API host) are written down.

---

## Phase 0 — Documentation

- [x] **T00a** Repository audit → CURRENT_STATE.md
- [x] **T00b** Planning docs package under `docs/auction/`
- [x] **T00c** Root README pointer + draft planning PR
- [ ] **T00d** Reviewer records DB / auth / email / API host decisions
- [ ] **T00e** Merge Phase 0 docs; open Phase 1 implementation PR series

---

## Phase 1 — MVP

### Foundations

- [ ] **T01** Record approved choices: database, email provider, auth method, serverless host; add env var checklist to `docs/auction/` or deploy notes.
- [ ] **T02** Add DB client + migration tooling matching host; create empty migration pipeline.
- [ ] **T03** Migrate `User` table + seed one admin email from env.
- [ ] **T04** Migrate `Artwork`, `Bid`, `Notification` tables + indexes from DATA_MODEL.md.
- [ ] **T05** Shared API helpers: JSON response, error codes, money parse/validate, requireUser / requireAdmin.

### Auth

- [ ] **T06** `POST /api/auction/auth/request-link` + token persistence + rate limit.
- [ ] **T07** `POST /api/auction/auth/verify` + session cookie + `GET /me` + `DELETE` session.
- [ ] **T08** Minimal login UI fragment reused by bid modal and admin gate.

### Public read path

- [ ] **T09** `GET /api/auction/artworks` + `GET /api/auction/artworks/:id` (+ bids).
- [ ] **T10** Jekyll gallery page `/auction/` wired to list API (or build-time + refresh).
- [ ] **T11** Artwork detail page with countdown timer + bid CTA states.

### Bidding

- [ ] **T12** `POST /api/auction/bids` with transactional row lock and validation errors.
- [ ] **T13** Bid modal UI + success/error handling + page refresh of current bid.
- [ ] **T14** Manual concurrency check script/notes (two bids near-simultaneous).

### Email

- [ ] **T15** Email send helper + Notification write on success/failure.
- [ ] **T16** Implement `bid_received` + `outbid` sends from bid handler.
- [ ] **T17** Close flow emails: `winner` + `auction_closed`.
- [ ] **T18** Secured cron route for `auction_ending_soon` + idempotency.

### Admin

- [ ] **T19** Admin list/create API (`GET/POST` artworks admin).
- [ ] **T20** Admin patch + delete-draft + close endpoints.
- [ ] **T21** Admin HTML page: table, editor form, bid list.

### Hardening & ship

- [ ] **T22** CORS lockdown for auction APIs; CSRF/origin checks for cookie POSTs.
- [ ] **T23** Rate limits on auth + bid; audit log lines for bid/admin events.
- [ ] **T24** Accessibility pass on gallery, detail, modal, admin forms.
- [ ] **T25** Staging deploy config checked in; smoke through ACCEPTANCE.md F1–F6.
- [ ] **T26** Short operator runbook: create lot, activate, close, resend policy.

---

## Phase 2 — Payments

Depends on Phase 1 exit criteria + approved payment provider.

- [ ] **T27** Choose provider + document env vars / webhook secrets (docs addendum).
- [ ] **T28** Add `Payment` table or Artwork payment columns (`unpaid` / `pending` / `paid` / `waived`).
- [ ] **T29** Create checkout / payment-link API for a closed winning lot.
- [ ] **T30** Webhook (or confirm endpoint) to mark payment paid; idempotent.
- [ ] **T31** Admin: view status, mark waived, resend payment link.
- [ ] **T32** Winner email: pay link + receipt email on success; admin paid notice.
- [ ] **T33** Acceptance: unpaid → pay → paid; failed webhook retry; waived path.
- [ ] **T34** Update DATA_MODEL / API / EMAILS / ACCEPTANCE for payment fields.

---

## Phase 3 — Donor transparency

Depends on Phase 2 (prefer paid totals).

- [ ] **T35** Aggregate API: totals raised for campaign / date range (paid only).
- [ ] **T36** Public transparency page (Jekyll) showing aggregate + optional lot count.
- [ ] **T37** Opt-in recognition display name on User or bid profile; Anonymous default.
- [ ] **T38** Optional public recognition wall (no emails).
- [ ] **T39** Admin CSV export: lots, winners, amounts, payment status.
- [ ] **T40** Privacy copy + SECURITY notes; verify no PII on public page.
- [ ] **T41** Acceptance: aggregates match admin export; anonymous honored.

---

## Phase 4 — Impact Relay integration

Depends on Impact Relay API availability + Phase 2/3 stable fields.

- [ ] **T42** Write integration addendum when Impact Relay API/docs exist.
- [ ] **T43** Map paid/closed auction fields to Impact Relay event schema.
- [ ] **T44** Secured sync route or scheduled job; store last sync cursor.
- [ ] **T45** Idempotent upsert (no double-count on retry).
- [ ] **T46** Admin: last sync time, error message, manual re-sync.
- [ ] **T47** Staging proof: sample campaign appears correctly in Impact Relay.
- [ ] **T48** Update ROADMAP exit criteria + operator runbook with real endpoints.

---

## Explicitly out of roadmap

- WebSockets / live bidding
- Redis / message queues (unless repo gains them for other reasons)
- Microservices / SPA rewrite
- Marketplace multi-seller accounts
- Nexudus SSO (until CURRENT_STATE UNKNOWN is resolved — then optional fast-follow)
