# Decisions — Auction Space (Phase 0)

Record infrastructure choices **before** Phase 1 coding.  
Until the four decisions below are filled, Slice 0 (Bootstrap) stays blocked.

Related: [CURRENT_STATE.md](./CURRENT_STATE.md) unknowns · [ARCHITECTURE.md](./ARCHITECTURE.md) · [TODO.md](./TODO.md) T00d / T01

---

## Decision log

| ID | Topic | Choice | Decided by | Date | Notes |
|----|-------|--------|------------|------|-------|
| D1 | Database | _pending_ | | | Must support transactional row locks for bids |
| D2 | Auth method | _pending_ | | | Default proposal: email magic-link / OTP + HTTP-only session cookie |
| D3 | Email provider | _pending_ | | | Transactional only (bid / outbid / winner / closed / ending soon) |
| D4 | API host | _pending_ | | | Must run `api/*.js` serverless handlers beside waitlist |

### Candidate shortlists (not prescriptions)

| Topic | Options to consider |
|-------|---------------------|
| D1 Database | Hosted Postgres (preferred for bid integrity); other durable SQL if already operated by Dojo |
| D2 Auth | Magic-link / OTP + session cookie (default in ARCHITECTURE); Nexudus SSO only if UNKNOWN is resolved |
| D3 Email | Resend, Postmark, SendGrid, or existing Dojo transactional account |
| D4 API host | Confirm active Vercel (or compatible) project; check in host config with Slice 5 |

**Do not** use Airtable as the system of record for bids unless reviewers explicitly accept concurrency/integrity tradeoffs (see CURRENT_STATE).

---

## Env var checklist (fill after D1–D4)

Copy into the Slice 0 / staging secrets store. Names are suggestions — rename to match the chosen providers.

| Variable | Purpose | Required from |
|----------|---------|---------------|
| `DATABASE_URL` | DB connection string | D1 |
| `SESSION_SECRET` | Sign/encrypt session cookies | D2 |
| `ADMIN_EMAIL` | Seed admin user | Slice 0 |
| `EMAIL_API_KEY` | Provider API key | D3 |
| `EMAIL_FROM` | From address for auction mail | D3 |
| `AUCTION_CRON_SECRET` | Authorize ending-soon cron | Slice 4 |
| `CORS_ORIGIN` | Allowed browser origin(s) | Slice 5 |

Add provider-specific vars (e.g. `RESEND_API_KEY`) when D3 is chosen; keep secrets out of the client and out of git.

---

## How to close T00d

1. Reviewers fill the Decision log table (D1–D4).  
2. Update this file’s “Choice / Decided by / Date” columns.  
3. Check off **T00d** in [TODO.md](./TODO.md).  
4. Copy confirmed choices + env list into Slice 0 task **T01**.  
5. Open the Slice 0 implementation PR.

---

## History

| Date | Event |
|------|-------|
| 2026-08-03 | Planning docs package opened; upstream [PR #62](https://github.com/hd-admin/hackerdojo.org/pull/62) merged to `hd-admin/hackerdojo.org` |
| 2026-08-04 | Decision log + env checklist added so Phase 0 can finish without blocking on ad-hoc chat |
