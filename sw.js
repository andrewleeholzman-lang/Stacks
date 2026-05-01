// The Stacks — Service Worker
// Caches the app shell for offline launch; all API calls go to network.

const CACHE_NAME = 'stacks-v1';
const SHELL = [
  '/index.html',
  '/manifest.json'
];

// Domains that should always go straight to network (APIs, feeds, fonts)
const NETWORK_ONLY = [
  'wikipedia.org',
  'eutils.ncbi.nlm.nih.gov',
  'corsproxy.io',
  'allorigins.win',
  'aeon.co',
  'jstor.org',
  'theconversation.com',
  'bellingcat.com',
  'lareviewofbooks.org',
  'historytoday.com',
  'publicdomainreview.org',
  'the-tls.co.uk',
  'ndpr.nd.edu',
  'churchlifejournal.nd.edu',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'api.anthropic.com'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-only for all external API and feed requests
  if (NETWORK_ONLY.some(d => url.hostname.includes(d))) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
