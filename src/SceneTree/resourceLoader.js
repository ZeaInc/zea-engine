/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable guard-for-in */
import { Env, EventEmitter } from '../Utilities/index'
import { zeaDebug } from '../helpers/zeaDebug'

function checkStatus(response) {
  if (!response.ok) {
    return false
  }

  return response
}

/**
 * Class for delegating resource loading, enabling an abstraction of a cloud file system to be implemented.
 *
 * The resource loader can be used to load data, where it provides central tracking of loading progress and functionality to load various file types, including compressed archives.
 * The plugins script must be loaded along with the engine
 *
 * ```html
 *  <script crossorigin src="libs/zea-engine/dist/plugins.umd.js"></script>
 * ```
 *
 * To load a 'text' file.
 * ```javascript
 *   resourceLoader.loadFile('text', url).then((txt) =>{
 *      console.log(txt)
 *   })
 * ```
 *
 * To load a 'JSON' file.
 * ```javascript
 *   resourceLoader.loadFile('json', url).then((txt) =>{
 *      console.log(json)
 *   })
 * ```
 *
 * To load a 'binary' file.
 * ```javascript
 *   resourceLoader.loadFile('binary', url).then((arrayBuffer) =>{
 *      console.log(arrayBuffer.length)
 *   })
 * ```
 *
 * To load an 'archive' file that is a compressed archive containing multiple sub-files.
 * ```javascript
 *   resourceLoader.loadFile('archive', url).then((entries) =>{
 *      console.log(entries)
 *   })
 * ```
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
    this.promiseCache = {}
    this.baseUrl = Env.baseUrl

    this.plugins = {}

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
  // Register plugins.
  registerPlugin(plugin) {
    zeaDebug('Resource loader plugin registered: %s', plugin.getType())

    plugin.init(this)
    this.plugins[plugin.getType()] = plugin
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
    console.warn('Deprecated. Use "#loadUrl".')
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
   * Load an archive file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadArchive(url) {
    console.warn(`Deprecated. Use "#loadFile('archive', url)".`)
    return this.loadFile('archive', url)
  }

  /**
   * Load a JSON file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadJSON(url) {
    console.warn(`Deprecated. Use "#loadFile('json', url)".`)
    return this.loadFile('json', url)
  }

  /**
   * Load a text file, returning a promise that resolves to the JSON data value.
   * Note: using the resource loader to centralize data loading enables progress to be tracked and displayed
   * @param {string} url - The url of the data to load.
   * @return {Promise} - The promise value.
   */
  loadText(url) {
    console.warn(`Deprecated. Use "#loadFile('text', url)".`)
    return this.loadFile('text', url)
  }

  loadFile(type, url) {
    const plugin = this.plugins[type]

    if (!plugin) {
      throw new Error(
        `There's no plugin registered for the type of file "${type}". Did you add the plugins script? See: https://docs.zea.live/zea-engine/#/adding-default-plugins`
      )
    }

    if (this.promiseCache[url]) return this.promiseCache[url]

    const promise = plugin.loadFile(url)

    this.promiseCache[url] = promise

    this.addWork(url, 1)

    promise.then(() => {
      this.addWorkDone(url, 1)
    })

    return promise
  }

  /**
   * Load and return a file resource using the specified path.
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
