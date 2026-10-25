// Writes dist/sw.js after the build. It precaches every built file so the whole check
// (screens, rules, fonts, icons and any audio clips) works with no network after one visit.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist).map((f) => path.relative(dist, f).split(path.sep).join('/')).filter((f) => f !== 'sw.js').sort();
const hash = crypto.createHash('sha1');
for (const f of files) hash.update(f).update(fs.readFileSync(path.join(dist, f)));
const version = `maitri-${hash.digest('hex').slice(0, 10)}`;
const urls = ['./', ...files.map((f) => `./${f}`)];

fs.writeFileSync(path.join(dist, 'sw.js'), `const VERSION = ${JSON.stringify(version)};
const URLS = ${JSON.stringify(urls)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(URLS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html', { ignoreVary: true }) : null) || fetch(req)),
  );
});
`);
console.log(`sw.js: ${urls.length} files, ${version}`);
