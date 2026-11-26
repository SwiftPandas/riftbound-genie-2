// Riftbound Genie offline cache. Online: the newest file from the web (saved for offline); offline or slow (3 s): the saved copy.
const C = 'riftgenie-pub-6be93a94d1', FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "decks.json", "meta.json", "common.json", "engine.js", "judge.js", "library.json", "legends.json", "rules.txt", "calib.json", "kw.json", "might.json", "domains.json", "cards_official.json", "cards.txt", "faq.json"];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(C).then(async c => {
    const net = fetch(e.request, {cache: 'no-cache'}).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    const slow = new Promise(res => setTimeout(() => res(null), 3000));
    const first = await Promise.race([net, slow]);
    if (first) return first;
    const hit = await c.match(e.request, {ignoreSearch: true});
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', {status: 503});
  }));
});
