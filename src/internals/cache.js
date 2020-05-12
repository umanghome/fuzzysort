export function createCache () {
  return {
    cache: {
      prepared: new Map(),
    },
    clear: function () {
      this.cache.prepared.clear();
    }
  };
}
