import { Signal } from '../../Utilities/index'
import { RefCounted } from '../RefCounted.js'
import { VLHImage } from './VLHImage.js'

/** Class representing a lightmap.
 * @extends RefCounted
 */
class Lightmap extends RefCounted {
  /**
   * Create a lightmap.
   * @param {any} filepath - The filepath value.
   * @param {any} asset - The asset value.
   * @param {any} atlasSize - The atlasSize value.
   * @param {any} stream - The stream value.
   */
  constructor(filepath, asset, atlasSize, stream) {
    super()
    this.atlasSize = atlasSize
    this.image = new VLHImage('Lightmap', { stream })
    this.image.getParameter('FilePath').setFilepath(filepath)
    this.image.setHDRTint(asset.getParameter('LightmapTint').getValue())
    this.__stream = stream
  }

  /**
   * Getter for width.
   */
  get width() {
    return this.atlasSize[0]
  }

  /**
   * Getter for height.
   */
  get height() {
    return this.atlasSize[1]
  }

  /**
   * The isStream method.
   * @return {any} - The return value.
   */
  isStream() {
    return this.__stream
  }

  /**
   * The loadResource method.
   * @param {any} filepath - The filepath value.
   */
  loadResource(filepath) {
    this.image.loadResource(filepath)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   */
  fromJSON(j) {
    this.__atlasSize = j.atlasSize
  }
}

/** Class representing a lightmap mixer.
 * @extends ParameterOwner
 */
class LightmapMixer extends RefCounted {
  /**
   * Create a lightmap mixer
   * @param {any} atlasSize - The atlasSize value.
   */
  constructor(atlasSize) {
    super()
    this.atlasSize = atlasSize
    this.__images = []
    this.__weights = []
    this.__stream = false
    this.lightmapAdded = new Signal()
    this.lightmapResourceChanged = new Signal()
    this.lightmapWeightChanged = new Signal()
  }

  /**
   * Getter for width.
   */
  get width() {
    return this.atlasSize[0]
  }

  /**
   * Getter for height.
   */
  get height() {
    return this.atlasSize[1]
  }

  /**
   * The isStream method.
   * @return {any} - The return value.
   */
  isStream() {
    return this.__stream
  }

  /**
   * The loadResource method.
   * @param {number} index - The index value.
   * @param {string} resourceName - The resourceName value.
   * @param {any} weight - The weight value.
   * @param {boolean} stream - The stream value.
   */
  loadResource(index, resourceName, weight = undefined, stream = false) {
    if (!this.__images[index]) {
      this.__images[index] = new FileImage(resourceName, { stream })
      this.__weights[index] = weight ? weight : 1.0
      this.lightmapAdded.emit(index)
    } else {
      this.__images[index].loadResource(resourceName)
      this.lightmapResourceChanged.emit(index, weight)
      if (weight) {
        this.__weights[index] = weight
        this.lightmapWeightChanged.emit(index, weight)
      }
    }
    this.__stream |= stream
  }

  /**
   * The setWeight method.
   * @param {number} index - The index value.
   * @param {any} weight - The weight value.
   */
  setWeight(index, weight) {
    this.__weights[index] = weight
    this.lightmapWeightChanged.emit(index, weight)
  }

  /**
   * The numSubImages method.
   * @return {any} - The return value.
   */
  numSubImages() {
    return this.__images.length
  }

  /**
   * The getSubImage method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getSubImage(index) {
    return this.__images[index]
  }

  /**
   * The getSubImageWeight method.
   * @param {value} index - The index value.
   * @return {any} - The return value.
   */
  getSubImageWeight(index) {
    return this.__weights[index]
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   */
  fromJSON(j) {
    this.__atlasSize = j['atlasSize']
  }
}

export { Lightmap, LightmapMixer }
