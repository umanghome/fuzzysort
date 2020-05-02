// @ts-check

export default function highlight(result, hOpen = '<b>', hClose = '</b>') {
  if (result === null) {
    return null;
  }

  const target = result.target;
  const targetLen = target.length;
  const matchesBest = result.indexes;

  let highlighted = '';
  let matchesIndex = 0;
  let opened = false;

  for (let i = 0; i < targetLen; ++i) {
    const char = target[i];
    if (matchesBest[matchesIndex] === i) {
      ++matchesIndex;

      if (!opened) {
        opened = true;
        highlighted += hOpen;
      }

      if (matchesIndex === matchesBest.length) {
        highlighted += char + hClose + target.substr(i + 1);
        break;
      }
      
    } else {
      if (opened) {
        opened = false;
        highlighted += hClose;
      }
    }

    highlighted += char;
  }

  return highlighted;
}
