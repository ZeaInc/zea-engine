import { Xfo } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Xfo transform parameter.
 * @extends Parameter
 */
class XfoParameter extends Parameter {
  /**
   * Create a Xfo parameter.
   * @param {string} name - The name of the Xfo parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Xfo(), 'Xfo')
  }

  /**
   * The clone method constructs a new Xfo parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {XfoParameter} - Returns a new Xfo parameter.
   */
  clone(flags) {
    const clonedParam = new XfoParameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { XfoParameter }
