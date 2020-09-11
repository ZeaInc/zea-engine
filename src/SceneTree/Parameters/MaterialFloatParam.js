import { Registry } from '../../Registry'
import { NumberParameter } from './NumberParameter.js'
import { BaseImage } from '../BaseImage.js'

/**
 * Represents a specific type of parameter, that stores `number` and `BaseImage` texture values.
 *
 * i.e.:
 * ```javascript
 * const image = new LDRImage();
 * image.getParameter('FilePath').setUrl("https://storage.googleapis.com/zea-playground-assets/zea-engine/texture.png")
 *
 * const numberParam = new MaterialFloatParam('MyMaterialFloat', 15.5)
 * numberParam.setImage(image)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(numberParam)
 * ```
 *
 * * **Events**
 * * **valueChanged:** Triggered every time the Image value changes
 * * **textureDisconnected:** Triggered when Image value is cleaned/removed.
 * * **textureConnected:** Triggered when the Image value is set.
 *
 * @extends NumberParameter
 */
class MaterialFloatParam extends NumberParameter {
  /**
   * Create a material float parameter.
   * @param {string} name - The name of the material color parameter.
   * @param {number} value - The value of the parameter.
   * @param {array} range - An array with two numbers. If defined, the parameter value will be clamped.
   */
  constructor(name, value, range) {
    super(name, value, range)
  }

  /**
   * Returns `BaseImage` texture of the Material.
   *
   * @return {BaseImage} - The return value.
   */
  getImage() {
    return this.__image
  }

  /**
   * Sets `BaseImage` texture value in parameter.
   *
   * @param {BaseImage} value - The value value.
   */
  setImage(value) {
    const disconnectImage = () => {
      // image.off('loaded', imageUpdated);
      // image.off('updated', imageUpdated);
      this.emit('textureDisconnected', {})
    }
    if (value) {
      if (this.__image != undefined && this.__image !== value) {
        disconnectImage()
      }
      this.__image = value
      // image.on('loaded', imageUpdated);
      // image.on('updated', imageUpdated);
      this.emit('textureConnected', {})
      this.emit('valueChanged', { mode: 0 })
    } else {
      if (this.__image != undefined) {
        disconnectImage()
        this.__image = undefined
        this.emit('textureDisconnected', {})
      }
    }
  }

  /**
   * Sets `number` or the `BaseImage` texture value in parameter.
   *
   * @param {number} value - The value param.
   */
  setValue(value) {
    if (value instanceof BaseImage) {
      this.setImage(value)
    } else {
      if (this.__image != undefined) {
        this.setImage(undefined)
      }
      super.setValue(value)
    }
  }

  /**
   * Extracts `number` and `Image` values from a buffer, updating current parameter state.
   *
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.readBinary(reader, context)

    const textureName = reader.loadStr()
    if (textureName != '') {
      console.log('Load Texture')
      this.setImage(context.materialLibrary.getImage(textureName))
    }
  }

  /**
   * The clone method constructs a new material float parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {MaterialFloatParam} - Returns a new cloned material float parameter.
   */
  clone() {
    const clonedParam = new MaterialFloatParam(this.__name, this.__value.clone())
    return clonedParam
  }
}

Registry.register('MaterialFloatParam', MaterialFloatParam)

export { MaterialFloatParam }
