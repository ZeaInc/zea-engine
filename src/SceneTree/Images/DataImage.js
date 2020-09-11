import { Registry } from '../../Registry'
import { BaseImage } from '../BaseImage.js'

// let ResourceLoaderWorker = require("worker-loader?inline!./ResourceLoaderWorker.js");

/**
 * Represents a BaseImage with the ability to load data.
 *
 * **Events**
 * * **loaded:** Triggered when the data is loaded.
 * * **updated:** Triggered when the data is updated.
 * @extends BaseImage
 */
class DataImage extends BaseImage {
  /**
   * Create a data image.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super()

    if (name == undefined) name = this.constructor.name
    this.__name = name
    this.format = 'RGBA'
    this.type = 'UNSIGNED_BYTE'
    this.__loaded = false

    // this.__data = new Uint8Array(4);
    this.width = 1
    this.height = 1
  }

  /**
   * Returns an indicator of current item's loaded state.
   * @return {boolean} - `true` if bytes data is fully loaded, `false` otherwise.
   */
  isLoaded() {
    return this.__loaded
  }

  /**
   * Returns the item's name.
   *
   * @return {string} - The return value.
   */
  getName() {
    return this.__name
  }

  /**
   * Images are static content, so the value for this method is always going to be `false`
   *
   * @return {boolean} - The return value.
   */
  isStream() {
    return false
  }

  /**
   * Sets Image's data by recieving an bytes array.
   *
   * @param {number} width - The width value.
   * @param {number} height - The height value.
   * @param {Uint8Array} data - The data value.
   */
  setData(width, height, data) {
    this.width = width
    this.height = height
    this.__data = data
    if (!this.__loaded) {
      this.__loaded = true
      this.emit('loaded', {})
    } else this.emit('updated', {})
  }

  /**
   * Returns all parameters and class state values(Including data).
   *
   * @return {object} - The return value.
   */
  getParams() {
    const params = super.getParams()
    params['data'] = this.__data
    return params
  }
}

Registry.register('DataImage2D', DataImage)
Registry.register('DataImage', DataImage)

export { DataImage }
