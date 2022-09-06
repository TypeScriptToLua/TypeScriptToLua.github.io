const path = require("path");
const { DefinePlugin, ProvidePlugin } = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
// Not used directly in playground, because it imports typescript
const { SyntaxKind: LuaSyntaxKind } = require("typescript-to-lua/dist/LuaAST");

const resolve = (query) => path.resolve(__dirname, query);

/** @returns {import('@docusaurus/types').Plugin<any>} */
module.exports = () => ({
    configureWebpack: (config, isServer) => {
        return {
            resolveLoader: {
                // Don't generate worker files in server build, because it overrides client files
                alias: isServer ? { "worker-loader": require.resolve("null-loader") } : {},
            },
            resolve: {
                alias: {
                    // Stub file resolution for playground
                    [require.resolve("typescript-to-lua/dist/transpilation/resolve.js")]:
                        resolve("src/resolve-stub.ts"),
                },
                fallback: {
                    os: false,
                    fs: false,
                    perf_hooks: false,
                    buffer: require.resolve("buffer"),
                    stream: require.resolve("stream-browserify"),
                    zlib: require.resolve("browserify-zlib"),
                    path: require.resolve("path-browserify"),
                },
            },
            plugins: [
                new ProvidePlugin({
                    process: "process/browser",
                }),
                new DefinePlugin({ __LUA_SYNTAX_KIND__: JSON.stringify(LuaSyntaxKind) }),
                ...(isServer
                    ? []
                    : [
                          new ForkTsCheckerWebpackPlugin({
                              logger: { devServer: false },
                              typescript: { configFile: resolve("src/tsconfig.json") },
                          }),
                      ]),
            ],
        };
    },
});
