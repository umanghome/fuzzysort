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

  search = prepareSearch(search);

  var searchLowerCode = search[0];

  let { scoreFn, threshold, limit, algorithm, cache } = getOptions(options);
  
  var resultsCount = 0;
  var limitedCount = 0;
  var targetsLen = targets.length;

  var q = fastpriorityqueue();

  // options.keys
  var keys = options.keys;
  var keysLen = keys.length;

  for (var i = targetsLen - 1; i >= 0; --i) {
    var obj = targets[i];
    var matches = [];
    var result = {
      obj,
    };

    for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
      var key = keys[keyI];
      var target = getValue(obj, key);

      matches[keyI] = null;

      if (!target) {
        continue;
      }

      if (!isObject(target)) {
        target = getPrepared(target, cache);
      }

      matches[keyI] = algorithm(search, target, searchLowerCode);
    }

    var score = scoreFn(matches);

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

  var results = [];

  for (var i = resultsCount - 1; i >= 0; --i) {
    results[i] = q.poll();
  }

  return {
    results,
    total: resultsCount + limitedCount,
  };
}