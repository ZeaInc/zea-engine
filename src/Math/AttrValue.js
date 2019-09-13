import { JSON_stringify_fixedPrecision } from './Common.js';

// A base class for values that can be stored in vertex attributes.
// Note: these values use Float32Array values to store their data,
// and we can create references to values in attributes using
class AttrValue {
  isValid() {
    for (const v of this.__data) {
      if (v == Infinity || isNaN(v)) return false;
    }
    return true;
  }

  // Creates a new value to wrap memory in an existing buffer.
  static createFromFloat32Buffer(buffer, offset) {
    throw 'Not yet implemented for this type:' + this.constructor.name;
  }

  static numFloat32Elements() {
    throw 'Not yet implemented for this type:' + this.constructor.name;
  }

  asArray() {
    return this.__data;
  }

  toString() {
    return JSON_stringify_fixedPrecision(this.toJSON());
  }
}

export { AttrValue };
// export default AttrValue;
