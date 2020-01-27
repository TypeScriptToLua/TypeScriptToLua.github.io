declare module "worker-loader*" {
    class WebpackWorker extends Worker {
        constructor();
    }

    export = WebpackWorker;
}

declare module "fengari-web";
declare module "highlight.js/lib/*";
