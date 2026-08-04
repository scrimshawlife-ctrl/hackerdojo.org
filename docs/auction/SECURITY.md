# Security — Silent Auction MVP

## Authentication

- **Gap:** No in-repo auth today (CURRENT_STATE.md).
- MVP introduces email magic-link / OTP → HTTP-only, `Secure`, `SameSite=Lax` (or `Strict`) session cookie.
- Session server-side store or signed cookie with rotation; expire reasonably (e.g. 14 days idle max — finalize in implementation).
- Login endpoints must be rate-limited.
- Do not embed long-lived secrets in Jekyll pages or client JS.

## Authorization

| Action | Who |
|--------|-----|
| List/view public active/preview artworks | Anyone |
| Place bid | Authenticated `bidder` or `admin` |
| Admin CRUD / close / view bidder emails | `role = admin` only |
| Cron ending-soon | Shared server secret, not user session |

Enforce checks on the **server** for every mutating route. Hide admin UI as UX only — never as the only control.

Admin allowlist: seed via env (emails) at deploy; avoid open self-signup to admin.

## Input validation

- Validate types/ranges for all money fields (positive, 2 decimal places, max ceiling).
- Sanitize/limit description and title lengths.
- Images: allow only `https` URLs (or uploads to a known bucket if added later); no arbitrary `javascript:` URLs.
- Reject unknown fields or strip them.
- Use parameterized queries / ORM bindings only.

## Rate limiting

| Surface | Suggested MVP limit |
|---------|---------------------|
| Auth request-link | Low per email + per IP (e.g. 5 / hour / email) |
| Place bid | Moderate per user + per artwork (e.g. 30 / hour) |
| Public GETs | Standard edge/platform limits |

Return `429` + `RATE_LIMITED`. Platform edge rate limits are acceptable if documented.

## Spam prevention

- Magic-link/OTP instead of passwords reduces credential stuffing surface.
- Generic responses on auth request to reduce account enumeration where practical.
- Honeypot or Turnstile/CAPTCHA on auth request **if** abuse appears (not required day one).
- Do not open CORS to `*` on authenticated auction APIs (waitlist currently uses `*`; **do not copy that** for bids).

## Bid integrity

- Server clock / DB `now()` authoritative vs client countdown.
- Transactional update: lock artwork row → re-read `current_bid` / `status` / `ends_at` → validate → insert bid → update `current_bid`.
- Never trust client `minimum_next_bid`.
- Disallow bidder from “editing” past bids; append-only Bid table.
- Admin changes to increments/`ends_at` must not invalidate history; document rules in API.md.

## Audit logging

MVP minimum (can be DB rows or structured logs):

| Event | Fields |
|-------|--------|
| bid_accepted | artwork_id, bid_id, user_id, amount, ip/user-agent hash |
| bid_rejected | reason code, user_id, artwork_id, amount |
| admin_artwork_mutation | admin_id, artwork_id, patch summary |
| admin_close | admin_id, artwork_id, winner_user_id |
| auth_login | user_id, method |
| email_sent / email_failed | notification_id, type |

Retain enough to resolve “who bid what when” disputes. Do not log raw magic tokens.

## Secrets & hosting

- Move any webhook/API keys to environment variables (waitlist currently hardcodes an Airtable webhook URL — **do not repeat** for auction).
- Confirm serverless host auth to env vars before implementation PR merges.

## Threat notes (lightweight)

| Threat | Mitigation |
|--------|------------|
| Last-second sniping | Accept until `ends_at`; optional short anti-snipe extension is **out of MVP** |
| Bid scraping | Public amounts OK; hide emails |
| Admin XSS via description | Escape on render; strict CSP if feasible later |
| Session theft | HTTPS, HttpOnly cookie, short OTP TTL |
