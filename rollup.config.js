import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import svg from 'rollup-plugin-svg'
import { terser } from 'rollup-plugin-terser'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'

import pkg from './package.json'

const plugins = [
  commonjs(),
  nodePolyfills(),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  json(),
  webWorkerLoader(),
  svg(),
]

const isProduction = !process.env.ROLLUP_WATCH

if (isProduction) {
  plugins.push(terser())
}

const sourcemap = !isProduction

export default [
  // Browser-friendly UMD build.
  {
    input: 'src/index.js',
    output: {
      name: 'zeaEngine',
      file: pkg.browser,
      format: 'umd',
      sourcemap,
    },
    plugins,
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap },
      { file: pkg.module, format: 'es', sourcemap },
    ],
    plugins,
  },

  // Zea Engine default plugins.
  {
    input: 'src/index-plugins.js',
    output: {
      name: 'zeaEnginePlugins',
      file: pkg.plugins,
      format: 'umd',
      sourcemap,
    },
    plugins,
  },
]
