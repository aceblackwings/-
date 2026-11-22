import assert from 'node:assert/strict';
import { cleanHitLabel, readSource, shouldHit } from '../js/hit.js';
import worker, { handleHit } from '../../worker/index.js';

const url = (search = '') => new URL('https://12jisin.ockstar.com/' + search);
assert.deepEqual(readSource(url('?utm_source=news&utm_campaign=launch'), 'https://blog.tistory.com/12'), { src: 'news', c: 'launch' });
assert.deepEqual(readSource(url('?utm_source=tistory&utm_campaign=tistory_8weeks&utm_content=post_12')), { src: 'tistory', c: 'post_12' });
assert.deepEqual(readSource(url('?utm_campaign=2027-rabbit'), 'https://blog.tistory.com/12'), { src: 'tistory', c: '2027-rabbit' });
assert.deepEqual(readSource(url(), 'https://eviltistory.com/'), { src: 'other', c: '' });
assert.deepEqual(readSource(url()), { src: 'direct', c: '' });
assert.equal(cleanHitLabel('좋은@tag'), '');
assert.equal(cleanHitLabel('좋은 slug!_' + 'x'.repeat(60)), 'slug_' + 'x'.repeat(35));
assert.equal(cleanHitLabel('post-1990-01-01'), '');
assert.equal(cleanHitLabel('127.0.0.1'), '');

assert.equal(shouldHit('land', url(), false, []), true);
assert.equal(shouldHit('land', url(), true, []), false);
assert.equal(shouldHit('land', url('?gallery=1'), false, []), false);
assert.equal(shouldHit('land', new URL('http://localhost:8000'), false, []), false);
assert.equal(shouldHit('land', url(), false, ['land']), false);

const points = [];
const env = { HITS: { writeDataPoint: point => points.push(point) } };
const request = (body, origin = url().origin) => new Request(new URL('/api/hit', url()), {
  method: 'POST', headers: { Origin: origin }, body: JSON.stringify(body),
});
for (const e of ['land', 'saju', 'summon']) {
  const response = await worker.fetch(request({ e, src: 'tistory', c: 'post_13', name: 'ignored' }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(await response.text(), '');
}
assert.deepEqual(points, ['land', 'saju', 'summon'].map(e => ({ blobs: [e, 'tistory', 'post_13'], indexes: [e] })));
assert.equal((await handleHit(request({ e: 'unknown' }), env)).status, 400);
assert.equal((await handleHit(request(null), env)).status, 400);
assert.equal((await handleHit(request({ e: 'land' }, 'https://other.example'), env)).status, 403);
assert.equal((await handleHit(new Request(new URL('/api/hit', url())), env)).status, 405);
assert.equal(points.length, 3);
assert.equal((await handleHit(request({ e: 'land', src: '19900101', c: '1990-01-01' }), env)).status, 204);
assert.deepEqual(points.at(-1), { blobs: ['land', 'other', ''], indexes: ['land'] });
assert.equal((await handleHit(request({ e: 'land' }), {})).status, 204);
console.log('Tistory analytics tests passed');
