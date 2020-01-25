const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
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
    resolve: { extensions: [".tsx", ".ts", ".js"] },
    output: { path: path.resolve(__dirname, "../dist") },
};
