const path = require('path');
let fs = require('fs');
let webpack = require('webpack');
const Uglify = require("uglifyjs-webpack-plugin");

let package_json = JSON.parse(fs.readFileSync('package.json'));
let { libraryName } = package_json

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
  	filename: `${libraryName}.js`,
    path: path.resolve(__dirname, 'lib'),
    library: libraryName
  },
  devtool: 'source-map',
  plugins: [
    new Uglify()
  ]
};
