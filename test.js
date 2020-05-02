/*
WHAT: Test and then benchmark
USAGE: Run this file in node

HOW TO WRITE TESTS:
      target         ...matches...               after null must not match
test('APPLES',      'app', 'l', 'E',               null,     'xxx')
               matches must not get better
*/

setTimeout(async function() {
  // for (var i = 0; i < 1000; i++) await tests()
  await tests()

  if(assert.count==0) console.log('testing disabled!')
  else if(!assert.failed) console.log('all tests passed')

  // if(isNode) bench() // Only bench on node. Don't want the demo to freeze
})


async function tests() {
  test('APPLES', 'app', 'l', 'E')
  test('C:/users/farzher/dropbox/someotherfolder/pocket rumble refactor/Run.bat', 'po', 'p', 'po ru', 'pr', 'prrun', 'ocket umble')
  test('123abc', '12', '1', 'a', null, 'cc')


  test('Thoug ht', 'ht', 'hh')

  test('az bx cyy y', 'az', 'ab', 'ay', 'ax', 'ayy')
  testSimple('aab x', 'ab') // this could cause a to get pushed forward then strict match ab in the middle
  testSimple('sax saxax', 'sx') // this is caused if isConsec gets messedup
  testSimple('aabb b', 'abb') // this is cause if isConsec gets messedup
  testSimple('aabb b b b', 'abbbb')

  // typos
  testStrict('abc', 'acb')
  testStrict('abcefg', 'acbefg')
  testStrict('a ac acb', 'abc')
  testStrict('MeshRendering.h', 'mrnederh')
  testStrict('MMommOMMommO', 'moom')
  testNomatch('AndroidRuntimeSettings.h', 'nothing')
  testNomatch('atsta', 'atast')

  test('noodle monster', 'nomon', null, 'qrs')
  test('noodle monster '.repeat(100), null, 'a')

  // typoPenalty
  assert(fuzzysort.single('acb', 'abc').score===-20, 'typoPenalty strict')
  assert(fuzzysort.single('acb', 'axbxc').score===-6022, 'typoPenalty simple')

  // var tmp = fuzzysort.go('a', ['ba', 'bA', 'a', 'bA', 'xx', 'ba'])
  // assert(tmp.results[0].score===0, 'go sorting')
  // assert(tmp.results.length===5, 'go sorting length')
  // assert(tmp.total===5, 'go sorting total')

  fuzzysort.cleanup()

  // assert(fuzzysort.go('a', ['a', 'a']).results.length===2, 'length')
  var tmpfuzz = fuzzysort.new({limit:1}); // TODO: ???
  // assert(fuzzysort.go('a', ['a', 'a'], {
  //   limit: 1
  // }).results.length===1, 'length')

  // checking for infinite loops
  testNomatch('a', '')
  testNomatch('', 'a')
  testNomatch('', '')
  testNomatch('', ' ')
  testNomatch(' ', '')

  var tmpObjs = [{'s.s':'str', arr:[{o:'obj'}]}]
  // keys
  var tmp = fuzzysort.go('str', tmpObjs, {keys: ['s.s']}).results[0]

  assert(tmp.score===0, 'goKeys s.s')
  var tmp = fuzzysort.go('obj', tmpObjs, {keys: ['arr.0.o']}).results[0]
  assert(tmp.score===0, 'goKeys arr.0.o')
  var tmp = fuzzysort.go('str', tmpObjs, {keys: ['arr.0.o']}).results[0]
  assert(tmp===undefined, 'goKeys')
  var tmp = fuzzysort.go('obj', tmpObjs, {keys: [ ['arr', '0', 'o'] ]}).results[0]
  assert(tmp.score===0, 'goKeys arr.0.o')
  var tmp = fuzzysort.go('obj', tmpObjs, {keys: [ 's.s', 'arr.0.o' ]}).results[0]
  assert(tmp.score===0, 'goKeys s.s || arr.0.o')
  var tmp = fuzzysort.go('obj', tmpObjs, {keys: [ 's.s', 'arr.0.o' ], scoreFn(a){return (a[0]?a[0].score:1) + (a[1]?a[1].score:1)}}).results[0]
  assert(tmp.score===1, 'goKeys s.s || arr.0.o score')

  var targets = [
    {name: 'Typography', version: '3.1.0'},
    {name: 'Typography', version: '2.1.0'},
  ]
  // var results = fuzzysort.go('typography', targets, {keys: ['name']}).results
  // assert(results[0].obj.version != results[1].obj.version, 'key same object bug')
  var results = fuzzysort.go('typography', targets, {keys: ['name']}).results
  assert(results[0].obj.version != results[1].obj.version, 'keys same object bug')
  
  // missing key
  var targets = [
    {},
    {name: 'Typography'},
  ]
  
  var results = fuzzysort.go('typography', targets, {keys: ['name']}).results
}







const isNode = typeof require !== 'undefined' && typeof window === 'undefined'
if(isNode) fuzzysort = require('./dist/fuzzysort.cjs.js')

// Config
  fuzzysort = fuzzysort.new({
    limit: 100,
    // threshold: 999,
  })
  const benchmark_duration = 2

