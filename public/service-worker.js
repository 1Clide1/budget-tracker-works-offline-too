// grab the files to cache
const FILES_TO_CACHE = [
  // adding / and index.html just incase that way it's definetly going to be added
  "/",
  "/index.html",
  "/css/styles.css",
  "/manifest.json",
  "/js/index.js",
  "/idb.js",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];
// cache keys
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// install the service worker
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("files were pre-cached!!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activate the service worker and remove any old cached files
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("removed the old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// intercept fetch requests from the api
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  // if the cache does not include an api, this is a must have if there is no api at all
  evt.respondWith(
    fetch(evt.request).catch(function () {
      return caches.match(evt.request).then(function (response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});
