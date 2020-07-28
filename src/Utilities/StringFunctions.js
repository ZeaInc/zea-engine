/**
 * String functions
 *
 */
class StringFunctions {
  /**
   * Replaces all matches in a string.
   *
   * @static
   * @param {string} str -
   * @param {string|RegExp} pattern -
   * @param {string} replacement -
   * @return {string} -
   */
  static replaceAll(str, pattern, replacement) {
    return str.replace(new RegExp(pattern, 'g'), replacement)
  }

  /**
   * Returns JSON object as a formatted string, but the numeric values are fixed to the specified precision.
   *
   * @static
   * @param {object} val -
   * @param {number} [space=0] -
   * @param {number} [precision=5] -
   * @return {string} -
   */
  static stringifyJSONWithFixedPrecision(val, space = 0, precision = 5) {
    return JSON.stringify(
      val,
      (key, val) => {
        return val ? (val.toFixed ? Number(val.toFixed(precision)) : val) : val
      },
      space
    )
  }

  /**
   * Transforms the given string into a numeric value.
   *
   * @static
   * @param {*} str -
   * @return {number} -
   */
  static hashStr(str) {
    let hash = 0
    let i
    let chr
    let len
    if (str.length === 0) return hash
    for (i = 0, len = str.length; i < len; i++) {
      chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}

export default StringFunctions
export { StringFunctions }
