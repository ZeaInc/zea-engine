import { SystemDesc } from '../../BrowserDetection.js'
import { Async, Signal } from '../../Utilities/index'
import { BaseImage } from '../BaseImage.js'
import { FileImage } from './FileImage.js'

/** Class representing an HDR (high dynamic range) image mixer.
 * @extends BaseImage
 */
class HDRImageMixer extends BaseImage {
  /**
   * Create an HDR image mixer.
   * @param {string} name - The name value.
   * @param {boolean} stream - The stream value.
   */
  constructor(name, stream = true) {
    super({
      type: 'FLOAT',
      format: 'RGB',
      filter: SystemDesc.isMobileDevice ? 'NEAREST' : 'LINEAR',
    })

    this.__name = name
    this.__stream = stream
    this.__loaded = false
    this.__subImages = []
    this.__weights = []

    this.loaded = new Signal()
    this.updated = new Signal()
    this.weightsChanged = new Signal()
  }

  /**
   * The isLoaded method.
   * @return {any} - The return value.
   */
  isLoaded() {
    return this.__loaded
  }

  /**
   * The isStream method.
   * @return {any} - The return value.
   */
  isStream() {
    return this.__stream
  }

  /**
   * The setURLs method.
   * @param {any} urls - The urls value.
   */
  setURLs(urls) {
    const async = new Async()
    async.incAsyncCount(urls.length)
    async.ready.connect(() => {
      if (!this.__loaded) {
        this.__loaded = true
        this.loaded.emit()
      } else {
        this.updated.emit()
      }
    }, this)
    for (const fileUrl of urls) {
      const subImage = new FileImage(undefined, fileUrl)
      subImage.loaded.connect(async.decAsyncCount)
      subImage.updated.connect(this.updated.emit)
      this.__subImages.push(subImage)
      this.__weights.push(1.0)
    }
  }

  /**
   * The setURL method.
   * @param {number} index - The index value.
   * @param {any} url - The url value.
   */
  setURL(index, url) {
    this.__subImages[index].loadUrl(url)
  }

  /**
   * The setWeights method.
   * @param {any} weights - The weights value.
   */
  setWeights(weights) {
    this.__weights = weights
    if (this.__loaded) {
      this.weightsChanged.emit(this.__weights)
    }
  }

  /**
   * The setWeights method.
   * @param {number} index - The index value.
   * @param {any} weight - The weight value.
   */
  setWeight(index, weight) {
    this.__weights[index] = weight
    if (this.__loaded) {
      this.weightsChanged.emit(this.__weights)
    }
  }

  /**
   * The getParams method.
   * @return {any} - The return value.
   */
  getParams() {
    const params = super.getParams()
    if (this.__loaded) {
      params.subImages = this.__subImages
      params.weights = this.__weights
    }
    return params
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  toJSON(context, flags) {}

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(json, context, flags) {}
}

export { HDRImageMixer }
