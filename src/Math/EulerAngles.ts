import { AttrValue } from './AttrValue.js'
import { Registry } from '../Registry'

/**
 * Class representing euler angles. Euler angles describe rotating an object
 * around its various axis in a specified axis order.
 *
 * @extends AttrValue
 */
class EulerAngles extends AttrValue {
  order: any;
  /**
   * Create a euler angle. Receives the xyz values in degrees and the order that the rotations are applied.
   * <br>
   * Order parameter values: `XYZ: 0`, `YZX: 1`, `ZXY: 2`, `XZY: 3`, `ZYX: 4`, `YXZ: 5`
   * <br>
   * It could be either the `string` or the `number` value.
   *
   * @param {number} x - The angle of the x axis in degrees. Default is 0.
   * @param {number} y - The angle of the y axis in degrees. Default is 0.
   * @param {number} z - The angle of the z axis in degrees. Default is 0.
   * @param {number | string} order - The order in which the rotations are applied.
   */
  constructor(x = 0, y = 0, z = 0, order = 0) {
    super()

    if (!isNaN(order)) this.order = order
    else {
      switch (order) {
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'XYZ':
          this.order = 0
          break
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'YZX':
          this.order = 1
          break
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'ZXY':
          this.order = 2
          break
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'XZY':
          this.order = 3
          break
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'ZYX':
          this.order = 4
          break
        // @ts-expect-error ts-migrate(2678) FIXME: Type 'string' is not comparable to type 'number'.
        case 'YXZ':
          this.order = 5
          break
        default:
          throw new Error('Invalid Euler Angles Order:' + order)
      }
    }
    // @ts-expect-error ts-migrate(2358) FIXME: The left-hand side of an 'instanceof' expression m... Remove this comment to see the full error message
    if (x instanceof ArrayBuffer) {
      const buffer = x
      const byteOffset = y
      this.__data = new Float32Array(buffer, byteOffset, 4)
    } else {
      this.__data = new Float32Array(3)
      this.__data[0] = x
      this.__data[1] = y
      this.__data[2] = z
    }
  }

  /**
   * Getter for x axis rotation.
   *
   * @return {number} - Returns the x axis rotation.
   */
  get x() {
    return this.__data[0]
  }

  /**
   * Setter for x axis rotation.
   *
   * @param {number} val - The val param.
   */
  set x(val) {
    this.__data[0] = val
  }

  /**
   * Getter for y axis rotation.
   *
   * @return {number} - Returns the y axis rotation.
   */
  get y() {
    return this.__data[1]
  }

  /**
   * Setter for y axis rotation.
   *
   * @param {number} val - The val param.
   */
  set y(val) {
    this.__data[1] = val
  }

  /**
   * Getter for z axis rotation.
   *
   * @return {number} - Returns the z axis rotation.
   */
  get z() {
    return this.__data[2]
  }

  /**
   * Setter for z axis rotation.
   *
   * @param {number} val - The val param.
   */
  set z(val) {
    this.__data[2] = val
  }

  /**
   * Sets the EulerAngles
   *
   * @param {number} x - The x axis rotation.
   * @param {number} y  - The y axis rotation.
   * @param {number} z  - The z axis rotation.
   */
  set(x: any, y: any, z: any) {
    this.__data[0] = x
    this.__data[1] = y
    this.__data[2] = z
  }
}

Registry.register('EulerAngles', EulerAngles)

export { EulerAngles }
