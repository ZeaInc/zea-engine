const path = require('path');
let fs = require('fs');

let package_json = JSON.parse(fs.readFileSync('package.json'));
let { libraryName } = package_json
const plugins = [];

// https://www.npmjs.com/package/copy-webpack-plugin
const builddir = path.resolve(__dirname, 'lib');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: `${libraryName}.js`,
    path: builddir,
    library: libraryName
  },
  plugins,
  devtool: 'source-map'
};
