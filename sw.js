const CACHE = "pets-world-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/index.html","/home.html","/login.html","/manifest.json","/icon.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => { e.waitUntil(clients.claim()); });
self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
