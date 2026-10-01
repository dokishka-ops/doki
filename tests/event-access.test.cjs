const assert = require('node:assert/strict');
const test = require('node:test');
const handler = require('../api/event-comic.js');
const start = Date.parse('2026-10-04T22:10:00+09:00');
const end = Date.parse('2026-10-06T22:10:00+09:00');

test('server time gates metadata and direct image requests at both boundaries', async () => {
  const originalNow = Date.now;
  const originalFetch = global.fetch;
  const keys = ['EVENT_COMIC_PAGES', 'EVENT_COMIC_BLOB_BASE', 'BLOB_READ_WRITE_TOKEN'];
  const old = keys.map(k => process.env[k]);
  process.env.EVENT_COMIC_PAGES = JSON.stringify([{ pathname: 'hanataba15/page-001.webp' }]);
  process.env.EVENT_COMIC_BLOB_BASE = 'https://example.private.blob.vercel-storage.com/';
  process.env.BLOB_READ_WRITE_TOKEN = 'test-only-not-a-real-token';
  let fetches = 0;
  global.fetch = async (url, options) => {
    fetches++;
    assert.equal(url.hostname, 'example.private.blob.vercel-storage.com');
    assert.equal(options.redirect, 'error');
    return new Response(Buffer.from('test image'), { headers: { 'Content-Type': 'image/webp' } });
  };
  async function call(time, page) {
    Date.now = () => time;
    const response = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; }, end() { return this; } };
    await handler({ method: 'GET', query: page === undefined ? {} : { page } }, response);
    assert.equal(response.headers['Cache-Control'], 'private, no-store, max-age=0');
    return response;
  }
  try {
    assert.equal((await call(start - 1)).body.state, 'before');
    assert.equal((await call(start - 1, '1')).statusCode, 403);
    assert.equal(fetches, 0);
    const opened = await call(start);
    assert.equal(opened.body.ready, true);
    assert.equal(opened.body.pages.length, 1);
    assert.ok(!JSON.stringify(opened.body).includes('private.blob'));
    assert.equal((await call(start, '1')).statusCode, 200);
    assert.equal((await call(end - 1, '1')).statusCode, 200);
    assert.equal((await call(end)).body.state, 'after');
    assert.equal((await call(end, '1')).statusCode, 403);
    assert.equal(fetches, 2);
    assert.equal((await call(start, '../secret')).statusCode, 404);
    delete process.env.BLOB_READ_WRITE_TOKEN;
    assert.equal((await call(start)).body.ready, false);
    assert.equal((await call(start, '1')).statusCode, 404);
    assert.equal(fetches, 2);
  } finally {
    Date.now = originalNow;
    global.fetch = originalFetch;
    keys.forEach((k, i) => { if (old[i] === undefined) delete process.env[k]; else process.env[k] = old[i]; });
  }
});
