const START = Date.parse('2026-10-04T22:10:00+09:00');
const END = Date.parse('2026-10-06T22:10:00+09:00');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const now = Date.now();
  const state = now < START ? 'before' : now >= END ? 'after' : 'open';
  const page = req.query.page;
  if (page !== undefined && state !== 'open') return res.status(403).json({ state });
  // Comic files belong in private Blob storage, never in this public repository.
  let manifest = [];
  try { manifest = JSON.parse(process.env.EVENT_COMIC_PAGES || '[]'); } catch { /* fail closed */ }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  let base;
  try { base = new URL(process.env.EVENT_COMIC_BLOB_BASE); } catch { /* fail closed */ }
  const ready = Boolean(token && base && base.protocol === 'https:' && /^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/.test(base.hostname) && Array.isArray(manifest) && manifest.length > 0 && manifest.every(p => typeof p.pathname === 'string' && /^hanataba15\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(p.pathname)));
  if (page === undefined) return res.status(200).json({ state, ready: state === 'open' && ready, remainingMs: state === 'open' ? END - now : 0, pages: state === 'open' && ready ? manifest.map((p, i) => ({ number: i + 1, width: p.width, height: p.height })) : [] });
  if (typeof page !== 'string' || !/^[1-9]\d*$/.test(page) || !ready || Number(page) > manifest.length) return res.status(404).end();
  try {
    const url = new URL(manifest[Number(page) - 1].pathname, base.origin + '/');
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(20000) });
    const contentType = (upstream.headers.get('content-type') || '').split(';')[0];
    if (!upstream.ok || !['image/png', 'image/jpeg', 'image/webp'].includes(contentType)) return res.status(502).end();
    const image = Buffer.from(await upstream.arrayBuffer());
    // Recheck after the fetch so a slow request cannot begin delivery after closing.
    if (Date.now() >= END) return res.status(403).json({ state: 'after' });
    res.setHeader('Content-Type', contentType);
    return res.status(200).send(image);
  } catch { return res.status(503).end(); }
};
