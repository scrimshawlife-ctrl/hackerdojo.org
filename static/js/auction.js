/**
 * Auction Space client helpers — gallery, detail, countdown.
 * Configure API base with: window.HD_AUCTION_API = 'https://your-api.vercel.app'
 * (empty = same origin)
 */
(function () {
  'use strict';

  function apiBase() {
    if (typeof window.HD_AUCTION_API === 'string' && window.HD_AUCTION_API) {
      return window.HD_AUCTION_API.replace(/\/$/, '');
    }
    return '';
  }

  function apiUrl(path) {
    return apiBase() + path;
  }

  async function fetchJson(path) {
    const res = await fetch(apiUrl(path), {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(function () {
      return null;
    });
    if (!res.ok) {
      var msg =
        (data && data.error && data.error.message) ||
        'Request failed (' + res.status + ')';
      var err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  function formatMoney(value) {
    if (value == null || value === '') return '—';
    var n = Number(value);
    if (!isFinite(n)) return String(value);
    return (
      '$' +
      n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatCountdown(endsAt) {
    var end = new Date(endsAt).getTime();
    if (!isFinite(end)) return { text: '—', ended: true };
    var ms = end - Date.now();
    if (ms <= 0) return { text: 'Ended', ended: true };
    var totalSec = Math.floor(ms / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    var pad = function (n) {
      return n < 10 ? '0' + n : String(n);
    };
    if (days > 0) {
      return {
        text: days + 'd ' + pad(hours) + 'h ' + pad(mins) + 'm',
        ended: false,
      };
    }
    return {
      text: pad(hours) + ':' + pad(mins) + ':' + pad(secs),
      ended: false,
    };
  }

  function bindCountdowns(root) {
    var nodes = (root || document).querySelectorAll('[data-ends-at]');
    function tick() {
      nodes.forEach(function (el) {
        var c = formatCountdown(el.getAttribute('data-ends-at'));
        el.textContent = c.text;
        if (c.ended) el.classList.add('is-ended');
        else el.classList.remove('is-ended');
      });
    }
    tick();
    if (nodes.length) setInterval(tick, 1000);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardHtml(art) {
    var bidLabel =
      art.current_bid != null
        ? 'Current ' + formatMoney(art.current_bid)
        : 'Starting ' + formatMoney(art.starting_bid);
    var img = art.primary_image
      ? '<img class="auction-card-image" src="' +
        escapeHtml(art.primary_image) +
        '" alt="' +
        escapeHtml(art.title) +
        '" loading="lazy" />'
      : '<div class="auction-card-image-placeholder">No image</div>';
    var href = '/auction/artwork/?id=' + encodeURIComponent(art.id);
    return (
      '<article class="auction-card">' +
      '<a class="auction-card-link" href="' +
      href +
      '">' +
      img +
      '<div class="auction-card-body">' +
      '<div class="auction-card-title">' +
      escapeHtml(art.title) +
      '</div>' +
      '<div class="auction-card-artist">' +
      escapeHtml(art.artist) +
      '</div>' +
      '<div class="auction-card-meta">' +
      '<div><strong>' +
      bidLabel +
      '</strong></div>' +
      '<div>Ends in <span class="auction-countdown" data-ends-at="' +
      escapeHtml(art.ends_at) +
      '">…</span></div>' +
      '</div></div></a></article>'
    );
  }

  async function mountGallery(el) {
    el.innerHTML = '<div class="auction-loading">Loading lots…</div>';
    try {
      // Show active + preview + recently closed for a fuller gallery
      var data = await fetchJson('/api/auction/artworks?status=all_public&limit=50');
      var list = (data && data.artworks) || [];
      if (!list.length) {
        el.innerHTML =
          '<div class="auction-empty">No auction lots are live yet. Check back soon.</div>';
        return;
      }
      el.innerHTML =
        '<div class="auction-grid">' + list.map(cardHtml).join('') + '</div>';
      bindCountdowns(el);
    } catch (err) {
      el.innerHTML =
        '<div class="auction-error">Could not load auction lots. ' +
        escapeHtml(err.message || 'Try again later.') +
        '</div>';
    }
  }

  function statusPill(status) {
    var cls = 'auction-status-pill';
    if (status === 'closed' || status === 'preview') cls += ' is-' + status;
    return (
      '<span class="' +
      cls +
      '">' +
      escapeHtml(status || 'unknown') +
      '</span>'
    );
  }

  function relativeTime(iso) {
    var t = new Date(iso).getTime();
    if (!isFinite(t)) return '';
    var sec = Math.round((Date.now() - t) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    return Math.floor(sec / 86400) + 'd ago';
  }

  async function mountDetail(el, id) {
    el.innerHTML = '<div class="auction-loading">Loading artwork…</div>';
    try {
      var data = await fetchJson(
        '/api/auction/artworks/' + encodeURIComponent(id)
      );
      var art = data.artwork;
      var bids = data.bids || [];
      var img = art.images && art.images[0]
        ? '<img class="auction-detail-image" src="' +
          escapeHtml(art.images[0]) +
          '" alt="' +
          escapeHtml(art.title) +
          '" />'
        : '<div class="auction-card-image-placeholder" style="aspect-ratio:4/3">No image</div>';

      var current =
        art.current_bid != null
          ? formatMoney(art.current_bid)
          : formatMoney(art.starting_bid);
      var currentLabel = art.current_bid != null ? 'Current bid' : 'Starting bid';

      var bidRows =
        bids.length === 0
          ? '<p class="auction-bids-empty">No bids yet — be the first when bidding opens.</p>'
          : '<ul class="auction-bids-list">' +
            bids
              .map(function (b) {
                return (
                  '<li><span><strong>' +
                  formatMoney(b.amount) +
                  '</strong> · ' +
                  escapeHtml(b.bidder_display || 'Bidder') +
                  '</span><span>' +
                  escapeHtml(relativeTime(b.created_at)) +
                  '</span></li>'
                );
              })
              .join('') +
            '</ul>';

      var canBid = art.status === 'active' && new Date(art.ends_at) > new Date();
      var ctaClass = 'button button-red auction-bid-cta' + (canBid ? '' : '');
      // Slice 1: CTA visible but not interactive (Slice 2 enables bidding)
      var cta =
        '<button type="button" class="' +
        ctaClass +
        '" disabled title="Bidding opens in the next release">' +
        (canBid ? 'Place bid (coming soon)' : 'Bidding closed') +
        '</button>' +
        '<p class="auction-note">Login and bidding land in the next auction slice. Countdown and prices refresh on reload.</p>';

      el.innerHTML =
        '<a class="auction-back" href="/auction/">← All lots</a>' +
        '<div class="auction-detail">' +
        '<div class="auction-detail-image-wrap">' +
        img +
        '</div>' +
        '<div class="auction-detail-info">' +
        statusPill(art.status) +
        '<h1>' +
        escapeHtml(art.title) +
        '</h1>' +
        '<div class="auction-detail-artist">' +
        escapeHtml(art.artist) +
        '</div>' +
        '<div class="auction-price-block">' +
        '<div class="auction-price-row"><span class="label">' +
        currentLabel +
        '</span><span class="value accent">' +
        current +
        '</span></div>' +
        '<div class="auction-price-row"><span class="label">Minimum next bid</span><span class="value">' +
        formatMoney(art.minimum_next_bid) +
        '</span></div>' +
        '<div class="auction-price-row"><span class="label">Ends in</span><span class="value auction-countdown" data-ends-at="' +
        escapeHtml(art.ends_at) +
        '">…</span></div>' +
        '</div>' +
        '<div class="auction-description">' +
        escapeHtml(art.description || '') +
        '</div>' +
        cta +
        '<div class="auction-bids" style="margin-top:28px"><h2>Recent bids</h2>' +
        bidRows +
        '</div>' +
        '</div></div>';

      bindCountdowns(el);
    } catch (err) {
      el.innerHTML =
        '<a class="auction-back" href="/auction/">← All lots</a>' +
        '<div class="auction-error">' +
        escapeHtml(err.message || 'Artwork not found') +
        '</div>';
    }
  }

  function init() {
    var gallery = document.getElementById('auction-gallery');
    if (gallery) mountGallery(gallery);

    var detail = document.getElementById('auction-detail');
    if (detail) {
      var params = new URLSearchParams(window.location.search);
      var id = params.get('id') || detail.getAttribute('data-artwork-id');
      if (id) mountDetail(detail, id);
      else {
        detail.innerHTML =
          '<div class="auction-error">Missing artwork id. <a href="/auction/">Back to gallery</a></div>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HDAuction = {
    fetchJson: fetchJson,
    formatMoney: formatMoney,
    formatCountdown: formatCountdown,
    bindCountdowns: bindCountdowns,
  };
})();
