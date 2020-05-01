// @ts-check
import { prepareNextBeginningIndexes } from '../internals/prepare';

export default function algorithmWithoutTypo (searchLowerCodes, prepared, searchLowerCode) {
  let matchesSimple = [];
  let matchesStrict = [];

  var targetLowerCodes = prepared._targetLowerCodes
  var searchLen = searchLowerCodes.length
  var targetLen = targetLowerCodes.length
  var searchI = 0 // where we at
  var targetI = 0 // where you at
  var matchesSimpleLen = 0

  // very basic fuzzy match; to remove non-matching targets ASAP!
  // walk through target. find sequential matches.
  // if all chars aren't found then exit
  for(;;) {
    var isMatch = searchLowerCode === targetLowerCodes[targetI]
    if(isMatch) {
      matchesSimple[matchesSimpleLen++] = targetI
      ++searchI; if(searchI === searchLen) break
      searchLowerCode = searchLowerCodes[searchI]
    }
    ++targetI; if(targetI >= targetLen) return null // Failed to find searchI
  }

  var searchI = 0
  var successStrict = false
  var matchesStrictLen = 0

  var nextBeginningIndexes = prepared._nextBeginningIndexes
  if(nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target)
  var firstPossibleI = targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1]

  // Our target string successfully matched all characters in sequence!
  // Let's try a more advanced and strict test to improve the score
  // only count it as a match if it's consecutive or a beginning character!
  if(targetI !== targetLen) for(;;) {
    if(targetI >= targetLen) {
      // We failed to find a good spot for this search char, go back to the previous search char and force it forward
      if(searchI <= 0) break // We failed to push chars forward for a better match

      --searchI
      var lastMatch = matchesStrict[--matchesStrictLen]
      targetI = nextBeginningIndexes[lastMatch]

    } else {
      var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI]
      if(isMatch) {
        matchesStrict[matchesStrictLen++] = targetI
        ++searchI; if(searchI === searchLen) { successStrict = true; break }
        ++targetI
      } else {
        targetI = nextBeginningIndexes[targetI]
      }
    }
  }

  { // tally up the score & keep track of matches for highlighting later
    if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen }
    else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen }
    var score = 0
    var lastTargetI = -1
    for(var i = 0; i < searchLen; ++i) { var targetI = matchesBest[i]
      // score only goes down if they're not consecutive
      if(lastTargetI !== targetI - 1) score -= targetI
      lastTargetI = targetI
    }
    if(!successStrict) score *= 1000
    score -= targetLen - searchLen
    prepared.score = score
    prepared.indexes = new Array(matchesBestLen); for(var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i]

    return prepared
  }
}