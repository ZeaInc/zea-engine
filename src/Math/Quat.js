/* eslint-disable no-unused-vars */
import { AttrValue } from './AttrValue.js'
import { Vec3 } from './Vec3.js'
import { Mat3 } from './Mat3.js'
import { Mat4 } from './Mat4.js'
import { EulerAngles } from './EulerAngles.js'
import { typeRegistry } from './TypeRegistry.js'

/**
 * Class representing a quaternion. Quaternions are used to represent rotations
 * without encountering gimble lock. Based on complex numbers that are not easy
 * to understand intuitively.
 *
 * @extends AttrValue
 */
class Quat extends AttrValue {
  /**
   * Creates a quaternion.
   *
   * @param {number | ArrayBuffer | object} x - The angle of the x axis. Default is 0.
   * @param {number} y - The angle of the y axis. Default is 0.
   * @param {number} z - The angle of the z axis. Default is 0.
   * @param {number} w - The w value. Default is 1.
   */
  constructor(x = 0, y = 0, z = 0, w = 1) {
    super()

    if (x instanceof ArrayBuffer) {
      const buffer = x
      const byteOffset = y
      this.__data = new Float32Array(buffer, byteOffset, 4)
    } else {
      this.__data = new Float32Array(4)
      if (typeof x === 'object') {
        this.__data[0] = 0
        this.__data[1] = 0
        this.__data[2] = 0
        this.__data[3] = 1
        for (const key in x) {
          if (Array.isArray(x[key])) this[key].call(this, ...x[key])
          else this[key].call(this, x[key])
        }
      } else {
        this.__data[0] = x
        this.__data[1] = y
        this.__data[2] = z
        this.__data[3] = w
      }
    }
  }

  /**
   * Getter for `x` axis rotation.
   *
   * @return {number} - Returns the x axis rotation.
   */
  get x() {
    return this.__data[0]
  }

  /**
   * Setter for `x` axis rotation.
   *
   * @param {number} val - The val param.
   */
  set x(val) {
    this.__data[0] = val
  }

  /**
   * Getter for `y` axis rotation.
   *
   * @return {number} - Returns the y axis rotation.
   */
  get y() {
    return this.__data[1]
  }

  /**
   * Setter for `y` axis rotation.
   *
   * @param {number} val - The val param.
   */
  set y(val) {
    this.__data[1] = val
  }

  /**
   * Getter for `z` axis rotation.
   *
   * @return {number} - Returns the z axis rotation.
   */
  get z() {
    return this.__data[2]
  }

  /**
   * Setter for `z` axis rotation.
   *
   * @param {number} val - The val param.
   */
  set z(val) {
    this.__data[2] = val
  }

  /**
   * Getter for `w` value.
   *
   * @return {number} - Returns the w value.
   */
  get w() {
    return this.__data[3]
  }

  /**
   * Setter for `w`.
   * @param {number} val - The val param.
   */
  set w(val) {
    this.__data[3] = val
  }

  /**
   * Setter from scalar components.
   *
   * @param {number} x - The x axis rotation.
   * @param {number} y  - The y axis rotation.
   * @param {number} z  - The z axis rotation.
   * @param {number} w  - The w value.
   */
  set(x, y, z, w) {
    this.__data[0] = x
    this.__data[1] = y
    this.__data[2] = z
    this.__data[3] = w
  }

  /**
   * Sets the state of the Quat class using a Float32Array.
   *
   * @param {Float32Array} float32Array - The float32Array value.
   */
  setDataArray(float32Array) {
    this.__data = float32Array
  }

  /**
   * Setter from another vector.
   *
   * @param {Quat} other - The other vector to set from.
   */
  setFromOther(other) {
    this.__data[0] = other.x
    this.__data[1] = other.y
    this.__data[2] = other.z
    this.__data[3] = other.w
  }

