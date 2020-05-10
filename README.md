# Fuzzysort

> A fuzzy-searching library for JavaScript

This is a fork of [farzher/fuzzysort](https://github.com/farzher/fuzzysort) with some significant changes:
- Tree-shakable
- Only synchronous searching
- No global cache
- Only works on objects

The original repository describes this as
> Fast SublimeText-like fuzzy search for JavaScript.
> Sublime's fuzzy search is... sublime. I wish everything used it. So here's an open source js version.


# Installation

## Node

```sh
npm install @umanghome/fuzzysort
```

and use as

```js
const fuzzysort = require('@umanghome/fuzzysort')
```

or

```js
import * as fuzzysort from '@umanghome/fuzzysort');
```

## Browser

Download and serve [dist/fuzzysort.umd.js](dist/fuzzysort.umd.js)

```html
<script src="fuzzysort.umd.js"></script>
```

The library will be available under `window.fuzzysort`

# Exports 

1. `search` - The core function you will use for searching.
1. `createCache` - For better performance, you should pass a cache to `search`. This function creates the necessary cache.
1. `clearCache` - Clears the cache returned by `createCache`. Should be called when you're done searching.
1. `algorithmWithTypo` - You will need to pass an algorithm to `search`. This algorithm allows a mismatch of one character.
1. `algorithmWithoutTypo` - You will need to pass an algorithm to `search`. This algorithm does not allow a mismatch.

# Usage

## `createCache`

```js
const cache = createCache();
```

A cache can be reused between searches for to gain performance improvement. The recommended way to use a cache using a single cache for different searches across the same `targets`. If the `targets` change entirely, use a different cache. This can translated loosely to mean use the same cache for multiple `term`s across the same `targets`, but a different cache for each `target`.

## `clearCache`

```js
clearCache(cache);
```

It's a good idea to free up memory when you know no further searches will be made using the `cache`. The unmount lifecycle hook of your UI component is a good place to use this.

## `search`

```js
search(
  term: string, // The search term
  targets: Array<Object>, // The list of objects to search on
  keys: Array<string>, // The keys on each object to consider
  options: Object // Misc. options (see below)
): ({
  results: Array<Object>,
  total: number 
})
```

```js
options = {
  algorithm: fuzzysort.algorithmWithTypo, // The algorithm to use

  // Optional
  cache: createdCache, // The cache that is created. See `createCache` usage for details.
  limit: 10, // The limit of results to return. Picks the top `limit` results. Default: 9007199254740991
  threshold: -100, // Considers results with a score greater than or equal to `threshold`. Default: -9007199254740991
}
```


`keys` is the list of keys to search on. Nested keys can be represented as `"foo.bar"`. Example: `["name", "contact.phone"]` if your target looks like
```js
{
  name: 'John Doe',
  contact: {
    phone: '9988776655'
  }
}
```

`search` returns an object with two keys:
1. `results` - An array of objects of the shape
```js
{
  ref: Object; // Reference to the original object in `targets`
  score: number; // The score of the match
}
```

2. `total` - The total number of matches. This might be different than `results.length` if `options.limit` is used.

3. `meta` - An object containing meta-information for all the matches. It is an object with keys as every key of `keys`. See usage for an example. Each object under `meta[key]` looks like
```js
{
  indices: Array<number> | null; // The indices matched, if at all
  score: number | null; // The score if we found any matching characters
  target: string; // The string that we performed the search on
}
```

# Example

```js
const Banks = [
  {
    "code": "HDFC",
    "name": "HDFC Bank"
  },
  {
    "code": "ICIC",
    "name": "ICICI Bank"
  },
  {
    "code": "IOBA",
    "name": "Indian Overseas Bank"
  },
  {
    "code": "SBIN",
    "name": "State Bank of India"
  },
  {
    "code": "UBIN",
    "name": "Union Bank of India"
  },
];

const cache = fuzzysort.createCache();

const results = fuzzysort.search('india', Banks, ['name'], {
  algorithm: fuzzysort.algorithmWithTypo,
  cache: cache,
  limit: 2,
});

fuzzysort.clearCache(cache);

console.log(results);
```

will log

```js
{
  "results": [
    {
      "ref": {
        "code": "IOBA",
        "name": "Indian Overseas Bank"
      },
      "meta": {
        "name": {
          "indices": [0, 1, 2, 3, 4],
          "score": -15,
          "target": "Indian Overseas Bank"
        }
      },
      "score": -15
    },
    {
      "ref": {
        "code": "SBIN",
        "name": "State Bank of India"
      },
      "meta": {
        "name": {
          "indices": [14, 15, 16, 17, 18],
          "score": -28,
          "target": "State Bank of India"
        }
      },
      "score": -28
    }
  ],
  "total": 3
}
```

# TODO

- [ ] Document how to highlight
- [ ] Allow and document custom `scoreFn`
- [ ] Add tests for `algorithmWithTypo`
- [ ] Add tests for `algorithmWithoutTypo`
- [ ] Modernize `algorithmWithTypo`
- [ ] Modernize `algorithmWithoutTypo`
- [ ] Fix and add types
- [ ] Maybe migrate to TypeScript

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.