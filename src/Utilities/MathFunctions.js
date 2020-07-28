const UInt8 = 0
const SInt8 = 1
const UInt16 = 2
const SInt16 = 3
const UInt32 = 4
const SInt32 = 5
const Float32 = 6

/**
 * Math Functions
 */
class MathFunctions {
  /**
   * Converts Radians to Degrees
   *
   * @static
   * @param {number} rad - Radians value
   * @return {number} - Degrees equivalent
   */
  static radToDeg(rad) {
    return rad / (Math.PI / 180)
  }

  /**
   * Converts Degrees to Radiants
   *
   * @static
   * @param {number} deg - Degrees value
   * @return {number} -  Radians equivalent
   */
  static degToRad(deg) {
    return deg * (Math.PI / 180)
  }

  /**
   * Verifies if the specified parameter is numeric.
   *
   * @static
   * @param {number|any} number - Number to test
   * @return {boolean} - `true` when is a valid number
   */
  static isNumeric(number) {
    return !isNaN(parseFloat(number)) && isFinite(number)
  }

  /**
   * Generates and returns a random integer within the specified range.
   *
   * @static
   * @param {number} min - Lower value random int can be.
   * @param {number} max - Highest value random int can be.
   * @return {number} - Random number inside range.
   */
  static randomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }

  /**
   * Calculates a lineal interpolation between two inputs for the specified parameter(t).
   *
   * @static
   * @param {number} v0 -
   * @param {number} v1 -
   * @param {number} t -
   * @return {number} -
   */
  static lerp(v0, v1, t) {
    return v0 + t * (v1 - v0)
  }

  /**
   * Restricts the specified value between two numbers
   *
   * @static
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  /**
   * Returns the nearest pow of two value of the specified number.
   *
   * @static
   * @param {number} value -
   * @return {number} -
   */
  static nearestPow2(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)))
  }

  /**
   * Returns the nearest pow of ten value of the specified number.
   *
   * @static
   * @param {number} value -
   * @return {number} -
   */
  static nearestPow10(value) {
    return Math.pow(10, Math.round(Math.log10(value) / Math.log10(10)))
  }

  /**
   * Returns the next pow of two value of the specified number.
   *
   * @static
   * @param {number} value -
   * @return {number} -
   */
  static nextPow2(value) {
    let exp = 0

    while (value > 0) {
      exp++
      value = value >> 1
    }

    return 1 << exp
  }

  /**
   * Returns the fractional component of a number
   *
   * @static
   * @param {number} value -
   * @return {number} -
   */
  static fract(value) {
    if (value == 0) return 0
    if (value < 0) {
      if (value > -1.0) return -value
      return -value % Math.floor(-value)
    }
    if (value < 1.0) return value
    return value % Math.floor(value)
  }

  /**
   * Moves the specified value from one numeric domain(range) to another.
   *
   * @static
   * @param {number} value -
   * @param {number} start1 -
   * @param {number} end1 -
   * @param {number} start2 -
   * @param {number} end2 -
   * @return {number} -
   */
  static remap(value, start1, end1, start2, end2) {
    return start2 + (end2 - start2) * ((value - start1) / (end1 - start1))
  }

  /**
   * Perform Hermite interpolation between two values
   *
   * @static
   * @param {number} edge0 -
   * @param {number} edge1 -
   * @param {number} x -
   * @return {number} -
   */
  static smoothStep(edge0, edge1, x) {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)
  }

  /**
   * Performs - interpolation between two values
   *
   * @static
   * @param {number} edge0 -
   * @param {number} edge1 -
   * @param {number} x -
   * @return {number} -
   */
  static linStep(edge0, edge1, x) {
    return this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
  }

  /**
   * Decodes a Float16 from two unsigned Int8
   *
   * @static
   * @param {Uint8Array} c - Array with the two UInt8
   * @return {number} - Decoded Float16
   */
  static decode16BitFloatFrom2xUInt8(c) {
    const ix = c[0] // 1st byte: 1 bit signed num, 4 bits exponent, 3 bits mantissa (MSB)
    const iy = c[1] // 2nd byte: 8 bit mantissa (LSB)

    const s = ix & 0x80 ? 1 : -1 // get bit 8
    const iexp = (ix & 0x78) >> 3 // mask bits 7-4
    const msb = ix & 0x7 // mask bits 3-1

    let norm = iexp == 0 ? 0 : 2048 // distinguish between normalized and sub-normalized numbers
    const mantissa = norm + (msb << 8) + iy // implicit preceding 1 or 0 added here
    norm = iexp == 0 ? 1 : 0 // normalization toggle
    const exponent = Math.pow(2, iexp + norm - 16) // -5 for the the exponent bias from 2^-5 to 2^10 plus another -11 for the normalized 12 bit mantissa
    const v = s * mantissa * exponent

    return v
  }

  /**
   * Encodes an array of two unsigned Int8 to a Float16
   *
   * @static
   * @param {number} v - Float16 number
   * @return {Uint8Array} - Encoded Unsigned Int8 array
   */
  static encode16BitFloatInto2xUInt8(v) {
    const c = new Uint8Array(2)
    // const c = [0, 0];
    const signum = v >= 0 ? 128 : 0
    v = Math.abs(v)
    let exponent = 15
    let limit = 1024 // considering the bias from 2^-5 to 2^10 (==1024)
    for (let exp = 15; exp > 0; exp--) {
      if (v < limit) {
        limit /= 2
        exponent--
      }
    }

    let rest
    if (exponent == 0) {
      rest = v / limit / 2 // "sub-normalize" implicit preceding 0.
    } else {
      rest = (v - limit) / limit // normalize accordingly to implicit preceding 1.
    }

    const mantissa = Math.round(rest * 2048) // 2048 = 2^11 for the (split) 11 bit mantissa
    const msb = mantissa / 256 // the most significant 3 bits go into the lower part of the first byte
    const lsb = mantissa - msb * 256 // there go the other 8 bit of the lower significance

    c[0] = signum + exponent * 8 + msb // color normalization for texture2D
    c[1] = lsb

    if (v >= 2048) {
      c[0] = 255
    }

    return c
  }

  /**
   * Transforms a 16 bit float to an encoded integer.
   *
   * @static
   * @param {number} v - Float16 number to encode
   * @return {number} - Encoded number
   */
  static encode16BitFloat(v) {
    const float32Array = new Float32Array(1)
    float32Array[0] = v
    const int32View = new Int32Array(float32Array.buffer)

    const toUInt16 = (x) => {
      let bits = (x >> 16) & 0x8000 /* Get the sign */
      let m = (x >> 12) & 0x07ff /* Keep one extra bit for rounding */
      const e = (x >> 23) & 0xff /* Using int is faster here */

      /* If zero, or de-normal, or exponent underflows too much for a de-normal
       * half, return signed zero. */
      if (e < 103) {
        return bits
      }

      /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
      if (e > 142) {
        bits |= 0x7c00
        /* If exponent was 0xff and one mantissa bit was set, it means NaN,
         * not Inf, so make sure we set one mantissa bit too. */
        bits |= (e == 255 ? 0 : 1) && x & 0x007fffff
        return bits
      }

      /* If exponent underflows but not too much, return a de-normal */
      if (e < 113) {
        m |= 0x0800
        /* Extra rounding may overflow and set mantissa to 0 and exponent
         * to 1, which is OK. */
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1)
        return bits
      }

      bits |= ((e - 112) << 10) | (m >> 1)
      /* Extra rounding. An overflow will set mantissa to 0 and increment
       * the exponent, which is OK. */
      bits += m & 1

      return bits
    }

    return toUInt16(int32View[0])
  }

  /**
   * As opposite of the `encode16BitFloat` method, this takes an encoded integer value,
   * and returns the 16 bit float.
   *
   * @static
   * @param {number} h - Encoded integer
   * @return {number} - Decoded 16 bit float.
   */
  static decode16BitFloat(h) {
    const s = (h & 0x8000) >> 15
    const e = (h & 0x7c00) >> 10
    const f = h & 0x03ff

    if (e == 0) {
      return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10))
    } else if (e == 0x1f) {
      return f ? NaN : (s ? -1 : 1) * Infinity
    }

    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10))
  }

  /**
   * Transforms an array of Float 32 to an array of unsigned Int16.
   *
   * @static
   * @param {Float32Array} float32Array -
   * @return {Uint16Array} - Unsigned Int16 array representative of the Float32Array
   */
  static convertFloat32ArrayToUInt16Array(float32Array) {
    const unit16s = new Uint16Array(float32Array.length)
    const int32View = new Int32Array(float32Array.buffer)
    const toUInt16 = (x) => {
      let bits = (x >> 16) & 0x8000 /* Get the sign */
      let m = (x >> 12) & 0x07ff /* Keep one extra bit for rounding */
      const e = (x >> 23) & 0xff /* Using int is faster here */

      /* If zero, or de-normal, or exponent underflows too much for a de-normal
       * half, return signed zero. */
      if (e < 103) {
        return bits
      }

      /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
      if (e > 142) {
        bits |= 0x7c00
        /* If exponent was 0xff and one mantissa bit was set, it means NaN,
         * not Inf, so make sure we set one mantissa bit too. */
        bits |= (e == 255 ? 0 : 1) && x & 0x007fffff
        return bits
      }

      /* If exponent underflows but not too much, return a de-normal */
      if (e < 113) {
        m |= 0x0800
        /* Extra rounding may overflow and set mantissa to 0 and exponent
         * to 1, which is OK. */
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1)
        return bits
      }

      bits |= ((e - 112) << 10) | (m >> 1)
      /* Extra rounding. An overflow will set mantissa to 0 and increment
       * the exponent, which is OK. */
      bits += m & 1

      return bits
    }
    for (let i = 0; i < float32Array.length; i++) {
      unit16s[i] = toUInt16(int32View[i])
    }
    return unit16s
  }
}

export default MathFunctions
export { UInt8, SInt8, SInt16, UInt16, SInt32, UInt32, Float32, MathFunctions }
