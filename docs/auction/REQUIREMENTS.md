# Requirements — Silent Auction MVP

## Functional requirements

### F1 — Artwork listing (gallery)

- Public page lists artworks with status `active` (and optionally `preview`).
- Each card shows: title, artist, primary image, current bid (or starting bid), time remaining.
- Closed / draft items are not shown on the public gallery (unless an explicit “past auctions” view is added later — out of MVP).

### F2 — Artwork page

- Public detail page for one artwork: images, title, artist, description, starting bid, current bid, minimum increment, countdown to `ends_at`, status.
- Shows recent bid amount history at a high level (amount + time; bidder display name optional/privacy-aware).
- Clear call-to-action to place a bid when status is `active` and `now < ends_at`.

### F3 — Bid

- Authenticated user can submit a bid amount for an active artwork.
- Server rejects bids that are below `current_bid + minimum_increment` (or below `starting_bid` when no bids exist).
- Server rejects bids after `ends_at` or when status is not `active`.
- On success: persist Bid, update Artwork `current_bid`, emit notifications (see EMAILS.md).
- No proxy bidding / auto-bid in MVP.

### F4 — Countdown

- Artwork page shows time remaining until `ends_at`.
- Countdown is informational; **server time / `ends_at` is authoritative** for accepting bids.
- No WebSocket live clock sync required; page load + simple client timer is enough.

### F5 — Admin

- Admin-authenticated users can:
  - Create / update artwork fields (title, artist, description, images, starting_bid, minimum_increment, ends_at, status)
  - List all artworks (all statuses)
  - View bids for an artwork
  - Close an artwork early (`status = closed`) or mark winner after end
- Non-admins cannot access admin endpoints or pages.

### F6 — Email notifications

System sends the emails defined in [EMAILS.md](./EMAILS.md):

- Bid received (bidder)
- Outbid (previous high bidder)
- Auction ending soon (current high bidder and/or watchers — MVP: current high bidder + optional admin)
- Winner
- Auction closed (admin summary and/or winner copy as specified)

## Nonfunctional requirements

| ID | Requirement |
|----|-------------|
| N1 Accessibility | Forms and pages usable with keyboard; labels on inputs; sufficient contrast; images have alt text |
| N2 Maintainability | Few files; follow existing Jekyll + `api/` patterns; avoid new frameworks |
| N3 Simplicity | No WebSockets, Redis, queues (unless repo already has them — it does not), no microservices |
| N4 Responsive | Gallery, artwork, bid UI, admin usable on mobile widths |
| N5 Secure | AuthN/AuthZ on mutating routes; input validation; rate limiting; bid integrity (see SECURITY.md) |

## Out of scope (explicit)

- Payment capture, checkout, invoicing, escrow
- Shipping / pickup logistics workflows
- Live bidding / presence indicators
- Auto-bid / proxy bid agents
- Multi-currency
- Seller marketplace accounts
- Social sharing optimization / SEO program beyond basic page titles
- Redesign of global nav, homepage, or brand system
- Native mobile apps
- Impact Relay integration
- Public donor leaderboards / transparency portal
- Guaranteed reuse of Nexudus sessions (unknown; see CURRENT_STATE.md)

## Requirement traceability

Acceptance mapping lives in [ACCEPTANCE.md](./ACCEPTANCE.md).  
Implementation tasks live in [TODO.md](./TODO.md).
