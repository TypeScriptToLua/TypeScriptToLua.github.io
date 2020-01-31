declare module "fengari-web";
declare module "highlight.js/lib/*";
declare module "renderjson";
declare module "worker-loader*" {
    class WebpackWorker extends Worker {
        constructor();
    }

    export = WebpackWorker;
}

declare const __LUA_SYNTAX_KIND__: typeof import("typescript-to-lua").SyntaxKind;
