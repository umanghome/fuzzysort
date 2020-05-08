function prepareLowerCodes (str) {
  const strLen = str.length;
  const lower = str.toLowerCase();

  let lowerCodes = []; // new Array(strLen)    sparse array is too slow

  for (let i = 0; i < strLen; ++i) {
    lowerCodes[i] = lower.charCodeAt(i);
  }

  return lowerCodes;
}
function prepareBeginningIndexes(target) {
  const targetLen = target.length;

  let beginningIndexes = [];
  let beginningIndexesLen = 0;

  let wasUpper = false;
  let wasAlphanum = false;

  for (let i = 0; i < targetLen; ++i) {
    const targetCode = target.charCodeAt(i);
    const isUpper = targetCode >= 65 && targetCode <= 90;
    const isAlphanum =
      isUpper ||
      (targetCode >= 97 && targetCode <= 122) ||
      (targetCode >= 48 && targetCode <= 57);
    const isBeginning = (isUpper && !wasUpper) || !wasAlphanum || !isAlphanum;

    wasUpper = isUpper;
    wasAlphanum = isAlphanum;

    if (isBeginning) {
      beginningIndexes[beginningIndexesLen++] = i;
    }
  }

  return beginningIndexes;
}

function prepareNextBeginningIndexes(target) {
  const targetLen = target.length;
  
  const beginningIndexes = prepareBeginningIndexes(target);
  let nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow

  let lastIsBeginning = beginningIndexes[0];
  let lastIsBeginningI = 0;

  for (let i = 0; i < targetLen; ++i) {
    if (lastIsBeginning > i) {
      nextBeginningIndexes[i] = lastIsBeginning;
    } else {
      lastIsBeginning = beginningIndexes[++lastIsBeginningI];
      nextBeginningIndexes[i] =
        lastIsBeginning === undefined ? targetLen : lastIsBeginning;
    }
  }

  return nextBeginningIndexes;
}

function prepare(target) {
  if (!target) {
    return;
  }

  return {
    target: target,
    _targetLowerCodes: prepareLowerCodes(target),
    _nextBeginningIndexes: null,
    score: null,
    indexes: null,
    obj: null,
  }; // hidden
}

function prepareSearch(search) {
  if (!search) {
    return;
  }

  return prepareLowerCodes(search);
}

function getPrepared(target, cache) {
  const preparedCache = cache.prepared;

  if (target.length > 999) {
    return prepare(target); // don't cache huge targets
  }

  let targetPrepared = preparedCache.get(target);

  if (targetPrepared !== undefined) {
    return targetPrepared;
  }

  targetPrepared = prepare(target);

  preparedCache.set(target, targetPrepared);

  return targetPrepared;
}

function createCache () {
  return {
    prepared: new Map(),
  };
}

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

function getOptions (custom = {}) {
  const _options = {
    ...options,
    ...custom,
  };
  
  if (!_options.cache) {
    _options.cache = createCache();
  }

  return _options;
}

// prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
// prop = 'key1.key2'        10ms
// prop = ['key1', 'key2']   27ms
function getValue(obj, prop) {
  const tmp = obj[prop];
  
  if (tmp !== undefined) {
    return tmp;
  }

  let segs = prop;

  if (!Array.isArray(prop)) {
    segs = prop.split('.');
  }

  const len = segs.length;

  let i = -1;
  while (obj && ++i < len) {
    obj = obj[segs[i]];
  }
  
  return obj;
}

function isObject(x) {
  return typeof x === 'object';
}

// Hacked version of https://github.com/lemire/FastPriorityQueue.js
function fastpriorityqueue (){var r=[],o=0,e={};function n(){for(var e=0,n=r[e],c=1;c<o;){var f=c+1;e=c,f<o&&r[f].score<r[c].score&&(e=f),r[e-1>>1]=r[e],c=1+(e<<1);}for(var a=e-1>>1;e>0&&n.score<r[a].score;a=(e=a)-1>>1)r[e]=r[a];r[e]=n;}return e.add=function(e){var n=o;r[o++]=e;for(var c=n-1>>1;n>0&&e.score<r[c].score;c=(n=c)-1>>1)r[n]=r[c];r[n]=e;},e.poll=function(){if(0!==o){var e=r[0];return r[0]=r[--o],n(),e}},e.peek=function(e){if(0!==o)return r[0]},e.replaceTop=function(o){r[0]=o,n();},e}

