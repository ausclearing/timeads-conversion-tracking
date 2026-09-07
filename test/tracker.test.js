import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = readFileSync(new URL('../build/conversion-tracking.iife.js', import.meta.url), 'utf8');
function browser({ search = '?ta_clickid=opaque-token', storageBlocked = false, fetchError = false, status = 200, module = false } = {}) {
  const stored = new Map(), requests = [], events = [];
  const context = {
    URL, URLSearchParams, TextEncoder, CustomEvent: class { constructor(type) { this.type = type; } },
    document: { currentScript: module ? null : { src: 'https://tracking.example/t.js', hasAttribute: () => false }, dispatchEvent: e => events.push(e.type) },
    location: { search },
    localStorage: {
      getItem: key => { if (storageBlocked) throw Error('blocked'); return stored.get(key) ?? null; },
      setItem: (key, value) => { if (storageBlocked) throw Error('blocked'); stored.set(key, value); },
    },
    fetch: async (url, options) => { requests.push({ url, ...JSON.parse(options.body) }); if (fetchError) throw Error('offline'); return { ok: status >= 200 && status < 300, status }; },
  };
  context.window = context;
  vm.runInNewContext(source, context);
  return { api: context.TimeAdsTracking, requests, events, context, stored };
}

test('captures once automatically, persists token, sends decimal strings and custom events', async () => {
  const { api, requests, events } = browser();
  assert.equal(await api.land(), true);
  assert.equal(api.token(), 'opaque-token');
  assert.deepEqual(events, ['timeads:ready']);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://tracking.example/track');
  assert.equal(requests[0].click_id, 'opaque-token');
  await api.track('order-1', { event: 'purchase', value: '18.570001', tags: ['sale'] });
  assert.equal(requests[1].value, '18.570001');
  await api.track('custom-1', { event: 'level_completed' });
  assert.equal(requests[2].event, 'custom');
  assert.equal(requests[2].event_custom, 'level_completed');
  assert.equal(requests[2].session_id, undefined);
});

test('stored token works on subsequent pages; a new click replaces attribution', async () => {
  const { api, context, requests } = browser();
  await api.land();
  context.location.search = '';
  assert.equal(await api.land(), false);
  assert.equal(await api.track('signup-1', { event: 'signup' }), true);
  context.location.search = '?ta_clickid=second-token';
  await api.land();
  assert.equal(api.token(), 'second-token');
  assert.equal(requests.at(-1).click_id, 'second-token');
});

test('old parameter and unavailable storage produce no hits', async () => {
  for (const opts of [{ search: '?thurin=old' }, { storageBlocked: true }, { search: '' }]) {
    const { api, requests } = browser(opts);
    assert.equal(await api.land(), false);
    assert.equal(await api.track('x', { event: 'signup' }), false);
    assert.equal(requests.length, 0);
  }
});

test('rejects invalid requests and browser corrections', async () => {
  const { api, requests } = browser();
  await api.land();
  for (const [id, options] of [
    ['', { event: 'signup' }], [' '.repeat(2), { event: 'signup' }], ['x'.repeat(81), { event: 'signup' }],
    ['é'.repeat(41), { event: 'signup' }], ['x', { event: 'z'.repeat(101) }], ['x', { event: 'signup', tags: ['é'.repeat(26)] }],
    ['x', null], ['x', {}], ['x', { event: 'update', value: 20 }], ['x', { event: 'custom' }],
    ['x', { event: 'purchase' }], ['x', { event: 'purchase', value: 0 }],
    ...[-1, Infinity, NaN, '', {}, true, 100001].map(value => ['x', { event: 'purchase', value }]),
    ...[['a', 'b', 'c', 'd'], [1], ['x'.repeat(51)], 'a'].map(tags => ['x', { event: 'signup', tags }]),
  ]) assert.equal(await api.track(id, options), false);
  assert.equal(requests.length, 1);
  assert.equal(await api.track('x'.repeat(80), { event: 'custom', event_custom: 'short', value: 0 }), true);
});

test('failed landings retry with the same transaction ID, duplicates succeed', async () => {
  for (const opts of [{ fetchError: true }, { status: 500 }]) {
    const { api, requests } = browser(opts);
    assert.equal(await api.land(), false);
    assert.equal(await api.land(), false);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].transaction_id, requests[1].transaction_id);
  }
  const { api, requests } = browser({ status: 409 });
  assert.equal(await api.land(), true);
  assert.equal(await api.land(), true);
  assert.equal(requests.length, 1);
});

test('module consumers configure endpoint before sending', async () => {
  const { api, requests } = browser({ module: true });
  await api.land();
  assert.equal(requests.length, 0);
  assert.throws(() => api.configure({ endpoint: 'http://example.com/track' }), /HTTPS/);
  await api.configure({ endpoint: 'https://api.example/track' });
  assert.equal(requests[0].url, 'https://api.example/track');
});
