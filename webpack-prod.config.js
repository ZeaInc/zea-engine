const path = require('path');
let fs = require('fs');
let webpack = require('webpack');
const UglifyEsPlugin = require('uglify-es-webpack-plugin');
// const BabiliPlugin = require('babili-webpack-plugin');

let package_json = JSON.parse(fs.readFileSync('package.json'));
let libraryName = package_json.name;

const plugins = [];
plugins.push(
    new UglifyEsPlugin()
);

module.exports = {
  entry: './src/index.js',
  output: {
  	filename: `${libraryName}.js`,
    path: path.resolve(__dirname, 'lib'),
    library: libraryName
  },
  plugins
};