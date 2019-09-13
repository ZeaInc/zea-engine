import { AttrValue } from './AttrValue.js';
import { typeRegistry } from './TypeRegistry.js';

class Vec3 extends AttrValue {
  constructor(x = 0, y = 0, z = 0) {
    super();
    if (x instanceof Float32Array || x instanceof Uint32Array) {
      this.__data = x;
    } else if (x instanceof ArrayBuffer) {
      const buffer = x;
      const byteOffset = y;
      this.__data = new Float32Array(buffer, byteOffset, 3);
    } else if (x != null && typeof x == 'object') {
      this.__data = new Float32Array(3);
      this.fromJSON(x);
    } else {
      this.__data = new Float32Array(3);
      this.__data[0] = x;
      this.__data[1] = y;
      this.__data[2] = z;
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

  // Setter from scalar components
  set(x, y, z) {
    this.x = x;
    this.y = y !== undefined ? y : x;
    this.z = z !== undefined ? z : x;
  }

  setDataArray(float32Array) {
    this.__data = float32Array;
  }

  // Setter from another vector
  setFromOther(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
  }

  isNull() {
    return (
      Math.abs(this.x) < Number.EPSILON &&
      Math.abs(this.y) < Number.EPSILON &&
      Math.abs(this.z) < Number.EPSILON
    );
  }

  is111() {
    return (
      Math.abs(1.0 - this.x) < Number.EPSILON &&
      Math.abs(1.0 - this.y) < Number.EPSILON &&
      Math.abs(1.0 - this.z) < Number.EPSILON
    );
  }

  // Returns true if this vector is the same as another one
  equal(other, precision) {
    return this.x == other.x && this.y == other.y && this.z == other.z;
  }

  // Returns true if this vector is the same as another one
  notequals(other, precision) {
    return this.x != other.x && this.y != other.y && this.z != other.z;
  }

  // Returns true if this vector is the same as another one
  // (given a precision)
  approxEqual(other) {
    return (
      Math.abs(this.x - other.x) < Number.EPSILON &&
      Math.abs(this.y - other.y) < Number.EPSILON &&
      Math.abs(this.z - other.z) < Number.EPSILON
    );
  }

  // Returns a new vector which is this vector added to other
  add(other) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  addInPlace(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  // Returns a new vector which is this vector subtracted from other
  subtract(other) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  subtractInPlace(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
  }

  multiply(vec3) {
    return new Vec3(this.x * vec3.x, this.y * vec3.y, this.z * vec3.z);
  }

  multiplyInPlace(vec3) {
    this.x *= vec3.x;
    this.y *= vec3.y;
    this.z *= vec3.z;
  }

  divide(vec3) {
    return new Vec3(this.x / vec3.x, this.y / vec3.y, this.z / vec3.z);
  }

  divideInPlace(vec3) {
    this.x /= vec3.x;
    this.y /= vec3.y;
    this.z /= vec3.z;
  }

  scale(scalar) {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  scaleInPlace(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
  }

  negate() {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  inverse(vec3) {
    return new Vec3(1.0 / this.x, 1.0 / this.y, 1.0 / this.z);
  }

  /**
   * Calculates the length of a vec3
   *
   * @return {Number} length of a
   */
  lengthSquared() {
    const x = this.__data[0];
    const y = this.__data[1];
    const z = this.__data[2];
    return x * x + y * y + z * z;
  }

  /**
   * Calculates the length of a vec3
   *
   * @return {Number} length of a
   */
  length() {
    return Math.sqrt(this.lengthSquared());
  }

  /**
   * Calculates the distance to another vector
   *
   * @param {vec3} a vector to calculate distance to
   * @return {Number} length of a
   */
  distanceTo(other) {
    const x = this.__data[0] - other.x;
    const y = this.__data[1] - other.y;
    const z = this.__data[2] - other.z;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Returns the vector normalized
   *
   */
  normalize() {
    let len =
      this.__data[0] * this.__data[0] +
      this.__data[1] * this.__data[1] +
      this.__data[2] * this.__data[2];
    if (len < Number.EPSILON) {
      return new Vec3();
    }

    // TODO: evaluate use of glm_invsqrt here?
    len = 1.0 / Math.sqrt(len);
    return new Vec3(
      this.__data[0] * len,
      this.__data[1] * len,
      this.__data[2] * len
    );
  }

  normalizeInPlace() {
    let len =
      this.__data[0] * this.__data[0] +
      this.__data[1] * this.__data[1] +
      this.__data[2] * this.__data[2];
    if (len < Number.EPSILON) {
      return;
    }
    len = Math.sqrt(len);
    const tmp = 1.0 / len;
    this.__data[0] *= tmp;
    this.__data[1] *= tmp;
    this.__data[2] *= tmp;
    return len;
  }

  resize(length) {
    const currlen =
      this.__data[0] * this.__data[0] +
      this.__data[1] * this.__data[1] +
      this.__data[2] * this.__data[2];
    if (currlen < Number.EPSILON) {
      return;
    }
    const scl = length / Math.sqrt(currlen);
    return new Vec3(
      this.__data[0] * scl,
      this.__data[1] * scl,
      this.__data[2] * scl
    );
  }

  resizeInPlace(length) {
    const currlen =
      this.__data[0] * this.__data[0] +
      this.__data[1] * this.__data[1] +
      this.__data[2] * this.__data[2];
    if (currlen < Number.EPSILON) {
      return;
    }
    const scl = length / Math.sqrt(currlen);
    this.__data[0] *= scl;
    this.__data[1] *= scl;
    this.__data[2] *= scl;
  }

  /**
   * Calculates the dot product of two vec3's
   *
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @return {Number} dot product of a and b
   */
  dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  }

  /**
   * Computes the cross product of two vec3's
   *
   * @param {vec3} b the second operand
   * @return {vec3}
   */
  cross(b) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const bx = b.x;
    const by = b.y;
    const bz = b.z;

    return new Vec3(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
  }

  /**
   * Get the angle between two 3D vectors
   * @param {vec3} b The second operand
   * @return {Number} The angle in radians
   */
  angleTo(b) {
    const cosine = this.dot(b);
    if (cosine > 1.0) {
      return 0;
    } else {
      return Math.acos(cosine);
    }
  }

  /**
   * Performs a linear interpolation between two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @param {Number} t interpolation amount between the two inputs
   * @return {vec3} out
   */
  lerp(b, t) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    return new Vec3(
      ax + t * (b.x - ax),
      ay + t * (b.y - ay),
      az + t * (b.z - az)
    );
  }

  abs() {
    return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
  }

  /**
   * Sets the vector a random direction with the given scale
   */
  setRandomDir(scale = 1.0) {
    const r = Math.random() * 2.0 * Math.PI;
    const z = Math.random() * 2.0 - 1.0;
    const zScale = Math.sqrt(1.0 - z * z) * scale;

    this.__data[0] = Math.cos(r) * zScale;
    this.__data[1] = Math.sin(r) * zScale;
    this.__data[2] = z * scale;
    return this;
  }

  setRandom(scale = 1.0) {
    this.__data[0] = (Math.random() - 0.5) * scale;
    this.__data[1] = (Math.random() - 0.5) * scale;
    this.__data[2] = (Math.random() - 0.5) * scale;
    return this;
  }

  clone() {
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

  static createFromJSON(json) {
    const result = new Vec3();
    result.fromJSON(json);
    return result;
  }

  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Vec3(buffer, offset * 4); // 4 bytes per 32bit float
  }

  static createFromFloat32Array(array) {
    return new Vec3(array);
  }

  static numFloat32Elements() {
    return 3;
  }

  // ///////////////////////////
  // Persistence

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  fromJSON(j) {
    this.x = j.x;
    this.y = j.y;
    this.z = j.z;
  }
}

typeRegistry.registerType('Vec3', Vec3);

export { Vec3 };
// export default Vec3;
