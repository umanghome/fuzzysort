import { createCache } from "./cache";

const options = {
  threshold: -9007199254740991,
  limit: 9007199254740991, // Number.MAX_SAFE_INTEGER

  /**
   * Keys initialized as-needed
   * - cache
   */
};

export function getOptions (custom = {}) {
  const _options = {
    ...options,
    ...custom,
  };
  
  if (!_options.cache) {
    _options.cache = createCache();
  }

  return _options;
}