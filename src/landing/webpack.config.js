const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const merge = require('webpack-merge');
const common = require('../webpack.common.js');

module.exports = merge( common, {
  entry: path.resolve(__dirname, './index.ts'),
  plugins: [
    new HtmlWebpackPlugin({
      title: 'TypeScriptToLua',
      template: path.resolve(__dirname, '../../assets/layout/template.html'),
      inject: 'head',
      filename: 'index.html',
      contentFile: 'landing.html'
    })
  ],
  output:{filename: 'landing_bundle.js'},
});