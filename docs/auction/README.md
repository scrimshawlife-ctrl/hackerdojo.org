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
| [SLICES.md](./SLICES.md) | **Build guide:** vertical slices → minimal fully functional auction |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Repository audit (observed / inferred / unknown) |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Functional & nonfunctional requirements; out of scope |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend, backend, database, email, auth, deployment |
| [DATA_MODEL.md](./DATA_MODEL.md) | MVP tables: Artwork, Bid, Notification (+ User gap) |
| [API.md](./API.md) | REST endpoints, payloads, errors |
| [UI.md](./UI.md) | ASCII wireframes only |
| [EMAILS.md](./EMAILS.md) | Notification templates and triggers |
| [SECURITY.md](./SECURITY.md) | AuthZ, validation, rate limits, bid integrity |
| [ACCEPTANCE.md](./ACCEPTANCE.md) | Requirement → implementation → verification |
| [ROADMAP.md](./ROADMAP.md) | Full roadmap: Phases 0–4 |
| [TODO.md](./TODO.md) | Tasks by slice / phase (~2 hours each) |

## Build path (Phase 1)

See **[SLICES.md](./SLICES.md)**. Short version:

| Slice | Delivers |
|-------|----------|
| 0 Bootstrap | DB + admin user |
| 1 Browse | Gallery, detail, countdown |
| 2 Bid | Login + place bid |
| 3 Admin | Create / edit / close |
| 4 Emails | Bid / outbid / winner / closed / ending soon |
| 5 Ship | Staging acceptance → **minimal fully functional MVP** |

## Roadmap (summary)

| Phase | Name | Status |
|-------|------|--------|
| 0 | Documentation | In progress (this package / planning PR) |
| 1 | MVP (slices 0–5) | Planned — [SLICES.md](./SLICES.md) + [TODO.md](./TODO.md) |
| 2 | Payments | After MVP — ROADMAP + TODO T27–T34 |
| 3 | Donor transparency | After payments — TODO T35–T41 |
| 4 | Impact Relay integration | When API exists — TODO T42–T48 |

Details: [ROADMAP.md](./ROADMAP.md).

## Current status

| Item | State |
|------|-------|
| Repository audit | Complete (see [CURRENT_STATE.md](./CURRENT_STATE.md)) |
| Planning docs | This package (includes full Phases 0–4 roadmap) |
| Application code | **Unchanged** |
| Implementation | Not started — blocked on review of this PR |
