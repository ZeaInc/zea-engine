import { Signal } from '../Utilities/index'
import { BaseItem } from './BaseItem.js'

import { BooleanParameter } from './Parameters/index'

/** Class representing a base image in the scene tree.
 * @extends BaseItem
 */
class BaseImage extends BaseItem {
  /**
   * Create a base image.
   * @param {string} name - The name of the base image.
   * @param {any} params - The parameters of the base image.
   */
  constructor(name) {
    super(name)
    this.width = 0
    this.height = 0
    this.format = 'RGB'
    this.type = 'UNSIGNED_BYTE'

    this.addParameter(new BooleanParameter('AlphaFromLuminance', false))
    this.addParameter(new BooleanParameter('Invert', false))
    this.addParameter(new BooleanParameter('FlipY', false))

    this.updated = this.parameterValueChanged

    // Note: Many parts of the code assume a 'loaded' signal.
    // We should probably deprecate and use only 'updated'.
    // Instead we should start using a loaded Promise.
    this.loaded = new Signal(true)
  }

  /**
   * Returns true if loaded.
   * @return {boolean} - Returns a boolean.
   */
  isLoaded() {
    return true
  }

  /**
   * The getMapping method.
   * @return {any} - The return value.
   */
  getMapping() {
    return this.__mapping
  }

  /**
   * The setMapping method
   * @param {any} mapping - The mapping value.
   */
  setMapping(mapping) {
    this.__mapping = mapping
  }

  /**
   * The isStream method.
   * @return {boolean} - Returns a boolean.
   */
  isStream() {
    return false
  }

  /**
   * The isStreamAtlas method.
   * @return {boolean} - Returns a boolean.
   */
  isStreamAtlas() {
    return this.__streamAtlas
  }

  /**
   * The getParams method.
   * @return {any} - The return value.
   */
  getParams() {
    return {
      type: this.type,
      format: this.format,
      width: this.width,
      height: this.height,
      flipY: this.getParameter('FlipY').getValue(),
      invert: this.getParameter('Invert').getValue(),
      alphaFromLuminance: this.getParameter('AlphaFromLuminance').getValue(),
    }
  }
}

export { BaseImage }
