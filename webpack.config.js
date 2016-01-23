var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');

var libraryName = 'Darkroom';

module.exports = {
  debug: true,
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: libraryName.toLowerCase() + '.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      },
      {
        test: /\.svg$/,
        loader: "raw-loader"
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js', '.ts']
  },
  externals: {
    "fabric": "fabric"
  },
  plugins: [
  ],
  postcss: function () {
    return [autoprefixer];
  },
};
