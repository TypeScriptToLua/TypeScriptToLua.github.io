declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

interface FSDummy {
    readFileSync(fileName: string): Buffer;
}

interface Window {
    fs: FSDummy
}