// @ts-check

const NO_RESULTS = {
  results: [],
  total: 0,
};

function search(term, targets, options) {
  if (!term) {
    return NO_RESULTS;
  }

  const { scoreFn, threshold, limit, algorithm, cache, keys } = getOptions(options);
  const q = fastpriorityqueue();

  term = prepareSearch(term);

  const searchLowerCode = term[0];
  
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

      matches[keyI] = algorithm(term, target, searchLowerCode);
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

// @ts-check

function algorithmWithoutTypo (searchLowerCodes, prepared, searchLowerCode) {
  let matchesSimple = [];
  let matchesStrict = [];

  var targetLowerCodes = prepared._targetLowerCodes;
  var searchLen = searchLowerCodes.length;
  var targetLen = targetLowerCodes.length;
  var searchI = 0; // where we at
  var targetI = 0; // where you at
  var matchesSimpleLen = 0;

  // very basic fuzzy match; to remove non-matching targets ASAP!
  // walk through target. find sequential matches.
  // if all chars aren't found then exit
  for(;;) {
    var isMatch = searchLowerCode === targetLowerCodes[targetI];
    if(isMatch) {
      matchesSimple[matchesSimpleLen++] = targetI;
      ++searchI; if(searchI === searchLen) break
      searchLowerCode = searchLowerCodes[searchI];
    }
    ++targetI; if(targetI >= targetLen) return null // Failed to find searchI
  }

  var searchI = 0;
  var successStrict = false;
  var matchesStrictLen = 0;

  var nextBeginningIndexes = prepared._nextBeginningIndexes;
  if(nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target);
  var firstPossibleI = targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1];

  // Our target string successfully matched all characters in sequence!
  // Let's try a more advanced and strict test to improve the score
  // only count it as a match if it's consecutive or a beginning character!
  if(targetI !== targetLen) for(;;) {
    if(targetI >= targetLen) {
      // We failed to find a good spot for this search char, go back to the previous search char and force it forward
      if(searchI <= 0) break // We failed to push chars forward for a better match

      --searchI;
      var lastMatch = matchesStrict[--matchesStrictLen];
      targetI = nextBeginningIndexes[lastMatch];

    } else {
      var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
      if(isMatch) {
        matchesStrict[matchesStrictLen++] = targetI;
        ++searchI; if(searchI === searchLen) { successStrict = true; break }
        ++targetI;
      } else {
        targetI = nextBeginningIndexes[targetI];
      }
    }
  }

  { // tally up the score & keep track of matches for highlighting later
    if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen; }
    else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen; }
    var score = 0;
    var lastTargetI = -1;
    for(var i = 0; i < searchLen; ++i) { var targetI = matchesBest[i];
      // score only goes down if they're not consecutive
      if(lastTargetI !== targetI - 1) score -= targetI;
      lastTargetI = targetI;
    }
    if(!successStrict) score *= 1000;
    score -= targetLen - searchLen;
    prepared.score = score;
    prepared.indexes = new Array(matchesBestLen); for(var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i];

    return prepared
  }
}

// @ts-check

