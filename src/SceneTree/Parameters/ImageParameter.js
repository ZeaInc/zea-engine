import { Signal } from '../../Utilities/index'
import { Parameter } from './Parameter.js'
import { sgFactory } from '../SGFactory.js'

/** Class representing an image parameter.
 * @extends Parameter
 */
class ImageParameter extends Parameter {
  /**
   * Create an image parameter.
   * @param {string} name - The name of the image parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'BaseImage')
    this.valueParameterValueChanged = new Signal()
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags)
    if (this.__value) {
      j.imageType = this.__value.constructor.name
    }
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  fromJSON(j, context, flags) {
    if (j.imageType) {
      this.__value = sgFactory.constructClass(j.imageType)
    }
    return super.fromJSON(j, context, flags)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new image parameter,
   * copies its values from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {ImageParameter} - Returns a new cloned image parameter.
   */
  clone(flags) {
    const clonedParam = new ImageParameter(this.__name, this.__value)
    return clonedParam
  }
}

export { ImageParameter }
