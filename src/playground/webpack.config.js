const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

const merge = require('webpack-merge');
const common = require('../webpack.common.js');


// hack to patch fs because i cant get externals to work and dont know wtf is
// going on in webpack
const transpilerFilePath = path.resolve(
    __dirname, '../../node_modules/typescript-to-lua/dist/Transpiler.js');
fs.writeFileSync(
    transpilerFilePath,
    fs.readFileSync(transpilerFilePath)
        .toString()
        .replace('const fs = require("fs");', ''));


module.exports = merge( common, {
  entry: path.resolve(__dirname, './index.ts'),
  plugins: [
    new MonacoWebpackPlugin({languages: ['javascript', 'typescript', 'lua']}),
    new HtmlWebpackPlugin({
      title: 'TypeScriptToLua - Online Compiler',
      template: path.resolve(__dirname, '../../assets/layout/template.html'),
      inject: 'head',
      filename: 'play.html',
      contentFile: 'play.html'
    })
  ],
  output:{filename: 'play_bundle.js'},
});