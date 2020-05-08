import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'fuzzysort.js',
    output: {
      name: 'howLongUntilLunch',
      file: pkg.browser,
      format: 'umd',
    },
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'fuzzysort.js',
    external: ['ms'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
