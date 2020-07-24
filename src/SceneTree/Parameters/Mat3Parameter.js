import { Mat3 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Mat3(3x3 matrix) values.
 *
 * i.e.:
 * ```javascript
 * const mat3Param = new Ma3Parameter('MyMat3', new Mat3(...args))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(mat3Param)
 * ```
 *
 * @extends Parameter
 */
class Mat3Parameter extends Parameter {
  /**
   * Create a Mat3 parameter.
   * @param {string} name - The name of the Mat3 parameter.
   * @param {Vec3} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Mat3(), 'Mat3')
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
   * The clone method constructs a new Mat3 parameter,
   * copies its values from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Mat3Parameter} - Returns a new cloned Mat3 parameter.
   */
  clone(flags) {
    const clonedParam = new Mat3Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Mat3Parameter }
