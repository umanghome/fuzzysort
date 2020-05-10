export function createCache () {
  return {
    prepared: new Map(),
  };
}

export function clearCache (cache) {
  cache.prepared.clear();
}