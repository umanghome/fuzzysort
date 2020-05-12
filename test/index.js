const {
  algorithmWithTypo,
  algorithmWithoutTypo,
  createCache,
  search,
} = require('../dist/fuzzysort.cjs');
const BANKS = require('../banks.json');

const expect = require('chai').expect;

describe('createCache', () => {
  const cache = createCache();

  it('returns an object', () => {
    expect(cache).to.be.an('object');
  });

  it('has the `prepared` cache as a Map', () => {
    expect(cache.cache.prepared).to.not.be.undefined;
    expect(cache.cache.prepared).to.be.an.instanceOf(Map);
  });

  it('has a `clear` function', () => {
    expect(cache.clear).to.be.a('function');
  });

  it('`clear` works', () => {
    expect(cache.cache.prepared.size).to.equal(0);

    cache.cache.prepared.set('foo', 'bar');

    expect(cache.cache.prepared.size).to.equal(1);

    cache.clear();

    expect(cache.cache.prepared.size).to.equal(0);
  });


});

describe('search', () => {
  const cache = createCache();

  describe('throws errors', () => {
    it('when `algorithm` is not provided', () => {
      expect(() => {
        search('state', BANKS, ['code', 'name'], { cache });
      }).to.throw('`algorithm` should be a function');
    });

    it('when `algorithm` is not a function', () => {
      expect(() => {
        search('state', BANKS, ['code', 'name'], { cache, algorithm: 1 });
      }).to.throw('`algorithm` should be a function');
    });

    it('when `keys` is not provided', () => {
      expect(() => {
        search('state', BANKS, null, { cache, algorithm: algorithmWithTypo });
      }).to.throw('`keys` should be an array with at least one item');
    });

    it('when `keys` is not an array', () => {
      expect(() => {
        search('state', BANKS, 1, { cache, algorithm: algorithmWithTypo });
      }).to.throw('`keys` should be an array with at least one item');
    });

    it('when `keys` is an empty array', () => {
      expect(() => {
        search('state', BANKS, [], {
          cache,
          algorithm: algorithmWithTypo,
        });
      }).to.throw('`keys` should be an array with at least one item');
    });
  });

  describe('`threshold` key', () => {
    it('is respected when provided', () => {
      const results = search('state', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
        threshold: -100,
      });

      expect(results.results.length).to.equal(7);
    });

    it('is works without being provided', () => {
      const results = search('state', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
      });

      expect(results.results.length).to.equal(10);
    });
  });

  describe('`limit` key', () => {
    it('is respected when provided', () => {
      const results = search('state', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
        limit: 3,
      });

      expect(results.results.length).to.equal(3);
      expect(results.total).to.equal(10);
    });

    it('is works without being provided', () => {
      const results = search('state', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
      });

      expect(results.total).to.equal(10);
    });
  });

  describe('works with single key', () => {
    it('gets proper result with the given key', () => {
      const codeResults = search('sbin', BANKS, ['code'], {
        cache,

        algorithm: algorithmWithoutTypo,
        threshold: 0
      });

      expect(codeResults.results[0].ref.code).to.equal('SBIN');

      const nameResults = search('state bank of india', BANKS, ['name'], {
        cache,

        algorithm: algorithmWithoutTypo,
        threshold: 0,
      });

      expect(nameResults.results[0].ref.name).to.equal('State Bank of India');
    });
  });

  describe('works with multiple keys', () => {
    it('gets proper result with the given keys', () => {
      const codeResults = search('sbin', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
        threshold: 0,
      });

      expect(codeResults.results[0].ref.code).to.equal('SBIN');
      expect(codeResults.results[0].ref.name).to.equal('State Bank of India');

      const nameResults = search('state bank of india', BANKS, ['code', 'name'], {
        cache,

        algorithm: algorithmWithoutTypo,
        threshold: 0,
      });

      expect(nameResults.results[0].ref.code).to.equal('SBIN');
      expect(nameResults.results[0].ref.name).to.equal('State Bank of India');
    });
  });
});