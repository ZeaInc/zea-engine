import { Registry } from '../../Registry'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Mat4(4x4 matrix) values.
 *
 * i.e.:
 * ```javascript
 * const stringParam = new StringParameter('MyString', 'A String value goes here')
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(stringParam)
 * ```
 *
 * @extends Parameter
 */
class StringParameter extends Parameter {
  /**
   * Create a string parameter.
   * @param {string} name - The name of the material color parameter.
   * @param {string} value - The value of the parameter.
   */
  constructor(name, value = '') {
    super(name, value, 'String')
    this.multiLine = false
  }

  /**
   * Sets flag that indicates if the string contains new line feeds.
   *
   * @param {boolean} multiLine - The multiLine value.
   */
  setMultiLine(multiLine) {
    this.multiLine = multiLine
  }

  /**
   * Returns multi-line flag value.
   *
   * @return {boolean} - The return value.
   */
  getMultiLine() {
    return this.multiLine
  }

  /**
   * Extracts the string value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    this.__value = reader.loadStr()
  }

  /**
   * The clone method constructs a new string parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {StringParameter} - Returns a new string parameter.
   */
  clone() {
    const clonedParam = new StringParameter(this.__name, this.__value)
    return clonedParam
  }
}

Registry.register('StringParameter', StringParameter)
Registry.register('Property_String', StringParameter)

export { StringParameter }
