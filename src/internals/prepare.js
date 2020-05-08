function prepareLowerCodes (str) {
  const strLen = str.length;
  const lower = str.toLowerCase();

  let lowerCodes = [] // new Array(strLen)    sparse array is too slow

  for (let i = 0; i < strLen; ++i) {
    lowerCodes[i] = lower.charCodeAt(i);
  }

  return lowerCodes;
};

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

export function prepareNextBeginningIndexes(target) {
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

export function prepare(target) {
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

export function prepareSearch(search) {
  if (!search) {
    return;
  }

  return prepareLowerCodes(search);
}

export function getPrepared(target, cache) {
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