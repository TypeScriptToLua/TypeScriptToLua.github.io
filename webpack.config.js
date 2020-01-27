const webpack = require("webpack");
const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PnpWebpackPlugin = require("pnp-webpack-plugin");

const resolve = query => path.resolve(__dirname, query);
const emptyModulePath = require.resolve("node-libs-browser/mock/empty.js");

/** @type {import("webpack").Configuration} */
module.exports = {
    devtool: "source-map",
    entry: {
        landing_bundle: resolve("src/landing/index.ts"),
        play_bundle: resolve("src/playground/index.ts"),
    },
    output: { path: resolve("dist") },
    node: { fs: "empty", module: "empty" },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        plugins: [PnpWebpackPlugin],
    },
    resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: "ts-loader" },
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

        // Ignore pnpapi reference in patched typescript source
        new webpack.IgnorePlugin(/pnpapi/),

        // Exclude `typescript` from `play_bundle` referenced from `typescript-to-lua/dist/LuaAST`
        new webpack.NormalModuleReplacementPlugin(/typescript/, resource => {
            const { issuer, compiler } = (resource.resourceResolveData && resource.resourceResolveData.context) || {};
            if (issuer === require.resolve("typescript-to-lua/dist/LuaAST") && compiler !== "worker") {
                resource.resource = emptyModulePath;
            }
        }),
    ],
};
