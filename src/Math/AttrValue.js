// eslint-disable-next-line camelcase
import StringFunctions from '../Utilities/StringFunctions'

/**
 * Base class for Math types that can be stored in vertex attributes.
 * <br>
 * **Note:** These values use {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array|Float32Array} values to store their data.
 */
class AttrValue {
  /**
   * Verifies if the values stored in this Math type are valid numeric values.
   * Returns `false` If at least one of the values is either {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Referencia/Objetos_globales/Infinity|Infinity} or
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Referencia/Objetos_globales/NaN|NaN}.
   *
   * @return {boolean} - Returns the result as a boolean.
   */
  isValid() {
    for (const v of this.__data) {
      if (v == Infinity || isNaN(v)) return false
    }

    return true
  }

  /**
   * This method is a factory function for creating new instances of math types, given an existing Float32Array buffer.
   * Each Math type implements this function to return an constructed value.
   *
   * @param {ArrayBuffer} buffer - the buffer value.
   * @param {number} offset - the offset value.
   * @return {AttrValue} - Returns the constructed value.
   */
  static createFromFloat32Buffer(buffer, offset) {
    throw new Error(
      'Not yet implemented for this type:' + this.constructor.name
    )
  }

  /**
   * Returns the number of Float32 elements used by this type. Used to calculate storage requirements for large arrays of this type.
   * @return {number} - Returns the number of float values stored in this math type.
   */
  static numElements() {
    throw new Error(
      'Not yet implemented for this type:' + this.constructor.name
    )
  }

  /**
   * Returns current Math type data as array. Often used to pass types to the GPU.
   *
   * @return {array} - Returns the result as an array.
   */
  asArray() {
    return this.__data
  }

  /**
   * Converts this Math type to a string in JSON format.
   *
   * @return {string} - The return value.
   */
  toString() {
    // eslint-disable-next-line new-cap
    return StringFunctions.stringifyJSONWithFixedPrecision(this.toJSON())
  }

  /**
   * Converts this Math type to a JSON object.
   * @return {object} - The json object.
   */
  toJSON() {
    throw new Error(
      'Not yet implemented for this type:' + this.constructor.name
    )
  }
}

export { AttrValue }
export default AttrValue
