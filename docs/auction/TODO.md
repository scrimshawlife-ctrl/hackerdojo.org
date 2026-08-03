# TODO — Implementation tasks (~2 hours each)

Do not start until Phase 0 PR is reviewed and infrastructure choices (DB, auth, email, API host) are written down.

## Foundations

- [ ] **T01** Record approved choices: database, email provider, auth method, serverless host; add env var checklist to `docs/auction/` or deploy notes.
- [ ] **T02** Add DB client + migration tooling matching host; create empty migration pipeline.
- [ ] **T03** Migrate `User` table + seed one admin email from env.
- [ ] **T04** Migrate `Artwork`, `Bid`, `Notification` tables + indexes from DATA_MODEL.md.
- [ ] **T05** Shared API helpers: JSON response, error codes, money parse/validate, requireUser / requireAdmin.

## Auth

- [ ] **T06** `POST /api/auction/auth/request-link` + token persistence + rate limit.
- [ ] **T07** `POST /api/auction/auth/verify` + session cookie + `GET /me` + `DELETE` session.
- [ ] **T08** Minimal login UI fragment reused by bid modal and admin gate.

## Public read path

- [ ] **T09** `GET /api/auction/artworks` + `GET /api/auction/artworks/:id` (+ bids).
- [ ] **T10** Jekyll gallery page `/auction/` wired to list API (or build-time + refresh).
- [ ] **T11** Artwork detail page with countdown timer + bid CTA states.

## Bidding

- [ ] **T12** `POST /api/auction/bids` with transactional row lock and validation errors.
- [ ] **T13** Bid modal UI + success/error handling + page refresh of current bid.
- [ ] **T14** Manual concurrency check script/notes (two bids near-simultaneous).

## Email

- [ ] **T15** Email send helper + Notification write on success/failure.
- [ ] **T16** Implement `bid_received` + `outbid` sends from bid handler.
- [ ] **T17** Close flow emails: `winner` + `auction_closed`.
- [ ] **T18** Secured cron route for `auction_ending_soon` + idempotency.

## Admin

- [ ] **T19** Admin list/create API (`GET/POST` artworks admin).
- [ ] **T20** Admin patch + delete-draft + close endpoints.
- [ ] **T21** Admin HTML page: table, editor form, bid list.

## Hardening & ship

- [ ] **T22** CORS lockdown for auction APIs; CSRF/origin checks for cookie POSTs.
- [ ] **T23** Rate limits on auth + bid; audit log lines for bid/admin events.
- [ ] **T24** Accessibility pass on gallery, detail, modal, admin forms.
- [ ] **T25** Staging deploy config checked in; smoke through ACCEPTANCE.md F1–F6.
- [ ] **T26** Short operator runbook: create lot, activate, close, resend policy.

## Explicitly deferred

- Payments (Phase 2)
- Donor transparency (Phase 3)
- Impact Relay (Phase 4)
- WebSockets / live bidding
- Nexudus SSO (until UNKNOWN resolved)
