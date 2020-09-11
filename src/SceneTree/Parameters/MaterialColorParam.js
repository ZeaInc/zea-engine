import { Registry } from '../../Registry'
import { ColorParameter } from './ColorParameter.js'
import { BaseImage } from '../BaseImage.js'

/**
 * Represents a specific type of parameter, that stores `Color` and `BaseImage` texture values.
 *
 * i.e.:
 * ```javascript
 * const image = new LDRImage();
 * image.getParameter('FilePath').setUrl("https://storage.googleapis.com/zea-playground-assets/zea-engine/texture.png")
 *
 * const matColorParam = new MaterialColorParam('MyMaterialColor', new Color(0, 254, 2))
 * matColorParam.setImage(image)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(matColorParam)
 * ```
 *
 * **Events**
 * * **valueChanged:** Triggered every time the Image value changes
 * * **textureDisconnected:** Triggered when Image value is cleaned/removed.
 * * **textureConnected:** Triggered when the Image value is set.
 *
 * @extends ColorParameter
 */
class MaterialColorParam extends ColorParameter {
  /**
   * Create a material color parameter.
   * @param {string} name - The name of the material color parameter.
   * @param {Color} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value)
    this.__imageUpdated = this.__imageUpdated.bind(this)
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
   * The __imageUpdated method.
   * @private
   */
  __imageUpdated() {
    this.emit('valueChanged', {})
  }

  /**
   * Sets `BaseImage` texture value in parameter.
   *
   * @param {BaseImage} value - The value param.
   */
  setImage(value) {
    const disconnectImage = () => {
      this.__image.off('loaded', this.__imageUpdated)
      this.__image.off('updated', this.__imageUpdated)
      this.__image = null
      this.emit('textureDisconnected', {})
    }
    if (value) {
      if (this.__image != undefined && this.__image !== value) {
        disconnectImage()
      }
      this.__image = value
      this.__image.on('updated', this.__imageUpdated)
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
   * Sets `Color` or the `BaseImage` texture value in parameter.
   *
   * @param {BaseImage|Color} value - The value param.
   */
  setValue(value) {
    // Note: instead of supporting images or colors, we should replace the ColorParameter with an ImageParameter when assigning textures
    // console.warn('@todo-review: Should we accept different type of values?')
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
   * Extracts `Color` and `Image` values from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.readBinary(reader, context)

    const textureName = reader.loadStr()
    if (textureName != '') {
      this.setImage(context.materialLibrary.getImage(textureName))
    }
  }

  /**
   * The clone method constructs a new material color parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {MaterialColorParam} - Returns a new cloned material color parameter.
   */
  clone() {
    const clonedParam = new MaterialColorParam(this.__name, this.__value.clone())
    return clonedParam
  }
}

Registry.register('MaterialColorParam', MaterialColorParam)

export { MaterialColorParam }
