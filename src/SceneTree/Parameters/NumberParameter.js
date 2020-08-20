import Registry from '../../Registry'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores numeric values.
 *
 * ```javascript
 * const numberParam = new NumberParameter('MyNumber', 15)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(numberParam)
 * ```
 *
 * @extends Parameter
 */
class NumberParameter extends Parameter {
  /**
   * Create a number parameter.
   * @param {string} name - The name of the number parameter.
   * @param {number} value - The value of the parameter.
   * @param {array} range - An array with two numbers. If defined, the parameter value will be clamped.
   * @param {number} step - The step value. If defined, the parameter value will be rounded to the nearest integer.
   */
  constructor(name, value = 0, range = undefined, step = undefined) {
    super(name, value, 'Number')
    // The value might not have a range.
    if (range && !Array.isArray(range)) console.error('Range value must be an array of 2 numbers.')
    this.__range = range
    this.__step = step
  }

  /**
   * Returns the range to which the parameter is restrained.
   *
   * @return {array} - The return value.
   */
  getRange() {
    return this.__range
  }

  /**
   * Sets the range to which the parameter is restrained.
   *
   * @param {array} range - The range value.
   */
  setRange(range) {
    // Should be an array [0, 20]
    this.__range = range
  }

  /**
   * Returns the step number, which is the one used for rounding.
   *
   * @return {number} - The return value.
   */
  getStep() {
    return this.__step
  }

  /**
   * Returns step value.
   *
   * @param {number} step - The step value.
   */
  setStep(step) {
    this.__step = step
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
    const j = super.toJSON(context)
    if (this.__range) j.range = this.__range
    if (this.__step) j.step = this.__step
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)
    if (j.range) this.__range = j.range
    if (j.step) this.__step = j.step
  }

  /**
   * Extracts a number value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    this.__value = reader.loadFloat32()
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new number parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {NumberParameter} - Returns a new number parameter.
   */
  clone() {
    const clonedParam = new NumberParameter(this.__name, this.__value)
    clonedParam.__range = this.__range
    clonedParam.__step = this.__step
    return clonedParam
  }
}

Registry.register('NumberParameter', NumberParameter)
Registry.register('Property_SInt32', NumberParameter)
Registry.register('Property_UInt32', NumberParameter)
Registry.register('Property_Float32', NumberParameter)

export default NumberParameter
export { NumberParameter }
