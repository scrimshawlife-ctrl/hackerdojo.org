/**
 * GET /api/auction/artworks/:id
 * Public artwork detail + recent bids.
 */

import { getPublicArtworkDetail } from '../../../lib/auction/artworks.js';
import { json, withHandler } from '../../../lib/auction/http.js';

export default withHandler(async function artworkDetail(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.end();
  }

  const id =
    req.query?.id ||
    (req.url && req.url.match(/\/artworks\/([^/?#]+)/)?.[1]) ||
    null;

  if (!id) {
    res.statusCode = 400;
    return json(res, 400, {
      error: { code: 'VALIDATION_ERROR', message: 'Missing artwork id' },
    });
  }

  const payload = await getPublicArtworkDetail(decodeURIComponent(String(id)));
  return json(res, 200, payload);
}, { methods: ['GET', 'OPTIONS'] });
