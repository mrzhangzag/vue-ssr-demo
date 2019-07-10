const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var HtmlWebpackPlugin  = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  entry: {
    client: path.resolve(__dirname, '../src/entry-client.js')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueSSRClientPlugin(), // 打包成 vue-ssr-client-manifest.json
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.template.html'),
      filename: 'index.template.html'
    })
  ]
})