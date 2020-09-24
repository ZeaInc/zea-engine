import { Parameter } from './Parameter.js'
import { Material } from '../Material.js'

/**
 * Represents a specific type of parameter, that only stores `Material` values.
 *
 * i.e.:
 * ```javascript
 * const material = new Material('itemMaterial', 'SimpleSurfaceShader')
 * material.getParameter('BaseColor').setValue(new Color(89 / 255, 182 / 255, 92 / 255))
 *
 * const materialParam = new MaterialParameter('MyMaterial', material)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(materialParam)
 * ```
 * **Events**
 * * **valueParameterValueChanged:** Triggered when parameter's value changes.
 * * **valueChanged:** Triggered when parameter's value changes, except on cleaning processes.
 *
 * @extends Parameter
 */
class MaterialParameter extends Parameter {
  /**
   * Create a material parameter.
   * @param {string} name - The name of the material parameter.
   * @param {Material} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'Material')
    this.__valueParameterValueChanged = this.__valueParameterValueChanged.bind(this)
  }

  // eslint-disable-next-line require-jsdoc
  __valueParameterValueChanged(event) {
    this.emit('valueParameterValueChanged', event)
  }

  /**
   * Sets `Material` value of the parameter.
   *
   * @param {Material} material - The material param.
   */
  setValue(material) {
    // 0 == normal set. 1 = changed via cleaner fn, 2 = change by loading/cloning code.
    if (this.__value !== material) {
      if (this.__value) {
        this.__value.off('parameterValueChanged', this.__valueParameterValueChanged)
      }
      this.__value = material
      if (this.__value) {
        this.__value.on('parameterValueChanged', this.__valueParameterValueChanged)
      }

      // During the cleaning process, we don't want notifications.
      this.emit('valueChanged', {})
    }
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
    let j
    if (this.__value) {
      j = {
        value: !context || !context.onlyPath ? this.__value.toJSON(context) : this.__value.getPath(),
      }
    }

    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }

    if (j.value instanceof Array || j.value instanceof String) {
      if (context && context.assetItem) {
        const materialLibrary = context.assetItem.getMaterialLibrary()
        const material = materialLibrary.getMaterial(j.value instanceof array ? j.value[1] : j.value)
        if (material) {
          this.loadValue(material)
        }
      }
    } else {
      const material = new Material()
      material.fromJSON(j.value, context)
      this.loadValue(material)
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new material parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {MaterialParameter} - Returns a new material parameter.
   */
  clone() {
    const clonedParam = new MaterialParameter(this.__name, this.__value)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    // Note: Some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // E.g. freeing GPU Memory.

    if (this.__value) {
      this.__value.off('parameterValueChanged', this.__valueParameterValueChanged)
    }
  }
}

export { MaterialParameter }