function algorithmWithTypo(searchLowerCodes, prepared, searchLowerCode) {
  let matchesSimple = [];
  let matchesStrict = [];

  var targetLowerCodes = prepared._targetLowerCodes;
  var searchLen = searchLowerCodes.length;
  var targetLen = targetLowerCodes.length;
  var searchI = 0; // where we at
  var targetI = 0; // where you at
  var typoSimpleI = 0;
  var matchesSimpleLen = 0;

  // very basic fuzzy match; to remove non-matching targets ASAP!
  // walk through target. find sequential matches.
  // if all chars aren't found then exit
  for (;;) {
    var isMatch = searchLowerCode === targetLowerCodes[targetI];
    if (isMatch) {
      matchesSimple[matchesSimpleLen++] = targetI;
      ++searchI;
      if (searchI === searchLen) break;
      searchLowerCode =
        searchLowerCodes[
          typoSimpleI === 0
            ? searchI
            : typoSimpleI === searchI
            ? searchI + 1
            : typoSimpleI === searchI - 1
            ? searchI - 1
            : searchI
        ];
    }

    ++targetI;
    if (targetI >= targetLen) {
      // Failed to find searchI
      // Check for typo or exit
      // we go as far as possible before trying to transpose
      // then we transpose backwards until we reach the beginning
      for (;;) {
        if (searchI <= 1) return null; // not allowed to transpose first char
        if (typoSimpleI === 0) {
          // we haven't tried to transpose yet
          --searchI;
          var searchLowerCodeNew = searchLowerCodes[searchI];
          if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
          typoSimpleI = searchI;
        } else {
          if (typoSimpleI === 1) return null; // reached the end of the line for transposing
          --typoSimpleI;
          searchI = typoSimpleI;
          searchLowerCode = searchLowerCodes[searchI + 1];
          var searchLowerCodeNew = searchLowerCodes[searchI];
          if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
        }
        matchesSimpleLen = searchI;
        targetI = matchesSimple[matchesSimpleLen - 1] + 1;
        break;
      }
    }
  }

  var searchI = 0;
  var typoStrictI = 0;
  var successStrict = false;
  var matchesStrictLen = 0;

  var nextBeginningIndexes = prepared._nextBeginningIndexes;
  if (nextBeginningIndexes === null)
    nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(
      prepared.target
    );
  var firstPossibleI = (targetI =
    matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1]);

  // Our target string successfully matched all characters in sequence!
  // Let's try a more advanced and strict test to improve the score
  // only count it as a match if it's consecutive or a beginning character!
  if (targetI !== targetLen)
    for (;;) {
      if (targetI >= targetLen) {
        // We failed to find a good spot for this search char, go back to the previous search char and force it forward
        if (searchI <= 0) {
          // We failed to push chars forward for a better match
          // transpose, starting from the beginning
          ++typoStrictI;
          if (typoStrictI > searchLen - 2) break;
          if (
            searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1]
          )
            continue; // doesn't make sense to transpose a repeat char
          targetI = firstPossibleI;
          continue;
        }

        --searchI;
        var lastMatch = matchesStrict[--matchesStrictLen];
        targetI = nextBeginningIndexes[lastMatch];
      } else {
        var isMatch =
          searchLowerCodes[
            typoStrictI === 0
              ? searchI
              : typoStrictI === searchI
              ? searchI + 1
              : typoStrictI === searchI - 1
              ? searchI - 1
              : searchI
          ] === targetLowerCodes[targetI];
        if (isMatch) {
          matchesStrict[matchesStrictLen++] = targetI;
          ++searchI;
          if (searchI === searchLen) {
            successStrict = true;
            break;
          }
          ++targetI;
        } else {
          targetI = nextBeginningIndexes[targetI];
        }
      }
    }

  {
    // tally up the score & keep track of matches for highlighting later
    if (successStrict) {
      var matchesBest = matchesStrict;
      var matchesBestLen = matchesStrictLen;
    } else {
      var matchesBest = matchesSimple;
      var matchesBestLen = matchesSimpleLen;
    }
    var score = 0;
    var lastTargetI = -1;
    for (var i = 0; i < searchLen; ++i) {
      var targetI = matchesBest[i];
      // score only goes down if they're not consecutive
      if (lastTargetI !== targetI - 1) score -= targetI;
      lastTargetI = targetI;
    }
    if (!successStrict) {
      score *= 1000;
      if (typoSimpleI !== 0) score += -20; /*typoPenalty*/
    } else {
      if (typoStrictI !== 0) score += -20; /*typoPenalty*/
    }
    score -= targetLen - searchLen;
    prepared.score = score;
    prepared.indexes = new Array(matchesBestLen);
    for (var i = matchesBestLen - 1; i >= 0; --i)
      prepared.indexes[i] = matchesBest[i];

    return prepared;
  }
}

export { algorithmWithTypo, algorithmWithoutTypo, createCache, search };
