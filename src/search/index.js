// @ts-check
import { prepareSearch, getPrepared } from '../internals/prepare';
import { getOptions } from '../internals/defaults';
import { getValue, isObject } from '../internals/utils';
import fastpriorityqueue from '../internals/fastpriorityqueue';

const NO_RESULTS = {
  results: [],
  total: 0,
};

function scoreFn(a) {
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

export default function search(term, targets, keys, options) {
  if (!term) {
    return NO_RESULTS;
  }

  const { threshold, limit, algorithm, cache } = getOptions(options);

  if (typeof algorithm !== 'function') {
    throw new Error('`algorithm` should be a function');
  }

  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error('`keys` should be an array with at least one item');
  }

  const q = fastpriorityqueue();

  term = prepareSearch(term);

  const searchLowerCode = term[0];
  
  let resultsCount = 0;
  let limitedCount = 0;

  for (let i = targets.length - 1; i >= 0; --i) {
    const ref = targets[i];

    let matches = [];
    let result = {
      ref,
      meta: {},
    };

    for (let keyI = keys.length - 1; keyI >= 0; --keyI) {
      const key = keys[keyI];
      let target = getValue(ref, key);

      matches[keyI] = null;

      if (!target) {
        continue;
      }

      if (!isObject(target)) {
        target = getPrepared(target, cache.cache);
      }

      matches[keyI] = algorithm(term, target, searchLowerCode);

      result.meta[key] = {
        indices: target.indexes,
        score: target.score,
        target: target.target,
      };
    }

    const score = scoreFn(matches);

    if (score === null) {
      continue;
    }
    
    if (score < threshold) {
      continue;
    }

    result.score = score;

    if (resultsCount < limit) {
      q.add(result);

      resultsCount++;
    } else {
      limitedCount++;

      if (score > q.peek().score) {
        q.replaceTop(result);
      }
    }

  }

  if (resultsCount === 0) {
    return NO_RESULTS;
  }

  let results = [];

  for (let i = resultsCount - 1; i >= 0; --i) {
    results[i] = q.poll();
  }

  return {
    results,
    total: resultsCount + limitedCount,
  };
}