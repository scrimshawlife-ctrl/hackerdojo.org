# Silent Auction MVP — Planning

Documentation-first design for a minimal Hacker Dojo fundraising silent auction.

**Status:** Phase 0 — documentation only. No production behavior has been changed.

## Overview

Hacker Dojo needs a simple silent auction for fundraising — typically artwork and donated items. This is **not** an online marketplace. Bidders browse listings, place bids before a deadline, and receive email updates. Admins manage artworks and close auctions.

This package defines requirements, architecture, data model, API, UI wireframes, emails, security, acceptance criteria, and an implementation roadmap **before** code is written.

## Goals

- Document a minimal, maintainable silent auction MVP that fits this repository.
- Prefer reuse of existing patterns (Jekyll pages, `api/` serverless handlers, site CSS/fonts).
- Keep scope small: list → bid → countdown → notify → admin.
- Produce a reviewable plan that can be implemented in short, sequential tasks.

## Non-goals

- Online marketplace / multi-seller storefront
- Live / real-time bidding (WebSockets, polling fleets, Redis)
- Payment processing in MVP (Phase 2)
- Mobile apps, microservices, or new frontend frameworks
- Redesigning the Hacker Dojo marketing site
- Donor transparency dashboards (Phase 3)
- Impact Relay integration (Phase 4)

## Feature diagram

```text
                    +------------------+
                    |  Public Gallery  |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |  Artwork Page    |
                    |  + countdown     |
                    +--------+---------+
                             |
                     place bid (auth)
                             |
                             v
              +--------------+---------------+
              |         Bid API               |
              |  validate → persist → notify  |
              +------+----------------+------+
                     |                |
                     v                v
              +-------------+   +-------------+
              |  Database   |   |   Emails    |
              +-------------+   +-------------+
                     ^
                     |
              +------+------+
              | Admin pages |
              | CRUD / close|
              +-------------+
```

## Documentation index

| Doc | Purpose |
|-----|---------|
| [START_HERE.md](./START_HERE.md) | Reading order, implementation order, assumptions, scope |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Repository audit (observed / inferred / unknown) |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Functional & nonfunctional requirements; out of scope |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend, backend, database, email, auth, deployment |
| [DATA_MODEL.md](./DATA_MODEL.md) | MVP tables: Artwork, Bid, Notification (+ User gap) |
| [API.md](./API.md) | REST endpoints, payloads, errors |
| [UI.md](./UI.md) | ASCII wireframes only |
| [EMAILS.md](./EMAILS.md) | Notification templates and triggers |
| [SECURITY.md](./SECURITY.md) | AuthZ, validation, rate limits, bid integrity |
| [ACCEPTANCE.md](./ACCEPTANCE.md) | Requirement → implementation → verification |
| [ROADMAP.md](./ROADMAP.md) | Phases 0–4 |
| [TODO.md](./TODO.md) | Implementation tasks (~2 hours each) |

## Current status

| Item | State |
|------|-------|
| Repository audit | Complete (see [CURRENT_STATE.md](./CURRENT_STATE.md)) |
| Planning docs | This package |
| Application code | **Unchanged** |
| Implementation | Not started — blocked on review of this PR |
