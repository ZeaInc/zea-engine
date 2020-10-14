import { Registry } from '../../Registry'
import { Xfo } from '../../Math/index'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores `Xfo` transform values.
 *
 * ```javascript
 * const xfoParam = new XfoParameter('MyXfo', new Xfo(new Vec3(1.2, 3.4, 1)))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(xfoParam)
 * ```
 *
 * @extends Parameter
 */
class XfoParameter extends Parameter {
  /**
   * Create a Xfo parameter.
   * @param {string} name - The name of the Xfo parameter.
   * @param {Xfo} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Xfo(), 'Xfo')
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
   * The clone method constructs a new Xfo parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {XfoParameter} - Returns a new Xfo parameter.
   */
  clone() {
    const clonedParam = new XfoParameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

Registry.register('XfoParameter', XfoParameter)

export { XfoParameter }
