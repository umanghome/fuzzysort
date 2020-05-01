export function defaultScoreFn(a) {
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

// prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
// prop = 'key1.key2'        10ms
// prop = ['key1', 'key2']   27ms
export function getValue(obj, prop) {
  var tmp = obj[prop];
  if (tmp !== undefined) return tmp;
  var segs = prop;
  if (!Array.isArray(prop)) segs = prop.split('.');
  var len = segs.length;
  var i = -1;
  while (obj && ++i < len) obj = obj[segs[i]];
  return obj;
}

export function isObj(x) {
  return typeof x === 'object';
} // faster as a function
