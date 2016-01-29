var webpack = require('webpack');

module.exports = {
  entry: './lib/js/commonjs/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'darkroom.umd.js',
    library: 'Darkroom',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};
