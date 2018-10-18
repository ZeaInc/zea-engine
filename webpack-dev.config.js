const path = require('path');
const fs = require('fs');

const package_json = JSON.parse(fs.readFileSync('package.json'));
const { libraryName } = package_json;

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: `${libraryName}.js`,
        path: path.resolve(__dirname, 'lib'),
        library: libraryName,
        libraryTarget: 'umd',
    },
    devtool: 'eval-source-map',
};
