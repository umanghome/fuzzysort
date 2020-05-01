// prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
// prop = 'key1.key2'        10ms
// prop = ['key1', 'key2']   27ms
export function getValue(obj, prop) {
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

export function isObj(x) {
  return typeof x === 'object';
} // faster as a function
