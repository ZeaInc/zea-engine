import { Registry } from '../../Registry'
import { Mat4 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Mat4(4x4 matrix) values.
 *
 * i.e.:
 * ```javascript
 * const mat4Param = new Ma3Parameter('MyMat4', new Mat4(...args))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(mat4Param)
 * ```
 *
 * @extends Parameter
 */
class Mat4Parameter extends Parameter {
  /**
   * Create a Mat4 parameter.
   *
   * @param {string} name - The name of the Mat4 parameter.
   * @param {Mat4} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Mat4(), 'Mat4')
  }

  /**
   * Extracts a number value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    this.__value.readBinary(reader)
  }

  /**
   * The clone method constructs a new Mat4 parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {Mat4Parameter} - Returns a new cloned Mat4 parameter.
   */
  clone() {
    const clonedParam = new Mat4Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

Registry.register('Mat4Parameter', Mat4Parameter)

export { Mat4Parameter }
