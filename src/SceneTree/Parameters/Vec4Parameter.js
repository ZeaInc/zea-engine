import { Vec4 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Vec3(four-dimensional coordinate) values.
 *
 * i.e.:
 * ```javascript
 * const vec4Param = new Vec4Parameter('MyVec4', new Vec4(1.2, 3.4, 1, 4.2))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(vec4Param)
 * ```
 *
 * @extends Parameter
 */
class Vec4Parameter extends Parameter {
  /**
   * Create a Vec4 parameter.
   * @param {string} name - The name of the Vec4 parameter.
   * @param {Vec4} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Vec4(), 'Vec4')
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Extracts a number value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    this.__value.readBinary(reader)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new Vec4 parameter, copies its values
   * from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Vec4Parameter} - Returns a new Vec4 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec4Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec4Parameter }
