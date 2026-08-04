# Emails — Silent Auction MVP

Transactional emails only. Provider is **NEW** (none in repo today).  
Each successful send should write/update a `Notification` row (`type`, `user_id`, `sent_at`).

## 1. Bid received

| Field | Value |
|-------|--------|
| Type key | `bid_received` |
| Trigger | Bid accepted |
| Recipient | Bidding user |
| Subject | `Bid received: {{artwork_title}}` |

**Variables:** `bidder_name`, `artwork_title`, `artwork_url`, `amount`, `current_bid`, `ends_at`, `minimum_next_bid`

## 2. Outbid

| Field | Value |
|-------|--------|
| Type key | `outbid` |
| Trigger | New bid accepted that exceeds previous high bid; previous high bidder ≠ new bidder |
| Recipient | Previous high bidder |
| Subject | `You've been outbid on {{artwork_title}}` |

**Variables:** `bidder_name`, `artwork_title`, `artwork_url`, `your_amount`, `current_bid`, `minimum_next_bid`, `ends_at`

## 3. Winner

| Field | Value |
|-------|--------|
| Type key | `winner` |
| Trigger | Artwork closed (cron after `ends_at`, or admin close) with at least one bid |
| Recipient | Winning user (`winner_user_id`) |
| Subject | `You won: {{artwork_title}}` |

**Variables:** `winner_name`, `artwork_title`, `artwork_url`, `winning_amount`, `pickup_or_next_steps` (static admin-configured blurb for MVP)

## 4. Auction closed

| Field | Value |
|-------|--------|
| Type key | `auction_closed` |
| Trigger | Artwork transitions to `closed` |
| Recipient | All admins (and optionally winner — winner already gets `winner`) |
| Subject | `Auction closed: {{artwork_title}}` |

**Variables:** `artwork_title`, `artwork_url`, `status`, `winning_amount` (or `none`), `winner_email` (admins only), `bid_count`

## 5. Auction ending soon

| Field | Value |
|-------|--------|
| Type key | `auction_ending_soon` |
| Trigger | Scheduler finds `active` artwork with `ends_at` within window (default **24 hours**); send once per user/artwork |
| Recipient | MVP: current high bidder (if any). Optional: all users who bid on that artwork (nice-to-have) |
| Subject | `Ending soon: {{artwork_title}}` |

**Variables:** `bidder_name`, `artwork_title`, `artwork_url`, `current_bid`, `minimum_next_bid`, `ends_at`

Idempotency: unique constraint / lookup on `(type, user_id, artwork_id)` before send.

---

## Shared footer variables

All emails: `site_name` (`Hacker Dojo`), `support_email` (ops-configured), `unsubscribe_note` (transactional; short why-received line).

## Implementation notes

- Send inline from API after successful DB commit when possible (`bid_received`, `outbid`).
- `winner` + `auction_closed` from close job/admin action.
- `auction_ending_soon` from secured cron route.
- Failures: log + leave `sent_at` null; do not roll back the bid.
- No marketing digests in MVP.
