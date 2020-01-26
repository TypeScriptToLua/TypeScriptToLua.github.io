const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const resolve = query => path.resolve(__dirname, query);

module.exports = {
    devtool: "source-map",
    entry: {
        landing_bundle: resolve("src/landing/index.ts"),
        play_bundle: resolve("src/playground/index.ts"),
    },
    output: { path: resolve("dist") },
    resolve: { extensions: [".tsx", ".ts", ".js"] },
    node: { fs: "empty" },
    module: {
        rules: [
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                loader: "url-loader",
                options: { esModule: false, name: "[path][name].[ext]?hash=[hash:20]", limit: 8192 },
            },
            { test: /\.ttf$/, loader: "file-loader" },
            { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
            { test: /\.webmanifest?$/, loader: "file-loader", options: { esModule: false } },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TypeScriptToLua",
            chunks: ["landing_bundle"],
            template: resolve("assets/layout/template.html"),
            filename: "index.html",
            contentFile: "landing.html",
        }),

        new MonacoWebpackPlugin({ languages: ["javascript", "typescript", "lua"] }),
        new HtmlWebpackPlugin({
            title: "TypeScriptToLua - Online Compiler",
            chunks: ["play_bundle"],
            template: resolve("assets/layout/template.html"),
            filename: "play.html",
            contentFile: "play.html",
        }),
    ],
};
