const CACHE = "aesthetic-v1"
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([".", "index.html", "css/style.css", "js/app.js", "js/data.json", "js/store.js"])))
  self.skipWaiting()
})
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok && e.request.url.includes("data.json")) {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }))
  )
})