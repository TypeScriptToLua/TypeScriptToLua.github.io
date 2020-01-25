const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const common = require("../webpack.common.js");

module.exports = merge(common, {
    entry: path.resolve(__dirname, "./index.ts"),
    node: { fs: "empty" },
    plugins: [
        new MonacoWebpackPlugin({ languages: ["javascript", "typescript", "lua"] }),
        new HtmlWebpackPlugin({
            title: "TypeScriptToLua - Online Compiler",
            template: path.resolve(__dirname, "../../assets/layout/template.html"),
            filename: "play.html",
            contentFile: "play.html",
        }),
    ],
    output: { filename: "play_bundle.js" },
});
