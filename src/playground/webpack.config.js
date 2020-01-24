const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

const merge = require('webpack-merge');
const common = require('../webpack.common.js');


// hack to patch fs because i cant get externals to work and dont know wtf is
// going on in webpack
const replaceFsInPaths =
[
  path.resolve(__dirname, '../../node_modules/typescript-to-lua/dist/LuaLib.js'),
  path.resolve(__dirname, '../../node_modules/typescript-to-lua/node_modules/source-map/lib/read-wasm.js')
];

replaceFsInPaths.forEach(p => {
  fs.writeFileSync(
    p,
    fs.readFileSync(p)
        .toString()
        .replace('const fs = require("fs");', ''));
})

module.exports = merge( common, {
  entry: path.resolve(__dirname, './index.ts'),
  node: { fs: "empty" },
  plugins: [
    new MonacoWebpackPlugin({languages: ['javascript', 'typescript', 'lua']}),
    new HtmlWebpackPlugin({
      title: 'TypeScriptToLua - Online Compiler',
      template: path.resolve(__dirname, '../../assets/layout/template.html'),
      inject: 'head',
      filename: 'play.html',
      contentFile: 'play.html'
    }),
  ],
  output:{filename: 'play_bundle.js'},
});
