/*
WHAT: SublimeText-like Fuzzy Search

USAGE:
  fuzzysort.single('fs', 'Fuzzy Search') // {score: -16}
  fuzzysort.single('test', 'test') // {score: 0}
  fuzzysort.single('doesnt exist', 'target') // null

  fuzzysort.go('mr', ['Monitor.cpp', 'MeshRenderer.cpp'])
  // [{score: -18, target: "MeshRenderer.cpp"}, {score: -6009, target: "Monitor.cpp"}]

  fuzzysort.highlight(fuzzysort.single('fs', 'Fuzzy Search'), '<b>', '</b>')
  // <b>F</b>uzzy <b>S</b>earch
*/

import fastpriorityqueue from './internals/fastpriorityqueue';
import { getOptions } from './internals/defaults';
import {
  prepare,
  prepareSlow,
  prepareSearch,
  clearPreparedCache,
} from './internals/prepare';

import highlight from './search/highlight';
import single from './search/single';
import go from './search/go';

function fuzzysortNew(instanceOptions) {
  instanceOptions = getOptions(instanceOptions);

  var fuzzysort = {
    single: single,

    go: go,

    highlight: highlight,

    prepare: prepare,
    prepareSlow: prepareSlow,
    prepareSearch: prepareSearch,

    // Below this point is only internal code
    // Below this point is only internal code
    // Below this point is only internal code
    // Below this point is only internal code

    cleanup: cleanup,
    new: fuzzysortNew,
  }
  return fuzzysort
} // fuzzysortNew

// This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()
var isNode = typeof require !== 'undefined' && typeof window === 'undefined'
// var MAX_INT = Number.MAX_SAFE_INTEGER
// var MIN_INT = Number.MIN_VALUE
var noResults = []; noResults.total = 0;

function cleanup() {
  clearPreparedCache();
}

var q = fastpriorityqueue() // reuse this, except for async, it needs to make its own

export default fuzzysortNew();

// TODO: (performance) wasm version!?

// TODO: (performance) layout memory in an optimal way to go fast by avoiding cache misses

// TODO: (performance) preparedCache is a memory leak

// TODO: (like sublime) backslash === forwardslash

// TODO: (performance) i have no idea how well optizmied the allowing typos algorithm is
