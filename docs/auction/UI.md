# UI — Wireframes (ASCII only)

No mockups. No visual redesign of the global site. Auction pages use the existing default layout (header / footer).

## 1. Auction gallery — `/auction/`

```text
+--------------------------------------------------------------+
| [Hacker Dojo header — existing]                              |
+--------------------------------------------------------------+
| Silent Auction                                               |
| Fundraising lots · bid before the countdown ends             |
|                                                              |
| +------------------+  +------------------+  +--------------+ |
| | [image]          |  | [image]          |  | [image]      | |
| | Title            |  | Title            |  | Title        | |
| | Artist           |  | Artist           |  | Artist       | |
| | Current $XX      |  | Current $XX      |  | Starting $XX | |
| | Ends in 2d 4h    |  | Ends in 5h       |  | Ends in 1d   | |
| | [View]           |  | [View]           |  | [View]       | |
| +------------------+  +------------------+  +--------------+ |
|                                                              |
+--------------------------------------------------------------+
| [Hacker Dojo footer — existing]                              |
+--------------------------------------------------------------+
```

Mobile: single column stack of lots.

## 2. Artwork page — `/auction/artwork/:id/`

```text
+--------------------------------------------------------------+
| [header]                                                     |
+--------------------------------------------------------------+
| +---------------------+  Title                               |
| |                     |  Artist                              |
| |   primary image     |  Current bid: $30.00                 |
| |                     |  Min next: $35.00                    |
| +---------------------+  Ends in: 1d 03:12:45                |
| [thumbs...]              Status: Active                      |
|                                                              |
| Description                                                  |
| ............................................................ |
|                                                              |
| Recent bids                                                  |
|  $30.00  ·  2h ago  ·  Jamie                                 |
|  $25.00  ·  1d ago  ·  Sam                                   |
|                                                              |
| [ Place bid ]   (disabled if closed / not logged in → prompt)|
+--------------------------------------------------------------+
| [footer]                                                     |
+--------------------------------------------------------------+
```

## 3. Bid modal

Opened from Place bid. Keep modal minimal — form only.

```text
+--------------------------------------+
| Place a bid                       [X]|
|--------------------------------------|
| Torii at Dusk                        |
| Minimum bid: $35.00                  |
|                                      |
| Amount                               |
| [  35.00                          ]  |
|                                      |
| [ Cancel ]            [ Submit bid ] |
|                                      |
| Note: You will get an email if       |
| someone outbids you.                 |
+--------------------------------------+
```

States:

- Logged out → replace body with “Log in with email” (magic link / OTP)
- Error → inline message (`BID_TOO_LOW`, etc.)
- Success → short confirmation + updated current bid on page

## 4. Admin page — `/auction/admin/`

Protected. No cards-for-decoration; simple table + form.

```text
+--------------------------------------------------------------+
| Admin · Silent Auction                                       |
| [ New artwork ]                                              |
|                                                              |
| Title          Artist     Status   Current   Ends        Ops |
| -------------- ---------- -------- --------- ----------- --- |
| Torii at Dusk  A. Maker   active   30.00     Sep 1  …    Edit|
| Sketch #12     B. Friend  draft    —         Sep 5  …    Edit|
|                                                              |
+--------------------------------------------------------------+
| Edit artwork                                                 |
| Title [..................] Artist [................]         |
| Description [........................................]       |
| Images (URLs, one per line)                                  |
| [........................................................]   |
| Starting [20.00] Increment [5.00] Ends at [datetime-local]   |
| Status [ draft v ]                                           |
| [ Save ]  [ Close auction ]  [ Delete (draft only) ]         |
|                                                              |
| Bids for this lot                                            |
| $30.00 Jamie  email@…  2026-08-20 18:01                      |
| $25.00 Sam    email@…  2026-08-19 09:12                      |
+--------------------------------------------------------------+
```

## UI rules for implementers

- Reuse existing header/footer; do not invent a new marketing chrome.
- One job per page: gallery browse · lot detail/bid · admin manage.
- Countdown is visible on gallery cards and detail; server enforces end time.
- Prefer existing CSS variables/colors from `static/css/style.css`; Tailwind CDN only if it meaningfully speeds forms (as on waitlist) without becoming a new design system.
- No live-updating ticker beyond a local countdown timer + refresh after bid.
