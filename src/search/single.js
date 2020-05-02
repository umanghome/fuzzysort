// @ts-check
import { isObj } from '../internals/utils';
import algorithmWithTypo from '../algorithm/typo';
import algorithmWithoutTypo from '../algorithm/no-typo';
import { getPrepared, getPreparedSearch } from '../internals/prepare';
import { getOptions } from '../internals/defaults';

export default function single (search, target, options) {
  if(!search) {
    return null;
  }

  if(!isObj(search)) {
    search = getPreparedSearch(search);
  }

  if(!target) {
    return null;
  }
  if(!isObj(target)) {
    target = getPrepared(target);
  }

  let instanceOptions = {}; // TODO: ???

  const { allowTypo } = getOptions(instanceOptions, options);
  
  const algorithm = allowTypo ? algorithmWithTypo : algorithmWithoutTypo;

  return algorithm(search, target, search[0])
}