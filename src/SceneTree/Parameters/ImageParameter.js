import { Parameter } from './Parameter.js'
import { Registry } from '../../Registry'

/**
 * Represents a specific type of parameter, that only stores `BaseImage` values.
 *
 * i.e.:
 * ```javascript
 * // Since `Label` is a `BaseImage` implementation, it helps us with the example.
 * const label = new Label('My awesome label', 'LabelPack')
 * const imageParam = new ImageParameter('MyImage', label)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(imageParam)
 * ```
 *
 * @extends Parameter
 */
class ImageParameter extends Parameter {
  /**
   * Create an image parameter.
   *
   * @param {string} name - The name of the image parameter.
   * @param {BaseImage} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'BaseImage')
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    if (this.__value) {
      j.imageType = Registry.getBlueprintName(this.__value)
    }
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  fromJSON(j, context) {
    if (j.imageType) {
      this.__value = Registry.constructClass(j.imageType)
    }
    return super.fromJSON(j, context)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new image parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {ImageParameter} - Returns a new cloned image parameter.
   */
  clone() {
    const clonedParam = new ImageParameter(this.__name, this.__value)
    return clonedParam
  }
}

export { ImageParameter }
