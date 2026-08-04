/**
 * Transactional email via Resend (optional until keys configured).
 * Failures are logged; callers should not roll back domain transactions.
 */

import { getEmailApiKey, getEmailFrom, getSiteUrl } from './config.js';
import { query } from './db.js';

/**
 * @param {{
 *   userId: string,
 *   type: string,
 *   to: string,
 *   subject: string,
 *   text: string,
 *   html?: string,
 *   artworkId?: string | null,
 *   bidId?: string | null,
 *   meta?: Record<string, unknown>
 * }} opts
 */
export async function sendAuctionEmail(opts) {
  const apiKey = getEmailApiKey();
  const from = getEmailFrom();

  const insert = await query(
    `INSERT INTO auction_notifications (user_id, type, artwork_id, bid_id, meta)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id`,
    [
      opts.userId,
      opts.type,
      opts.artworkId ?? null,
      opts.bidId ?? null,
      JSON.stringify(opts.meta || {}),
    ]
  );
  const notificationId = insert.rows[0].id;

  if (!apiKey || !from) {
    console.warn(
      '[auction/email] skipped send (missing RESEND_API_KEY or EMAIL_FROM)',
      { type: opts.type, to: opts.to, notificationId }
    );
    return { sent: false, notificationId, reason: 'email_not_configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[auction/email] provider error', res.status, body);
      return { sent: false, notificationId, reason: 'provider_error' };
    }

    await query(
      `UPDATE auction_notifications SET sent_at = now() WHERE id = $1`,
      [notificationId]
    );
    return { sent: true, notificationId };
  } catch (err) {
    console.error('[auction/email] send failed', err);
    return { sent: false, notificationId, reason: 'send_failed' };
  }
}

/**
 * Dev-friendly: include OTP in response when email not configured or NODE_ENV=development.
 */
export function shouldExposeDevOtp() {
  if (process.env.AUCTION_DEV_OTP === '1') return true;
  if (!getEmailApiKey()) return true;
  return process.env.NODE_ENV !== 'production';
}

export function artworkUrl(artworkId) {
  return `${getSiteUrl()}/auction/artwork/?id=${encodeURIComponent(artworkId)}`;
}