  /**
   * Set this quat from a euler rotation.
   *
   * @param {EulerAngles} eulerAngles - The euler angles rotation.
   */
  setFromEulerAngles(eulerAngles) {
    const ordered = new Vec3()

    switch (eulerAngles.order) {
      case 0:
        /* 'XYZ' */
        ordered.set(eulerAngles.x, -eulerAngles.y, eulerAngles.z)
        break
      case 1:
        /* 'YZX' */
        ordered.set(eulerAngles.y, -eulerAngles.z, eulerAngles.x)
        break
      case 2:
        /* 'ZXY' */
        ordered.set(eulerAngles.z, -eulerAngles.x, eulerAngles.y)
        break
      case 3:
        /* 'XZY' */
        ordered.set(eulerAngles.x, eulerAngles.z, eulerAngles.y)
        break
      case 4:
        /* 'ZYX' */
        ordered.set(eulerAngles.z, eulerAngles.y, eulerAngles.x)
        break
      case 5:
        /* 'YXZ' */
        ordered.set(eulerAngles.y, eulerAngles.x, eulerAngles.z)
        break
      default:
        throw new Error('sdrty')
    }

    const ti = ordered.x * 0.5
    const tj = ordered.y * 0.5
    const tk = ordered.z * 0.5
    const ci = Math.cos(ti)
    const cj = Math.cos(tj)
    const ck = Math.cos(tk)
    const si = Math.sin(ti)
    const sj = Math.sin(tj)
    const sk = Math.sin(tk)
    const cc = ci * ck
    const cs = ci * sk
    const sc = si * ck
    const ss = si * sk
    const ai = cj * sc - sj * cs
    const aj = cj * ss + sj * cc
    const ak = cj * cs - sj * sc

    this.w = cj * cc + sj * ss

    switch (eulerAngles.order) {
      case 0:
        /* ' XYZ' */
        this.x = ai
        this.y = -aj
        this.z = ak
        break
      case 1:
        /* 'YZX' */
        this.x = ak
        this.y = ai
        this.z = -aj
        break
      case 2:
        /* 'ZXY' */
        this.x = -aj
        this.y = ak
        this.z = ai
        break
      case 3:
        /* 'XZY' */
        this.x = ai
        this.y = ak
        this.z = aj
        break
      case 4:
        /* 'ZYX' */
        this.x = ak
        this.y = aj
        this.z = ai
        break
      case 5:
        /* 'YXZ' */
        this.x = aj
        this.y = ai
        this.z = ak
        break
      default:
        throw new Error('sdrty')
    }
  }

  /**
   * Converts Quat to an EulerAngles
   *
   * @param {number | string} rotationOrder - The order in which the rotations are applied.
   * @return {EulerAngles} - The return value.
   */
  toEulerAngles(rotationOrder) {
    const ordered = new Vec3()
    switch (rotationOrder) {
      case 0:
        /* ' XYZ' */
        ordered.set(this.z, this.x, this.y)
        break
      case 1:
        /* 'YZX' */
        ordered.set(this.x, this.y, this.z)
        break
      case 2:
        /* 'ZXY' */
        ordered.set(this.y, this.z, this.x)
        break
      case 3:
        /* 'XZY' */
        ordered.set(this.y, -this.x, this.z)
        break
      case 4:
        /* 'ZYX' */
        ordered.set(this.x, -this.z, this.y)
        break
      case 5:
        /* 'YXZ' */
        ordered.set(this.z, -this.y, this.x)
        break
      default:
        throw new Error('Invalid rotation order:' + rotationOrder)
    }

    const euler = new Vec3()
    const test = ordered.x * ordered.y + ordered.z * this.w
    if (test > 0.49999) {
      // singularity at north pole
      euler.y = 2.0 * Math.atan2(ordered.x, this.w)
      euler.z = Math.PI * 0.5
      euler.x = 0.0
    } else if (test < -0.49999) {
      // singularity at south pole
      euler.y = -2.0 * Math.atan2(ordered.x, this.w)
      euler.z = Math.PI * -0.5
      euler.x = 0.0
    } else {
      const sqx = ordered.x * ordered.x
      const sqy = ordered.y * ordered.y
      const sqz = ordered.z * ordered.z
      euler.y = Math.atan2(
        2.0 * ordered.y * this.w - 2.0 * ordered.x * ordered.z,
        1.0 - 2.0 * sqy - 2.0 * sqz
      )
      euler.z = Math.asin(2.0 * test)
      euler.x = Math.atan2(
        2.0 * ordered.x * this.w - 2.0 * ordered.y * ordered.z,
        1.0 - 2.0 * sqx - 2.0 * sqz
      )
    }

    switch (rotationOrder) {
      case 0:
        /* ' XYZ' */
        return new EulerAngles(euler.y, euler.z, euler.x, rotationOrder)
      case 1:
        /* 'YZX' */
        return new EulerAngles(euler.x, euler.y, euler.z, rotationOrder)
      case 2:
        /* 'ZXY' */
        return new EulerAngles(euler.z, euler.x, euler.y, rotationOrder)
      case 3:
        /* 'XZY' */
        return new EulerAngles(-euler.y, euler.x, euler.z, rotationOrder)
      case 4:
        /* 'ZYX' */
        return new EulerAngles(euler.x, euler.z, -euler.y, rotationOrder)
      case 5:
        /* 'YXZ' */
        return new EulerAngles(euler.z, -euler.y, euler.x, rotationOrder)
    }
  }

