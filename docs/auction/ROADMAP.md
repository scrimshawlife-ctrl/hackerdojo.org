# Roadmap — Silent Auction

## Phase 0 — Documentation (this PR)

- Repository audit
- Requirements, architecture, data model, API, UI wireframes, emails, security, acceptance, tasks
- **No production behavior change**

Exit criteria: Draft/planning PR reviewed; infrastructure decisions recorded (DB, auth, email, API host).

## Phase 1 — MVP

- User identity (minimal) + session auth
- Artwork / Bid / Notification persistence
- Public gallery + artwork page + countdown
- Place bid with integrity rules
- Admin create/edit/close
- Emails: bid received, outbid, ending soon, winner, auction closed

Exit criteria: ACCEPTANCE.md F1–F6 pass on staging.

## Phase 2 — Payments

- Winner payment collection (e.g. Stripe checkout or invoice link)
- Paid / unpaid state on Artwork or Payment table
- Receipt email
- Still not a marketplace

## Phase 3 — Donor transparency

- Public totals raised (aggregate)
- Optional anonymized donor/bidder recognition wall
- Export for board/impact reporting

## Phase 4 — Impact Relay integration

- Connect auction outcomes to Impact Relay (or successor) so fundraising results feed broader Dojo impact storytelling
- Exact interface TBD when Impact Relay API/docs are available

```text
Phase 0 docs → Phase 1 MVP → Phase 2 payments → Phase 3 transparency → Phase 4 Impact Relay
```

Each phase should ship behind clear acceptance checks and stay aligned with “simple fundraising feature,” not marketplace scope.