if(isNode) testdata = require('./testdata')
var testdata_prepared = {}; var testdata_obj = {}
for(var key of Object.keys(testdata)) {
  testdata_prepared[key] = new Array(testdata[key].length)
  for(var i = testdata[key].length-1; i>=0; i-=1) {
    testdata_prepared[key][i] = fuzzysort.prepare(testdata[key][i])
  }
}
for(var key of Object.keys(testdata)) {
  testdata_obj[key] = new Array(testdata[key].length)
  for(var i = testdata[key].length-1; i>=0; i-=1) {
    // testdata_obj[key][i] = {str: fuzzysort.prepare(testdata[key][i])}
    testdata_obj[key][i] = {str: testdata[key][i]}
  }
}
















function bench() {
  if(isNode) Benchmark = require('benchmark')
  Benchmark.options.maxTime = benchmark_duration
  const suite = new Benchmark.Suite

  suite.add('go prepared', function() {
    fuzzysort.go('nnnne', testdata_prepared.ue4_filenames)
    fuzzysort.go('e', testdata_prepared.ue4_filenames)
    fuzzysort.go('mrender.h', testdata_prepared.ue4_filenames)
  })
  suite.add('go keys', function() {
    fuzzysort.go('nnnne', testdata_obj.ue4_filenames, {keys: ['str']})
    fuzzysort.go('e', testdata_obj.ue4_filenames, {keys: ['str']})
    fuzzysort.go('mrender.h', testdata_obj.ue4_filenames, {keys: ['str']})
  })
  suite.add('go str', function() {
    fuzzysort.go('nnnne', testdata.ue4_filenames)
    fuzzysort.go('e', testdata.ue4_filenames)
    fuzzysort.go('mrender.h', testdata.ue4_filenames)
  })

  // suite.add('goKeys', function() {
  //   fuzzysort.go('e', objects, {key:['target']})
  //   fuzzysort.go('a', objects, {key:['target']})
  //   fuzzysort.go('mrender.h', objects, {key:['target']})

  //   // objs = [{str:'naytunfwuyt', str2:'nautfn'}, {str:'pant', str2:'tunntuftf889323'}, {str:'tame', str2:'n&*(*&o'}]
  //   // fuzzysort.go('t', objs, {keys:['str', 'str2'], scoreFn:metas=> (metas[0]&&metas[0].score||1000) + (metas[1]&&metas[1].score||1000) })
  // })

  suite.add('huge nomatch', function() {
    fuzzysort.single('xxx', 'noodle monster noodle monster noodle monster noodle monster noodle monster noodle monster noodle monster noodle monster noodle monster noodle monster')
  })

  suite.add('tricky', function() {
    fuzzysort.single('prrun', 'C:/users/farzher/dropbox/someotherfolder/pocket rumble refactor/Run.bat')
  })

  suite.add('small', function() {
    fuzzysort.single('al', 'alexstrasa')
  })

  suite.add('somematch', function() {
    fuzzysort.single('texxx', 'template/index')
  })


  suite.on('cycle', function(e) {
    console.log(String(e.target))
  })

  console.log('now benching')
  suite.run()
}




















// helper function nonsense
function assert(b, m=undefined) {
  if(!b) {
  console.log(assert.count, 'ASSERTION FAILED!!!!!!!', m)
  assert.failed = true
  } else {
  // console.log(assert.count, 'test passed')
  }

  assert.count += 1
}
assert.count = 0

function test(target, ...searches) {
  var last_score = Infinity
  var needs_to_fail = false
  for (var i = 0; i < searches.length; i++) {

    var search = searches[i]
    if(search === null) {
      needs_to_fail = true
      continue
    }

    const result = fuzzysort.single(searches[i], target)
    assertResultIntegrity(result)
    var score = undefined
    if(result) score = result.score

    var info = {score, last_score, target, search}
    if(needs_to_fail) {
      assert(score===undefined, info)
    } else {
      assert(score!==undefined, info)
      assert(score<=last_score, info)
      last_score = score
    }
  }
}
function testStrict(target, ...searches) {
  for(const search of searches) {
    const result = fuzzysort.single(search, target)
    assert(result && result.score>-1000, {search, result})
    assertResultIntegrity(result)
  }
}
function testSimple(target, ...searches) {
  for(const search of searches) {
    const result = fuzzysort.single(search, target)
    assert(result && result.score<=-1000, {search, result})
    assertResultIntegrity(result)
  }
}
function testNomatch(target, ...searches) {
  for(const search of searches) {
    const result = fuzzysort.single(search, target)
    assert(result===null, {search, result})
  }
}
function assertResultIntegrity(result) {
  if(result === null) return true
  var lastMatchI = null
  for(const matchI of result.indexes) {
    if(lastMatchI === null) {
      lastMatchI = matchI
    } else {
      if(lastMatchI >= matchI) {
        assert(false, result)
        return false
      }
      lastMatchI = matchI
    }
  }
}

// function randomString(len, charSet) {
//     charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,./\]["<>?:{}!@#$%^&*()_+=-';
//     var randomString = '';
//     for (var i = 0; i < len; i++) {
//         var randomPoz = Math.floor(seededRand() * charSet.length);
//         randomString += charSet.substring(randomPoz,randomPoz+1);
//     }
//     return randomString;
// }

// function seededRand(max=1, min=0) {
//   if(min) [max,min]=[min,max]
//   seededRand.seed = (seededRand.seed * 9301 + 49297) % 233280
//   var rnd = seededRand.seed / 233280
//   return min + rnd * (max - min)
// }
// seededRand.seed = 0
