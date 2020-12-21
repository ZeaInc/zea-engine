// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'web-worker:./ArchiveUnpackerWo... Remove this comment to see the full error message
import ArchiveUnpackerWorker from 'web-worker:./ArchiveUnpackerWorker.js'
// For synchronous loading, uncomment these lines.
// import {
//     ResourceLoaderWorker_onmessage
// } from './ArchiveUnpackerWorker.js';

function checkStatus(response: any) {
  if (!response.ok) {
    return false
  }

  return response
}

/**
 * Archive unpacker plugin.
 */
class ArchiveUnpackerPlugin {
  __callbacks: any;
  __nextWorker: any;
  __workers: any;
  resourceLoader: any;
  wasmUrl: any;
  constructor() {
    this.__callbacks = {}
    this.__workers = []
    this.__nextWorker = 0
  }

  init(resourceLoader: any) {
    this.resourceLoader = resourceLoader
    this.wasmUrl = this.resourceLoader.baseUrl + 'public-resources/unpack.wasm'
  }

  /**
   * The type of file this pluglin handles.
   * @return {string} The type of file.
   */
  getType() {
    return 'archive'
  }

  /**
   * The __getWorker method.
   * @return {any} - The return value.
   * @private
   */
  __getWorker() {
    const __constructWorker = () => {
      return new Promise((resolve) => {
        const worker = new ArchiveUnpackerWorker()
        // const worker = new Worker(this.__resourceLoaderFile.url);

        worker.postMessage({
          type: 'init',
          wasmUrl: this.wasmUrl,
        })
        worker.onmessage = (event: any) => {
          if (event.data.type === 'WASM_LOADED') {
            resolve(worker)
          } else if (event.data.type === 'FINISHED') {
            // const data = event.data
            // const text = [
            //   '==================== ArchiveUnpackerWorker.js ====================',
            //   `Filename: ${data.resourceId}`,
            //   '------------------------------------------------------',
            // ];
            // for(const file in data.entries) {
            //   text.push(`${file}:${data.entries[file].byteLength}`);
            // }
            // console.log(text.join('\n'))

            this.__onFinishedReceiveFileData(event.data)
          } else if (event.data.type === 'ERROR') {
            const data = event.data
            console.error(`Unable to load Resource: ${data.resourceId} With url: ${data.url}`)
          }
        }
      });
    }

    this.__nextWorker = (this.__nextWorker + 1) % 3
    if (this.__workers[this.__nextWorker] == undefined) this.__workers[this.__nextWorker] = __constructWorker()
    return this.__workers[this.__nextWorker]
  }

  /**
   * The __terminateWorkers value.
   * @private
   */
  __terminateWorkers() {
    for (const worker of this.__workers) worker.terminate()
    this.__workers = []
  }

  /**
   * Loads an archive file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadFile(url: any) {
    this.resourceLoader.addWork(url, 2) // Add work in 2 chunks. Loading and unpacking.

    const promise = new Promise(
      (resolve, reject) => {
        if (!(url in this.__callbacks)) this.__callbacks[url] = []
        this.__callbacks[url].push(resolve)
        fetch(url)
          .then((response) => {
            this.resourceLoader.addWorkDone(url, 1)
            if (checkStatus(response)) return response.arrayBuffer()
            else reject(new Error(`loadArchive: ${response.status} - ${response.statusText}`))
          })
          .then((buffer) => {
            const resourceId = url
            if (!(resourceId in this.__callbacks)) this.__callbacks[resourceId] = []
            this.__callbacks[resourceId].push(resolve)

            this.__getWorker().then((worker: any) => {
              worker.postMessage({
                type: 'unpack',
                resourceId,
                buffer,
              })
            })
          })
      },
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      () => {}
    )

    return promise
  }

  /**
   * The __onFinishedReceiveFileData method.
   * @param {object} fileData - The fileData value.
   * @private
   */
  __onFinishedReceiveFileData(fileData: any) {
    const resourceId = fileData.resourceId
    this.resourceLoader.addWorkDone(resourceId, 1) // unpacking done...
    const callbacks = this.__callbacks[resourceId]
    if (callbacks) {
      for (const callback of callbacks) {
        callback(fileData.entries)
      }
      delete this.__callbacks[resourceId]
    }
    this.resourceLoader.emit('loaded', { resourceId })
  }
}

export { ArchiveUnpackerPlugin }
