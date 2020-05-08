import { createCache } from "./cache";

function scoreFn (a) {
  let max = -9007199254740991;

  for (let i = a.length - 1; i >= 0; --i) {
    const result = a[i];

    if (result === null) {
      continue;
    }

    const score = result.score;

    if (score > max) {
      max = score;
    }
  }

  if (max === -9007199254740991) {
    return null;
  }

  return max;
}

const options = {
  threshold: -9007199254740991,
  limit: 9007199254740991, // Number.MAX_SAFE_INTEGER?

  scoreFn: scoreFn,

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