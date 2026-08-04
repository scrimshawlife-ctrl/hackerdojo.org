/**
 * GET /api/auction/artworks
 * Public list of auction lots.
 *
 * Query: status=active|preview|closed|all_public (default active)
 *        limit, offset
 */

import { listPublicArtworks } from '../../lib/auction/artworks.js';
import { json, withHandler } from '../../lib/auction/http.js';
import { apiError, ErrorCodes } from '../../lib/auction/errors.js';

export default withHandler(async function artworksList(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.end();
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const status = url.searchParams.get('status') || 'active';
  const limit = url.searchParams.get('limit');
  const offset = url.searchParams.get('offset');

  if (status && !['active', 'preview', 'closed', 'all_public'].includes(status)) {
    throw apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid status filter');
  }

  const artworks = await listPublicArtworks({
    status,
    limit: limit ? Number(limit) : 50,
    offset: offset ? Number(offset) : 0,
  });

  return json(res, 200, { artworks });
}, { methods: ['GET', 'OPTIONS'] });
