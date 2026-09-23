/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "ee6d3025ef3393ea9e9be1ae35940d9c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "a26e61e71b66dd0f98a7453df43bf738"
  }, {
    "url": "pwa-192x192.png",
    "revision": "618f6f0f70645cc6b7557aff3f64de79"
  }, {
    "url": "maskable-icon.svg",
    "revision": "f2af7767844038cead7d3035735c142b"
  }, {
    "url": "index.html",
    "revision": "0db787492dd9a69465ef51622c0f41f2"
  }, {
    "url": "icon.svg",
    "revision": "eaff60985b87368dfc01e8efd73af3c9"
  }, {
    "url": "favicon-32x32.png",
    "revision": "3834b3606ed9056a61d76cc02da8e84b"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "49347adc5bc5a2ec79dc839b3a0de500"
  }, {
    "url": "assets/index-BtE-LMQF.css",
    "revision": null
  }, {
    "url": "assets/index-B1JTY1rL.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "49347adc5bc5a2ec79dc839b3a0de500"
  }, {
    "url": "favicon-32x32.png",
    "revision": "3834b3606ed9056a61d76cc02da8e84b"
  }, {
    "url": "icon.svg",
    "revision": "eaff60985b87368dfc01e8efd73af3c9"
  }, {
    "url": "maskable-icon.svg",
    "revision": "f2af7767844038cead7d3035735c142b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "618f6f0f70645cc6b7557aff3f64de79"
  }, {
    "url": "pwa-512x512.png",
    "revision": "a26e61e71b66dd0f98a7453df43bf738"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "ee6d3025ef3393ea9e9be1ae35940d9c"
  }, {
    "url": "manifest.webmanifest",
    "revision": "02e1e7214c727c99fdb6dfa83ad958dd"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 15,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "unsplash-avatars-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));