  /**
   * Set this quat to a rotation defined by an axis and an angle (in radians).
   *
   * @param {Vec3} axis - The axis value.
   * @param {number} angle - The axis angle.
   */
  setFromAxisAndAngle(axis, angle) {
    const halfAngle = angle / 2.0
    const vec = axis.normalize().scale(Math.sin(halfAngle))
    this.set(vec.x, vec.y, vec.z, Math.cos(halfAngle))
  }

  /**
   * Scales and calculates the cross product of the `Vec3` and sets the result in the Mat3
   *
   * @param {Vec3} dir - The direction value.
   * @param {Vec3} up - The up angle.
   */
  setFromDirectionAndUpvector(dir, up) {
    const mat3 = new Mat3()
    mat3.setFromDirectionAndUpvector(dir, up)
    this.setFromMat3(mat3)
  }

  /**
   * Sets the state of the `Quat` from two `Vec3`.
   *
   * @param {Vec3} v0 - The v0 vector.
   * @param {Vec3} v1 - The v1 vector.
   */
  setFrom2Vectors(v0, v1) {
    v0.normalize()
    v1.normalize()
    const c = v0.cross(v1)
    const d = v0.dot(v1)
    const s = Math.sqrt((1 + d) * 2)
    // this.set( s/2, c.x / s, c.y / s, c.z / s );
    this.set(c.x / s, c.y / s, c.z / s, s / 2)
    this.normalizeInPlace()
  }

