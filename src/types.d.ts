declare module "worker-loader!*" {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}

declare module "fengari-web";
declare module "highlight.js/lib/*";
