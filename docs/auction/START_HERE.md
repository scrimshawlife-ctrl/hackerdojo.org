# Start Here

## Reading order

1. [README.md](./README.md) — overview and index  
2. [CURRENT_STATE.md](./CURRENT_STATE.md) — what the repo actually is today  
3. [REQUIREMENTS.md](./REQUIREMENTS.md) — what the MVP must do  
4. [ARCHITECTURE.md](./ARCHITECTURE.md) — how it fits this repo  
5. [DATA_MODEL.md](./DATA_MODEL.md) — tables and relationships  
6. [API.md](./API.md) — REST surface  
7. [UI.md](./UI.md) — page wireframes  
8. [EMAILS.md](./EMAILS.md) — notification catalog  
9. [SECURITY.md](./SECURITY.md) — threats and controls  
10. [ACCEPTANCE.md](./ACCEPTANCE.md) — how we know it works  
11. [ROADMAP.md](./ROADMAP.md) — phased delivery  
12. [TODO.md](./TODO.md) — concrete implementation tasks  

## Implementation order (after this PR is approved)

Follow the full roadmap in [ROADMAP.md](./ROADMAP.md). Phase 1 detail:

1. **Decide infrastructure gaps** — This repo has no in-repo User model, ORM, auth, or email sender. Approve the minimal additions in ARCHITECTURE.md before coding.  
2. **Data model + migrations** — User (new), Artwork, Bid, Notification.  
3. **Read APIs + static gallery / artwork pages** — browse and countdown without bidding.  
4. **Auth for bidders** — simplest session/magic-link approach consistent with approved architecture.  
5. **Place-bid API** — validation, increments, race-safe updates.  
6. **Email notifications** — bid received, outbid, ending soon, winner, closed.  
7. **Admin CRUD + close** — protect with admin role.  
8. **Acceptance tests / manual checklist** — [ACCEPTANCE.md](./ACCEPTANCE.md).  
9. **Later phases** — Payments (2) → Donor transparency (3) → Impact Relay (4); tasks in [TODO.md](./TODO.md).  

## Assumptions

- Reviewers accept that MVP introduces a small backend surface (DB + auth + email) because none exist in this repository today. See CURRENT_STATE.md.  
- Auction UI is added as Jekyll pages under the existing site, reusing `_layouts/default.html`, header/footer, and existing CSS/fonts where practical.  
- Bid API handlers follow the existing `api/*.js` serverless style used by `api/waitlist.js`.  
- No WebSockets, Redis, message queues, or microservices.  
- Countdown and “current bid” refresh via normal page load / lightweight client fetch — not live sockets.  
- Payments are out of scope for MVP (collect winner contact; settle offline or in Phase 2).  

## Scope

**In scope (MVP):** artwork listing, artwork detail, authenticated bid, countdown to `ends_at`, admin management, email notifications listed in EMAILS.md.

**Out of scope:** marketplace features, payments, live bidding, site redesign, Impact Relay, donor transparency UI.

Keep every change as small as the corresponding task in [TODO.md](./TODO.md).
