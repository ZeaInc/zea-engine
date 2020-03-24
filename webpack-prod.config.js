const path = require('path');
const fs = require('fs');

const package_json = JSON.parse(fs.readFileSync('package.json'));
const { fileName, libraryName } = package_json;

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: `${fileName}.js`,
    path: path.resolve(__dirname, 'dist'),
    library: libraryName,
    libraryTarget: 'umd',
  }
};