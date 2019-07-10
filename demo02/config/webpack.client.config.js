const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var HtmlWebpackPlugin  = require('html-webpack-plugin')
const base = require('./webpack.base.config');

module.exports = merge(base, {
  entry: {
    client: path.resolve(__dirname, '../src/entry-client.js')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.template.html'),
      filename: 'index.template.html',
      // files: {
      //   js: 'client.bundle.js'
      // },
      // excludeChunks: ['server']
    })
  ]
})