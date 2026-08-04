# API — Silent Auction MVP

REST-ish JSON over the existing serverless `api/` style.  
Base path proposal: `/api/auction`.

Auth: session cookie (see SECURITY.md) unless reviewer picks bearer tokens.

## Conventions

- Request/response: `application/json`
- Money: decimal strings with 2 places (e.g. `"25.00"`) to avoid float issues
- Timestamps: ISO-8601 UTC
- Errors:

```json
{
  "error": {
    "code": "BID_TOO_LOW",
    "message": "Bid must be at least 35.00"
  }
}
```

### Common HTTP status codes

| Status | When |
|--------|------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Missing resource |
| 409 | Conflict (e.g. outbid race lost, already closed) |
| 429 | Rate limited |
| 405 | Wrong method (match waitlist style) |
| 500 | Unexpected server error |

---

## GET

### `GET /api/auction/artworks`

List public artworks.

**Query:** `status=active` (default), optional `limit`, `offset`

**Response 200**

```json
{
  "artworks": [
    {
      "id": "art_123",
      "title": "Torii at Dusk",
      "artist": "A. Maker",
      "primary_image": "https://…/1.jpg",
      "starting_bid": "20.00",
      "current_bid": "30.00",
      "minimum_increment": "5.00",
      "minimum_next_bid": "35.00",
      "ends_at": "2026-09-01T23:59:59Z",
      "status": "active"
    }
  ]
}
```

### `GET /api/auction/artworks/:id`

Artwork detail + recent bids.

**Response 200**

```json
{
  "artwork": {
    "id": "art_123",
    "title": "Torii at Dusk",
    "artist": "A. Maker",
    "description": "…",
    "images": ["https://…/1.jpg", "https://…/2.jpg"],
    "starting_bid": "20.00",
    "current_bid": "30.00",
    "minimum_increment": "5.00",
    "minimum_next_bid": "35.00",
    "ends_at": "2026-09-01T23:59:59Z",
    "status": "active"
  },
  "bids": [
    { "amount": "30.00", "created_at": "2026-08-20T18:01:00Z", "bidder_display": "Jamie" }
  ]
}
```

Bidder PII: prefer first name / masked email; never expose full email to other bidders.

### `GET /api/auction/artworks/:id/bids`

Bid history for artwork (public amounts; privacy-safe display names).

### `GET /api/auction/admin/artworks` **admin**

All statuses; includes draft.

### `GET /api/auction/me` **auth**

```json
{ "user": { "id": "usr_1", "email": "a@b.c", "name": "Jamie", "role": "bidder" } }
```

---

## POST

### `POST /api/auction/auth/request-link`

Start magic-link / OTP login.

**Body**

```json
{ "email": "jamie@example.com", "name": "Jamie" }
```

**Response 200** `{ "ok": true }` (always generic to avoid account enumeration where practical)

### `POST /api/auction/auth/verify`

**Body**

```json
{ "email": "jamie@example.com", "token": "…" }
```

**Response 200** sets session cookie + `{ "user": { … } }`

### `POST /api/auction/bids` **auth**

Place a bid.

**Body**

```json
{
  "artwork_id": "art_123",
  "amount": "35.00"
}
```

(`auction_id` accepted as alias for `artwork_id`)

**Response 201**

```json
{
  "bid": {
    "id": "bid_9",
    "artwork_id": "art_123",
    "amount": "35.00",
    "created_at": "2026-08-20T19:00:00Z"
  },
  "artwork": {
    "current_bid": "35.00",
    "minimum_next_bid": "40.00",
    "ends_at": "2026-09-01T23:59:59Z",
    "status": "active"
  }
}
```

**Errors:** `BID_TOO_LOW`, `AUCTION_CLOSED`, `AUCTION_NOT_ACTIVE`, `INVALID_AMOUNT`

### `POST /api/auction/artworks` **admin**

**Body**

```json
{
  "title": "Torii at Dusk",
  "artist": "A. Maker",
  "description": "Ink on paper",
  "images": ["https://…/1.jpg"],
  "starting_bid": "20.00",
  "minimum_increment": "5.00",
  "ends_at": "2026-09-01T23:59:59Z",
  "status": "draft"
}
```

**Response 201** `{ "artwork": { … } }`

### `POST /api/auction/artworks/:id/close` **admin**

Close lot; set winner to current high bidder if any.

**Response 200** `{ "artwork": { "status": "closed", "winner_user_id": "usr_…" } }`

### `POST /api/auction/cron/ending-soon` **server secret**

Invoked by scheduler. Finds active lots ending within configured window; sends `auction_ending_soon` once per user/artwork.

Protect with shared secret header, not public session.

---

## PATCH

### `PATCH /api/auction/artworks/:id` **admin**

Partial update of artwork fields (title, artist, description, images, starting_bid, minimum_increment, ends_at, status).

Rules:

- Do not lower `starting_bid` below `current_bid` after bids exist.
- Changing `status` to `active` requires valid `ends_at` in the future.

**Response 200** `{ "artwork": { … } }`

### `PATCH /api/auction/me` **auth**

```json
{ "name": "Jamie Q." }
```

---

## DELETE

### `DELETE /api/auction/artworks/:id` **admin**

Allowed only if `status = draft` and zero bids. Otherwise `409` with `ARTWORK_NOT_DELETABLE`.

Soft-alternative: set `status = closed` via PATCH/close — preferred for artworks with history.

### `DELETE /api/auction/auth/session` **auth**

Log out; clear cookie. **Response 204**

---

## Error code catalog (MVP)

| code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Missing/invalid fields |
| INVALID_AMOUNT | 400 | Not a positive money amount |
| BID_TOO_LOW | 409 | Below minimum next bid |
| AUCTION_CLOSED | 409 | Past ends_at or closed |
| AUCTION_NOT_ACTIVE | 409 | Wrong status |
| UNAUTHENTICATED | 401 | Login required |
| FORBIDDEN | 403 | Admin or owner required |
| NOT_FOUND | 404 | Unknown id |
| ARTWORK_NOT_DELETABLE | 409 | Has bids / not draft |
| RATE_LIMITED | 429 | Too many attempts |
| SERVER_ERROR | 500 | Unexpected |

## Notes

- CSRF: for cookie sessions, require `SameSite` cookie + origin check or CSRF token on POSTs.
- Idempotency: optional `Idempotency-Key` header on `POST /bids` in a fast-follow if double-submit appears in testing.