  /**
   * Set the quat from a Mat3.
   *
   * @param {Mat3} mat3 - The mat3 value.
   */
  setFromMat3(mat3) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    const fTrace = mat3.__data[0] + mat3.__data[4] + mat3.__data[8]
    let fRoot

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1) // 2w
      this.__data[3] = 0.5 * fRoot
      fRoot = 0.5 / fRoot // 1/(4w)
      this.__data[0] = (mat3.__data[5] - mat3.__data[7]) * fRoot
      this.__data[1] = (mat3.__data[6] - mat3.__data[2]) * fRoot
      this.__data[2] = (mat3.__data[1] - mat3.__data[3]) * fRoot
    } else {
      // |w| <= 1/2
      let i = 0
      if (mat3.__data[4] > mat3.__data[0]) i = 1
      if (mat3.__data[8] > mat3.__data[i * 3 + i]) i = 2
      const j = (i + 1) % 3
      const k = (i + 2) % 3

      fRoot = Math.sqrt(
        mat3.__data[i * 3 + i] -
          mat3.__data[j * 3 + j] -
          mat3.__data[k * 3 + k] +
          1.0
      )
      this.__data[i] = 0.5 * fRoot
      fRoot = 0.5 / fRoot
      this.__data[3] = (mat3.__data[j * 3 + k] - mat3.__data[k * 3 + j]) * fRoot
      this.__data[j] = (mat3.__data[j * 3 + i] + mat3.__data[i * 3 + j]) * fRoot
      this.__data[k] = (mat3.__data[k * 3 + i] + mat3.__data[i * 3 + k]) * fRoot
    }
    this.normalizeInPlace()
  }

  /**
   * Set the quat from a Mat4.
   *
   * @param {Mat4} mat4 - The mat4 value.
   */
  setFromMat4(mat4) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    const fTrace = mat4.__data[0] + mat4.__data[5] + mat4.__data[10]
    let fRoot

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1) // 2w
      this.__data[3] = 0.5 * fRoot
      fRoot = 0.5 / fRoot // 1/(4w)
      this.__data[0] = (mat4.__data[6] - mat4.__data[9]) * fRoot
      this.__data[1] = (mat4.__data[8] - mat4.__data[2]) * fRoot
      this.__data[2] = (mat4.__data[1] - mat4.__data[4]) * fRoot
    } else {
      // |w| <= 1/2
      let i = 0
      if (mat4.__data[5] > mat4.__data[0]) i = 1
      if (mat4.__data[10] > mat4.__data[i * 4 + i]) i = 2
      const j = (i + 1) % 3
      const k = (i + 2) % 3

      fRoot = Math.sqrt(
        mat4.__data[i * 4 + i] -
          mat4.__data[j * 4 + j] -
          mat4.__data[k * 4 + k] +
          1.0
      )
      this.__data[i] = 0.5 * fRoot
      fRoot = 0.5 / fRoot
      this.__data[3] = (mat4.__data[j * 4 + k] - mat4.__data[k * 4 + j]) * fRoot
      this.__data[j] = (mat4.__data[j * 4 + i] + mat4.__data[i * 4 + j]) * fRoot
      this.__data[k] = (mat4.__data[k * 4 + i] + mat4.__data[i * 4 + k]) * fRoot
    }
    this.normalizeInPlace()
  }

  /**
   * Checks if the angle of the Quat is less that ` Number.EPSILON`
   *
   * @return {boolean} - Returns true or false.
   */
  isIdentity() {
    return this.getAngle() < Number.EPSILON
  }

  /**
   * Return the angle of the Quat.
   *
   * @return {number} - The return value.
   */
  getAngle() {
    return Math.acos(this.w) * 2.0
  }

  /**
   * Returns true if this Quat is exactly the same as other.
   *
   * @param {Quat} other - The other Quat to compare with.
   * @return {boolean} - Returns true or false.
   */
  equal(other) {
    return this.x == other.x && this.y == other.y && this.z == other.z && this.w == other.w
  }

  /**
   * Returns true if this Quat is NOT exactly the same other.
   *
   * @param {Quat} other - The other Quat to compare with.
   * @return {boolean} - Returns true or false.
   */
  notEquals(other) {
    return this.x != other.x && this.y != other.y && this.z != other.z && this.w != other.w
  }

  /**
   * Returns true if this Quat is approximately the same as other
   * 
   * @param {Quat} other - The other Quat to compare with.
   * @param {number} precision - The precision to which the values must match.
   * @return {boolean} - Returns true or false.
   */
  approxEqual(other, precision = Number.EPSILON) {
    return (
      Math.abs(this.x - other.x) < precision &&
      Math.abs(this.y - other.y) < precision &&
      Math.abs(this.z - other.z) < precision &&
      Math.abs(this.w - other.w) < precision
    )
  }

  /**
   * Adds other to this Quat and return the result as a new Quat.
   *
   * @param {Quat} other - The other Quat to add.
   * @return {Quat} - Returns a new Quat.
   */
  add(other) {
    return new Quat(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.w + other.w
    )
  }

  /**
   * Adds other to this Quat.
   *
   * @param {Quat} other - The other Quat to add.
   */
  addInPlace(other) {
    this.x += other.x
    this.y += other.y
    this.z += other.z
    this.w += other.w
  }

  /**
   * Subtracts other from this Quat and returns the result as a new Quat.
   *
   * @param {Quat} other - The other Quat to subtract.
   * @return {Quat} - Returns a new Quat.
   */
  subtract(other) {
    return new Quat(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.w - other.w
    )
  }

  /**
   * Scales this Quat by scalar and returns the result as a new Quat.
   *
   * @param {number} scalar - The scalar value.
   * @return {Quat} - Returns a new Vec3.
   */
  scale(scalar) {
    return new Quat(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.w * scalar
    )
  }

  /**
   * Scales this Quat by scalar.
   *
   * @param {number} scalar - The scalar value.
   */
  scaleInPlace(scalar) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar
    this.w *= scalar
  }

  /**
   * Calculates the length of this Quat.
   *
   * @return {number} - Returns the length.
   */
  length() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const w = this.__data[3]
    return Math.sqrt(x * x + y * y + z * z + w * w)
  }

  /**
   * Calculates the squared length of this Quat.
   *
   * @return {number} - Returns the length.
   */
  lengthSquared() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const w = this.__data[3]
    return x * x + y * y + z * z + w * w
  }

  /**
   * Normalizes the Quat and returns it as a new Quat.
   *
   * @return {Quat} - Returns the Quat normalized.
   */
  normalize() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const w = this.__data[3]
    let len = x * x + y * y + z * z + w * w
    if (len < Number.EPSILON) {
      return new Quat()
    }

    // TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len)
    return new Quat(x * len, y * len, z * len)
  }

  /**
   * Normalizes the Quat, modifying it and returning it normalized.
   */
  normalizeInPlace() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const w = this.__data[3]
    let len = x * x + y * y + z * z + w * w
    if (len < Number.EPSILON) {
      return
    }
    len = 1 / Math.sqrt(len)
    this.set(x * len, y * len, z * len, w * len)
  }

  /**
   * Calculates the dot product of two Quats.
   *
   * @param {Quat} other - The other Quat to compare with.
   * @return {number} - Returns the dot product.
   */
  dot(other) {
    return (
      this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
    )
  }

  /**
   * Calculates the cross product of two Quats and returns the result as a new Quat.
   *
   * @param {Quat} other - The other Quat to calculate with.
   * @return {Quat} - Returns the cross product as a new Quat.
   */
  cross(other) {
    const ax = this.x
    const ay = this.y
    const az = this.z
    const at = this.w
    const bx = other.x
    const by = other.y
    const bz = other.z
    const bt = other.w

    return new Quat(
      ay * bz - az * by,
      az * bt - at * bz,
      at * bx - ax * bt,
      ax * by - ay * bx
    )
  }

  /**
   * Returns the rotational conjugate of this Quat.
   * Conjugation represents the same rotation of the Quat but
   * in the opposite direction around the rotational axis.
   *
   * @return {Quat} - the return value.
   */
  conjugate() {
    return new Quat(-this.x, -this.y, -this.z, this.w)
  }

  /**
   * Return the inverse of the `Quat`
   *
   * @return {Quat} - Returns a new Quat.
   */
  inverse() {
    return this.conjugate()
  }

  /**
   * Aligns this quaternion with another one ensuring that the delta between
   * the Quat values is the shortest path over the hypersphere.
   *
   *  @param {Quat} other - The other Quat to divide by.
   */
  alignWith(other) {
    if (this.dot(other) < 0.0) {
      this.set(-this.x, -this.y, -this.z, -this.w)
    }
  }

  // multiply(quat) {
  //     return new Quat(
  //         this.x * quat.w + this.w * quat.x + this.y * quat.z - this.z * quat.y,
  //         this.y * quat.w + this.w * quat.y + this.z * quat.x - this.x * quat.z,
  //         this.z * quat.w + this.w * quat.z + this.x * quat.y - this.y * quat.x,
  //         this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z
  //     );
  // }

  /**
   * Multiplies two Quats and returns the result as a new Quat.
   *
   * @param {Quat} other - The other Quat to multiply.
   * @return {Quat} - Returns a new Quat.
   */
  multiply(other) {
    const ax = this.__data[0]
    const ay = this.__data[1]
    const az = this.__data[2]
    const aw = this.__data[3]
    const bx = other.__data[0]
    const by = other.__data[1]
    const bz = other.__data[2]
    const bw = other.__data[3]

    return new Quat(
      ax * bw + aw * bx + ay * bz - az * by,
      ay * bw + aw * by + az * bx - ax * bz,
      az * bw + aw * bz + ax * by - ay * bx,
      aw * bw - ax * bx - ay * by - az * bz
    )
  }

  /**
   * Multiplies two Quats.
   *
   * @param {Quat} other - The other Quat to multiply.
   */
  multiplyInPlace(other) {
    const ax = this.__data[0]
    const ay = this.__data[1]
    const az = this.__data[2]
    const aw = this.__data[3]
    const bx = other.__data[0]
    const by = other.__data[1]
    const bz = other.__data[2]
    const bw = other.__data[3]

    this.set(
      ax * bw + aw * bx + ay * bz - az * by,
      ay * bw + aw * by + az * bx - ax * bz,
      az * bw + aw * bz + ax * by - ay * bx,
      aw * bw - ax * bx - ay * by - az * bz
    )
  }

  /**
   * Rotates a vector by this quaterion.
   * Don't forget to normalize the quaternion unless
   * you want axial translation as well as rotation.
   *
   * @param {Vec3} vec3 - The vec3 value.
   * @return {Vec3} - Returns a new Vec3.
   */
  rotateVec3(vec3) {
    const vq = new Quat(vec3.x, vec3.y, vec3.z, 0.0)
    const pq = this.multiply(vq).multiply(this.conjugate())
    return new Vec3(pq.x, pq.y, pq.z)
  }

  /**
   * Rotates a quaternion by the given angle about the X axis.
   *
   * @param {number} rad - Angle (in radians) to rotate.
   */
  rotateX(rad) {
    rad *= 0.5

    const ax = this.x
    const ay = this.y
    const az = this.z
    const aw = this.w
    const bx = Math.sin(rad)
    const bw = Math.cos(rad)

    this.x = ax * bw + aw * bx
    this.y = ay * bw + az * bx
    this.z = az * bw - ay * bx
    this.w = aw * bw - ax * bx
  }

  /**
   * Rotates a quaternion by the given angle about the Y axis.
   *
   * @param {number} rad - Angle (in radians) to rotate.
   */
  rotateY(rad) {
    rad *= 0.5

    const ax = this.x
    const ay = this.y
    const az = this.z
    const aw = this.w
    const by = Math.sin(rad)
    const bw = Math.cos(rad)

    this.x = ax * bw - az * by
    this.y = ay * bw + aw * by
    this.z = az * bw + ax * by
    this.w = aw * bw - ay * by
  }

  /**
   * Rotates a quaternion by the given angle about the Z axis.
   *
   * @param {number} rad - Angle (in radians) to rotate.
   */
  rotateZ(rad) {
    rad *= 0.5

    const ax = this.x
    const ay = this.y
    const az = this.z
    const aw = this.w
    const bz = Math.sin(rad)
    const bw = Math.cos(rad)

    this.x = ax * bw + ay * bz
    this.y = ay * bw - ax * bz
    this.z = az * bw + aw * bz
    this.w = aw * bw - az * bz
  }

  /**
   * Converts this Quat to a Mat3 (a 3x3 matrix).
   *
   * @return {Mat3} - TReturns a new Mat3.
   */
  toMat3() {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w
    const x2 = x + x
    const y2 = y + y
    const z2 = z + z
    const xx = x * x2
    const yx = y * x2
    const yy = y * y2
    const zx = z * x2
    const zy = z * y2
    const zz = z * z2
    const wx = w * x2
    const wy = w * y2
    const wz = w * z2

    const mat3 = new Mat3()
    mat3.__data[0] = 1 - yy - zz
    mat3.__data[3] = yx - wz
    mat3.__data[6] = zx + wy

    mat3.__data[1] = yx + wz
    mat3.__data[4] = 1 - xx - zz
    mat3.__data[7] = zy - wx

    mat3.__data[2] = zx - wy
    mat3.__data[5] = zy + wx
    mat3.__data[8] = 1 - xx - yy

    return mat3
  }

  /**
   * Returns the X axis of this quaternion.
   *
   * @return {Vec3} - Returns the X axis as a Vec3.
   */
  getXaxis() {
    const xy = this.x * this.y
    const xz = this.x * this.z
    const yy = this.y * this.y
    const yw = this.y * this.w
    const zz = this.z * this.z
    const zw = this.z * this.w

    return new Vec3(1.0 - 2.0 * (zz + yy), 2.0 * (xy + zw), 2.0 * (xz - yw))
  }

  /**
   * Returns the Y axis of this quaternion.
   *
   * @return {Vec3} - Returns the Y axis as a Vec3.
   */
  getYaxis() {
    const xx = this.x * this.x
    const xy = this.x * this.y
    const xw = this.x * this.w
    const yz = this.y * this.z
    const zz = this.z * this.z
    const zw = this.z * this.w

    return new Vec3(2.0 * (xy - zw), 1.0 - 2.0 * (zz + xx), 2.0 * (yz + xw))
  }

  /**
   * Returns the Z axis of this quaternion.
   *
   * @return {Vec3} - Returns the Z axis as a Vec3.
   */
  getZaxis() {
    const xx = this.x * this.x
    const xz = this.x * this.z
    const xw = this.x * this.w

    const yy = this.y * this.y
    const yz = this.y * this.z
    const yw = this.y * this.w
    const temp = new Vec3()

    return new Vec3(2.0 * (yw + xz), 2.0 * (yz - xw), 1.0 - 2.0 * (yy + xx))
  }

  /**
   * Reflects this quaternion according to the axis provided.
   *
   * @param {number} axisIndex - An integer with value of 0 for the X axis, 1 for the Y axis, and 2 for the Z axis.
   * @return {Quat} - Returns a new Quat.
   */
  mirror(axisIndex) {
    switch (axisIndex) {
      case 0:
        return new Quat(this.z, this.w, this.x, this.y)
      case 1:
        return new Quat(-this.w, this.z, this.y, -this.x)
      case 2:
        return new Quat(this.x, this.y, this.z, -this.w)
    }
  }

  /**
   * Converts this Quat to a Mat4 (a 4x4 matrix).
   *
   * @return {Mat4} - Returns a new Mat4.
   */
  toMat4() {
    const x = this.x
    const y = this.y
    const z = this.z
    const w = this.w
    const x2 = x + x
    const y2 = y + y
    const z2 = z + z
    const xx = x * x2
    const yx = y * x2
    const yy = y * y2
    const zx = z * x2
    const zy = z * y2
    const zz = z * z2
    const wx = w * x2
    const wy = w * y2
    const wz = w * z2

    // Set the columns
    const mat4 = new Mat4()
    mat4.__data[0] = 1 - yy - zz
    mat4.__data[4] = yx - wz
    mat4.__data[8] = zx + wy

    mat4.__data[1] = yx + wz
    mat4.__data[5] = 1 - xx - zz
    mat4.__data[9] = zy - wx

    mat4.__data[2] = zx - wy
    mat4.__data[6] = zy + wx
    mat4.__data[10] = 1 - xx - yy

    return mat4
  }

  /**
   * Performs a linear interpolation between two Quats.
   *
   * @param {Quat} other  - The other Quat to interpolate between.
   * @param {number} t - Interpolation amount between the two inputs.
   * @return {Quat} - Returns a new Quat.
   */
  lerp(other, t) {
    const result = new Quat(
      this.x + t * (other.x - this.x),
      this.y + t * (other.y - this.y),
      this.z + t * (other.z - this.z),
      this.w + t * (other.w - this.w)
    )
    result.normalizeInPlace()
    return result
  }

  // /**
  //  * Generates a random vector with the given scale.
  //  * @param {number} scale -  Length of the resulting vector. If ommitted, a unit vector will be returned.
  //  * @returns {vec4} - The return value.
  //  */
  // random(scale = 1.0) {
  //     const r = glMatrix.RANDOM() * 2.0 * Math.PI;
  //     const z = (glMatrix.RANDOM() * 2.0) - 1.0;
  //     const zScale = Math.sqrt(1.0 - z * z) * scale;

  //     out[0] = Math.cos(r) * zScale;
  //     out[1] = Math.sin(r) * zScale;
  //     out[2] = z * scale;
  //     return out;
  // }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new Quat.
   * @param {...object} ...args - The ...args param.
   * @return {Quat} - Returns a new Quat.
   * @private
   */
  static create(...args) {
    return new Quat(...args)
  }

  /**
   * Creates a new Quat to wrap existing memory in a buffer.
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {number} offset - The offset value.
   * @return {Quat} - Returns a new Quat.
   * @private
   */
  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Quat(buffer, offset * 4) // 4 bytes per 32bit float
  }

  /**
   * Returns the number of Float32 elements used by this type. Used to calculate storage requirements for large arrays of this type.
   * @return {number} - The return value.
   * @private
   */
  static numElements() {
    return 4
  }

  /**
   * Clones this Quat and returns a new Quat.
   *
   * @return {Quat} - Returns a new Quat.
   */
  clone() {
    return new Quat(
      this.__data[0],
      this.__data[1],
      this.__data[2],
      this.__data[3]
    )
  }

  // ///////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      w: this.w,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object.
   */
  fromJSON(j) {
    this.__data[0] = j.x
    this.__data[1] = j.y
    this.__data[2] = j.z
    this.__data[3] = j.w
    this.normalizeInPlace()
  }

  /**
   * Loads the state of the value from a binary reader.
   *
   * @param {BinReader} reader - The reader value.
   */
  readBinary(reader) {
    this.x = reader.loadFloat32()
    this.y = reader.loadFloat32()
    this.z = reader.loadFloat32()
    this.w = reader.loadFloat32()
  }
}

typeRegistry.registerType('Quat', Quat)

export { Quat }
