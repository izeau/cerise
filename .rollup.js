const input = 'lib/cerise.js';
const config = output => ({ input, output });

export default [
  config({
    file: 'cerise.js',
    format: 'cjs',
    esModule: false,
    preferConst: true,
  }),

  config({
    file: 'cerise.mjs',
    format: 'esm',
    preferConst: true,
  }),
];
