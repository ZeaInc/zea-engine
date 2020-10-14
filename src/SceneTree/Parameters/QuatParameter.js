import { Registry } from '../../Registry'
import { Quat } from '../../Math/index'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Vec3(four-dimensional coordinate) values.
 *
 * i.e.:
 * ```javascript
 * const quatParam = new QuatParameter('MyQuat', new Quat(1.2, 3.4, 1, 4.2))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(quatParam)
 * ```
 *
 * @extends Parameter
 */
class QuatParameter extends Parameter {
  /**
   * Create a Quat parameter.
   * @param {string} name - The name of the Quat parameter.
   * @param {Quat} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Quat(), 'Quat')
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
   * The clone method constructs a new Quat parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {QuatParameter} - Returns a new Quat parameter.
   */
  clone() {
    const clonedParam = new QuatParameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

Registry.register('QuatParameter', QuatParameter)

export { QuatParameter }
