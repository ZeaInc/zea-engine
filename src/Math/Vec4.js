import { AttrValue } from './AttrValue.js';
import { typeRegistry } from './TypeRegistry.js';
import { Vec3 } from './Vec3.js';

class Vec4 extends AttrValue {
  constructor(x = 0, y = 0, z = 0, t = 0) {
    super();

    if (x instanceof ArrayBuffer) {
      const buffer = x;
      const byteOffset = y;
      this.__data = new Float32Array(buffer, byteOffset, 4);
    } else if (x != null && typeof x == 'object') {
      this.__data = new Float32Array(4);
      this.fromJSON(x);
    } else {
      this.__data = new Float32Array(4);
      this.__data[0] = x;
      this.__data[1] = y;
      this.__data[2] = z;
      this.__data[3] = t;
    }
  }

  get x() {
    return this.__data[0];
  }

  set x(val) {
    this.__data[0] = val;
  }

  get y() {
    return this.__data[1];
  }

  set y(val) {
    this.__data[1] = val;
  }

  get z() {
    return this.__data[2];
  }

  set z(val) {
    this.__data[2] = val;
  }

  get t() {
    return this.__data[3];
  }

  set t(val) {
    this.__data[3] = val;
  }

  // Setter from scalar components
  set(x, y, z, t) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.t = t;
  }

  // Setter from scalar components
  setFromOther(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    this.t = other.t;
  }

  // Returns true if this vector is the same as another one
  equal(other, precision) {
    return (
      this.x == other.x &&
      this.y == other.y &&
      this.z == other.z &&
      this.t == other.t
    );
  }

  // Returns true if this vector is the same as another one
  notequals(other, precision) {
    return (
      this.x != other.x &&
      this.y != other.y &&
      this.z != other.z &&
      this.t != other.t
    );
  }

  // Returns true if this vector is the same as another one
  // (given a precision)
  approxEqual(other) {
    return (
      Math.abs(this.x - other.x) < Number.EPSILON &&
      Math.abs(this.y - other.y) < Number.EPSILON &&
      Math.abs(this.z - other.z) < Number.EPSILON &&
      Math.abs(this.t - other.t) < Number.EPSILON
    );
  }

  // Returns a new vector which is this vector added to other
  add(other) {
    return new Vec4(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.t + other.t
    );
  }

  addInPlace(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    this.t += other.t;
  }

  // Returns a new vector which is this vector subtracted from other
  subtract(other) {
    return new Vec4(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.t - other.t
    );
  }

  subtractInPlace(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    this.t -= other.t;
  }

  multiply(other) {
    return new Vec4(
      this.x * other.x,
      this.y * other.y,
      this.z * other.z,
      this.t * other.t
    );
  }

  multiplyInPlace(other) {
    this.x *= other.x;
    this.y *= other.y;
    this.z *= other.z;
    this.t *= other.t;
  }

  divide(other) {
    return new Vec4(
      this.x / other.x,
      this.y / other.y,
      this.z / other.z,
      this.t / other.t
    );
  }

  divideInPlace(other) {
    this.x /= other.x;
    this.y /= other.y;
    this.z /= other.z;
    this.t /= other.t;
  }

  // Returns a new vector which is this vector scaled by scalar
  scale(scalar) {
    return new Vec4(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.t * scalar
    );
  }

  scaleInPlace(scalar) {
    this.set(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.t * scalar
    );
  }

  /**
   * Calculates the length of a vec4
   *
   * @param {vec4} a vector to calculate length of
   * @return {Number} length of a
   */
  length(a) {
    const x = this.__data[0];
    const y = this.__data[1];
    const z = this.__data[2];
    const t = this.__data[2];
    return Math.sqrt(x * x + y * y + z * z + t * t);
  }

  /**
   * Calculates the squared length of a vec4
   *
   * @param {vec4} a vector to calculate squared length of
   * @return {Number} squared length of a
   */
  lengthSquared() {
    const x = this.__data[0];
    const y = this.__data[1];
    const z = this.__data[2];
    const t = this.__data[3];
    return x * x + y * y + z * z + t * t;
  }

  /**
   * Returns the vector normalized
   *
   */
  normalize() {
    const x = this.__data[0];
    const y = this.__data[1];
    const z = this.__data[2];
    const t = this.__data[3];
    let len = x * x + y * y + z * z + t * t;
    if (len < Number.EPSILON) {
      return new Vec4();
    }

    // TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
    return new Vec4(x * len, y * len, z * len);
  }

  normalizeInPlace() {
    const x = this.__data[0];
    const y = this.__data[1];
    const z = this.__data[2];
    const t = this.__data[3];
    let len = x * x + y * y + z * z + t * t;
    if (len < Number.EPSILON) {
      return;
    }
    len = 1 / Math.sqrt(len);
    this.set(x * len, y * len, z * len, t * len);
  }

  /**
   * Calculates the dot product of two vec4's
   *
   * @param {vec4} a the first operand
   * @param {vec4} b the second operand
   * @return {Number} dot product of a and b
   */
  dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z + this.t * b.t;
  }

  /**
   * Computes the cross product of two vec4's
   *
   * @param {vec4} b the second operand
   * @return {vec4}
   */
  cross(b) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const at = this.t;
    const bx = b.x;
    const by = b.y;
    const bz = b.z;
    const bt = b.t;

    return new Vec4(
      ay * bz - az * by,
      az * bt - at * bz,
      at * bx - ax * bt,
      ax * by - ay * bx
    );
  }

  /**
   * Get the angle between two 3D vectors
   * @param {vec4} b The second operand
   * @return {Number} The angle in radians
   */
  angle(b) {
    const tempA = this.normalize();
    const tempB = b.normalize();
    const cosine = tempA.dot(tempB);

    if (cosine > 1.0) {
      return 0;
    } else {
      return Math.acos(cosine);
    }
  }

  /**
   * Performs a linear interpolation between two vec4's
   *
   * @param {vec4} out the receiving vector
   * @param {vec4} a the first operand
   * @param {vec4} b the second operand
   * @param {Number} t interpolation amount between the two inputs
   * @return {vec4} out
   */
  lerp(b, t) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    at = this.t;
    return new Vec4(
      ax + t * (b.x - ax),
      ay + t * (b.y - ay),
      az + t * (b.z - az),
      at + t * (b.t - at)
    );
  }

  /**
   * Generates a random vector with the given scale
   *
   * @param {vec4} out the receiving vector
   * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
   * @return {vec4} out
   */
  random(scale = 1.0) {
    const r = glMatrix.RANDOM() * 2.0 * Math.PI;
    const z = glMatrix.RANDOM() * 2.0 - 1.0;
    const zScale = Math.sqrt(1.0 - z * z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
  }

  clone() {
    return new Vec4(
      this.__data[0],
      this.__data[1],
      this.__data[2],
      this.__data[3]
    );
  }

  toVec3() {
    return new Vec3(this.__data[0], this.__data[1], this.__data[2]);
  }

  asArray() {
    return this.__data;
  }

  // ////////////////////////////////////////
  // Static Methods

  static create(...args) {
    return new Vec3(...args);
  }

  // Creates a new Mat4 to wrap existing memory in a buffer.
  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Vec4(buffer, offset * 4); // 4 bytes per 32bit float
  }

  static numFloat32Elements() {
    return 4;
  }

  // ///////////////////////////
  // Persistence

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      t: this.t,
    };
  }
}

typeRegistry.registerType('Vec4', Vec4);

export { Vec4 };
