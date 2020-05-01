function scoreFn (a) {
  var max = -9007199254740991;
  for (var i = a.length - 1; i >= 0; --i) {
    var result = a[i];
    if (result === null) continue;
    var score = result.score;
    if (score > max) max = score;
  }
  if (max === -9007199254740991) return null;
  return max;
}

const options = {
  allowTypo: true,
  threshold: -9007199254740991,
  limit: 9007199254740991, // Number.MAX_SAFE_INTEGER?

  scoreFn: scoreFn,
};

export function getOptions (instance = {}, custom = {}) {
  return {
    ...options,
    ...instance,
    ...custom
  };
}