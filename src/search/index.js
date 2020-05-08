// @ts-check
import { prepareSearch, getPrepared } from '../internals/prepare';
import { getOptions } from '../internals/defaults';
import { getValue, isObject } from '../internals/utils';
import fastpriorityqueue from '../internals/fastpriorityqueue';

const NO_RESULTS = {
  results: [],
  total: 0,
};

export default function go(search, targets, options) {
  if (!search) {
    return NO_RESULTS;
  }

  const { scoreFn, threshold, limit, algorithm, cache, keys } = getOptions(options);
  const q = fastpriorityqueue();

  search = prepareSearch(search);

  const searchLowerCode = search[0];
  
  let resultsCount = 0;
  let limitedCount = 0;

  for (let i = targets.length - 1; i >= 0; --i) {
    const obj = targets[i];

    let matches = [];
    let result = {
      obj,
    };

    for (let keyI = keys.length - 1; keyI >= 0; --keyI) {
      const key = keys[keyI];
      let target = getValue(obj, key);

      matches[keyI] = null;

      if (!target) {
        continue;
      }

      if (!isObject(target)) {
        target = getPrepared(target, cache);
      }

      matches[keyI] = algorithm(search, target, searchLowerCode);
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