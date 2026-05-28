/**
 * ContributorsCache — session-memoized fetch of contributors.json from
 * the treasury-cache CDN. Provides the full list of all DAO contributors
 * (including those without public keys) for use in recipient/contributor
 * dropdowns, avoiding the slow GAS ?recipients=true endpoint.
 *
 * Source: https://raw.githubusercontent.com/TrueSightDAO/treasury-cache/main/contributors.json
 * Published by the treasury-cache-publisher GAS project on every inventory
 * movement + 30-min safety-net cron.
 *
 * Exposes:
 *   window.ContributorsCache.fetch()
 *       → Promise<Array<{key: string, name: string}>>
 *   window.ContributorsCache.invalidate()
 *       → drops the memoized promise; next call refetches.
 */
(function (global) {
  var DEFAULT_URL =
      'https://raw.githubusercontent.com/TrueSightDAO/treasury-cache/main/contributors.json';

  var cachedPromise = null;
  var cachedUrl = null;

  function resolveUrl() {
    return (global.Routes && global.Routes.contributorsCache) || DEFAULT_URL;
  }

  function fetch() {
    var url = resolveUrl();
    if (cachedPromise && cachedUrl === url) return cachedPromise;
    cachedUrl = url;
    cachedPromise = global.fetch(url, { cache: 'no-cache' }).then(function (resp) {
      if (!resp.ok) {
        cachedPromise = null;
        throw new Error('contributors.json HTTP ' + resp.status);
      }
      return resp.json();
    }).catch(function (err) {
      cachedPromise = null;
      throw err;
    });
    return cachedPromise;
  }

  function invalidate() {
    cachedPromise = null;
    cachedUrl = null;
  }

  global.ContributorsCache = {
    DEFAULT_URL: DEFAULT_URL,
    fetch: fetch,
    invalidate: invalidate
  };
})(window);
