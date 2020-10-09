/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable guard-for-in */
import { EventEmitter } from '../Utilities/index'

// const asyncLoading = true;
import ResourceLoaderWorker from 'web-worker:./ResourceLoader/ResourceLoaderWorker.js'
// For synchronous loading, uncomment these lines.
// import {
//     ResourceLoaderWorker_onmessage
// } from './ResourceLoaderWorker.js';

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`)
  }
  return response
}

/**
 * Class for delegating resource loading, enabling an abstraction of a cloud file system to be implemented.
 *
 * **Events**
 * * **loaded:** emitted when a file has finished loading
 * * **progressIncremented:** emitted when a loading of processing task has been incremented
 * * **allResourcesLoaded:** emitted when all outstanding resources are loaded. This event can be used to signal the completion of load.
 */
class ResourceLoader extends EventEmitter {
  /**
   * Create a resource loader.
   */
  constructor() {
    super()
    this.__adapter = undefined
    this.__totalWork = 0
    this.__doneWork = 0
    this.__callbacks = {}
    this.promiseCache = {}

    this.__workers = []
    this.__nextWorker = 0

    let baseUrl
    // Note: globalThis causes errors on Safari.
    if (window.navigator) {
      const scripts = document.getElementsByTagName('script')
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        if (script.src.includes('zea-engine')) {
          // Note: the Wasm file is a resource that must be loaded with the engine. If we know the URL for the
          // engine library, then we can determine the URL for the Wasm file.
          // This code generates a URL for the Wasm file based on the position of 'zea-engine' in the path.
          // e.g.
          // https://cdn.jsdelivr.net/combine/npm/@zeainc/zea-engine@umd
          // or
          // https://unpkg.com/@zeainc/zea-engine@1.5.0/dist/index.cjs.js
          // or
          // Trim off all the parts after the engine section, and then append the parts for public resources.
          const parts = script.src.split('/')
          const enginePartIndex = parts.findIndex((part) => part.includes('zea-engine'))
          while (parts.length > enginePartIndex + 1) parts.pop()

          // Now unpack combined urls to get just the engine part.
          // e.g.
          // cdn.jsdelivr.net/combine/npm/@zeainc/zea-engine@umd,npm/@zeainc/zea-ux@umd,npm/@zeainc/zea-kinematics@umd"
          if (parts[parts.length - 1].includes(',')) {
            parts[parts.length - 1] = parts[parts.length - 1].split(',')[0]
          }
          baseUrl = parts.join('/')
          break
        }
      }
      // If no Wasm url can be found, fallback to this one.
      if (!baseUrl) {
        baseUrl = 'https://unpkg.com/@zeainc/zea-engine@0.1.3'
      }
      this.wasmUrl = baseUrl + '/public-resources/unpack.wasm'
    } else {
      // If loading in Node.js... TODO.
    }

    if (!baseUrl) {
      baseUrl = 'https://unpkg.com/@zeainc/zea-engine@0.1.3'
    }
    this.wasmUrl = baseUrl + '/public-resources/unpack.wasm'

    // Common resources are used by systems such at the renderer and VR controllers.
    // Any asset that will probably be used my multiple different independent objects
    // should be loaded here. (For now, it is being used to load VR Controller assets.)
    this.__commonResources = {}
  }

  /**
   * The setAdapter method.
   * @param {object} adapter - The adapter object.
   */
  setAdapter(adapter) {
    this.__adapter = adapter
  }

  /**
   * The getAdapter method.
   * @return {object} - The adapter object.
   */
  getAdapter() {
    return this.__adapter
  }

  // /////////////////////////////////////////////////
  // Workers

  /**
   * The __getWorker method.
   * @return {any} - The return value.
   * @private
   */
  __getWorker() {
    const __constructWorker = () => {
      return new Promise((resolve) => {
        const worker = new ResourceLoaderWorker()
        // const worker = new Worker(this.__resourceLoaderFile.url);

        worker.postMessage({
          type: 'init',
          wasmUrl: this.wasmUrl,
        })
        worker.onmessage = (event) => {
          if (event.data.type === 'WASM_LOADED') {
            resolve(worker)
          } else if (event.data.type === 'FINISHED') {
            // const data = event.data
            // const text = [
            //   '==================== ResourceLoaderWorker.js ====================',
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
      })
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

  // /////////////////////////////////////////////////
  // URLS

  /**
   * Given some value, which could be an IR or a path, return the unique identifier.
   * @param {string} value - The file value.
   * @return {string} - The resolved fileId if an adapter is installed, else the original value.
   */
  resolveFileId(value) {
    if (this.__adapter) return this.__adapter.resolveFileId(value)
    return value
  }

  /**
   * The resolveFilename method.
   * @deprecated
   * @param {string} value - The file value.
   * @return {string} - The resolved URL if an adapter is installed, else the original value.
   */
  resolveFilename(value) {
    if (this.__adapter) return this.__adapter.resolveFilename(value)
    const filename = value.split(value.lastIndexOf('/'))[1]
    return filename
  }

  /**
   * The resolveURL method.
   * @deprecated
   * @param {string} value - The file value.
   * @return {string} - The resolved URL if an adapter is installed, else the original value.
   */
  resolveURL(value) {
    if (this.__adapter) return this.__adapter.resolveURL(value)
    return value
  }

  /**
   * The loadURL method.
   * @param {string} resourceId - The resourceId value.
   * @param {string} url - The url value.
   * @param {function} callback - The callback value.
   * @param {boolean} addLoadWork - The addLoadWork value.
   * @return {any} - The return value.
   * @deprecated
   * @private
   */
  loadURL(resourceId, url, callback, addLoadWork = true) {
    console.warn('Please call loadUrl instead,')
    return this.loadUrl(resourceId, url, callback, addLoadWork)
  }

  /**
   * The loadUrl method.
   * @param {string} resourceId - The resourceId value.
   * @param {string} url - The url value.
   * @param {function} callback - The callback value.
   * @param {boolean} addLoadWork - The addLoadWork value.
   */
  loadUrl(resourceId, url, callback, addLoadWork = true) {
    console.warn(`deprecated use #loadArchive`)
    this.loadArchive(url).then((entries) => {
      callback(entries)
    })
  }

  /**
   * Loads a JSON file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadJSON(url) {
    if (this.promiseCache[url]) return this.promiseCache[url]

    this.addWork(url, 1)

    const promise = new Promise(
      (resolve, reject) => {
        fetch(url).then((response) => {
          this.addWorkDone(url, 1)
          if (checkStatus(response)) resolve(response.json())
          else reject(response.status)
        })
      },
      () => {}
    )

    this.promiseCache[url] = promise
    return promise
  }

  /**
   * Loads a text file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadText(url) {
    if (this.promiseCache[url]) return this.promiseCache[url]

    this.addWork(url, 1)

    const promise = new Promise(
      (resolve, reject) => {
        fetch(url).then((response) => {
          this.addWorkDone(url, 1)
          if (checkStatus(response)) resolve(response.text())
          else reject(response.status)
        })
      },
      () => {}
    )

    this.promiseCache[url] = promise
    return promise
  }

  /**
   * Loads an archive file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadArchive(url) {
    if (this.promiseCache[url]) return this.promiseCache[url]

    this.addWork(url, 2) // Add work in 2 chunks. Loading, unpacking.

    const promise = new Promise(
      (resolve, reject) => {
        if (!(url in this.__callbacks)) this.__callbacks[url] = []
        this.__callbacks[url].push(resolve)
        fetch(url)
          .then((response) => {
            this.addWorkDone(url, 1)
            if (checkStatus(response)) return response.arrayBuffer()
            else reject(response.status)
          })
          .then((buffer) => {
            const resourceId = url
            if (!(resourceId in this.__callbacks)) this.__callbacks[resourceId] = []
            this.__callbacks[resourceId].push(resolve)

            this.__getWorker().then((worker) => {
              worker.postMessage({
                type: 'unpack',
                resourceId,
                buffer,
              })
            })
          })
      },
      () => {}
    )

    this.promiseCache[url] = promise
    return promise
  }

  /**
   * The __onFinishedReceiveFileData method.
   * @param {object} fileData - The fileData value.
   * @private
   */
  __onFinishedReceiveFileData(fileData) {
    const resourceId = fileData.resourceId
    this.addWorkDone(resourceId, 1) // unpacking done...
    const callbacks = this.__callbacks[resourceId]
    if (callbacks) {
      for (const callback of callbacks) {
        callback(fileData.entries)
      }
      delete this.__callbacks[resourceId]
    }
    this.emit('loaded', { resourceId })
  }

  /**
   * Loads and return a file resource using the specified path.
   *
   * @param {string} resourceId - The resourceId value.
   * @return {VLAAsset} - The return value.
   */
  loadCommonAssetResource(resourceId) {
    if (resourceId in this.__commonResources) {
      return this.__commonResources[resourceId]
    }
    const asset = new VLAAsset()
    asset.getParameter('DataFilePath').setValue(resourceId)
    this.__commonResources[resourceId] = asset
    return asset
  }

  // /////////////////////////////////////////////////
  // Work

  /**
   * Add work to the total work pile.. We never know how big the pile will get.
   *
   * @param {string} resourceId - The resourceId value.
   * @param {number} amount - The amount value.
   */
  addWork(resourceId, amount) {
    this.__totalWork += amount
    const percent = (this.__doneWork / this.__totalWork) * 100
    this.emit('progressIncremented', { percent })
  }

  /**
   * Add work to the 'done' pile. The done pile should eventually match the total pile.
   *
   * @param {string} resourceId - The resourceId value.
   * @param {number} amount - The amount value.
   */
  addWorkDone(resourceId, amount) {
    this.__doneWork += amount

    const percent = (this.__doneWork / this.__totalWork) * 100
    this.emit('progressIncremented', { percent })
    if (this.__doneWork > this.__totalWork) {
      throw new Error('Mismatch between work loaded and work done.')
    }
    if (this.__doneWork == this.__totalWork) {
      this.emit('allResourcesLoaded', {})
    }
  }
}

const resourceLoader = new ResourceLoader()
export { resourceLoader }
