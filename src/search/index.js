// @ts-check
import { prepareSearch, getPrepared } from '../internals/prepare';
import { getOptions } from '../internals/defaults';
import { getValue, isObj } from '../internals/utils';
import fastpriorityqueue from '../internals/fastpriorityqueue';

const noResults = {
  results: [],
  total: 0,
};

export default function go(search, targets, options) {
  if (!search) {
    return noResults;
  }

  search = prepareSearch(search);

  var searchLowerCode = search[0];

  let { scoreFn, threshold, limit, algorithm } = getOptions(options);
  
  var resultsLen = 0;
  var limitedCount = 0;
  var targetsLen = targets.length;

  var q = fastpriorityqueue();

  // options.keys
  var keys = options.keys;
  var keysLen = keys.length;

  for (var i = targetsLen - 1; i >= 0; --i) {
    var obj = targets[i];
    // var objResults = new Array(keysLen);
    var objResults = {
      length: keysLen,
    };

    for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
      var key = keys[keyI];
      var target = getValue(obj, key);

      if (!target) {
        objResults[keyI] = null;
        continue;
      }

      if (!isObj(target)) {
        target = getPrepared(target);
      }

      objResults[keyI] = algorithm(search, target, searchLowerCode);
    }

    objResults.obj = obj; // before scoreFn so scoreFn can use it
    var score = scoreFn(objResults);
    if (score === null) continue;
    if (score < threshold) continue;
    objResults.score = score;
    if (resultsLen < limit) {
      q.add(objResults);
      ++resultsLen;
    } else {
      ++limitedCount;
      if (score > q.peek().score) q.replaceTop(objResults);
    }
  }

  if (resultsLen === 0) return noResults;
  var results = new Array(resultsLen);
  for (var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll();

  console.log(results);

  return {
    results,
    total: resultsLen + limitedCount,
  };
}