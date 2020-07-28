import { SInt32, UInt32, Float32 } from '../Utilities/MathFunctions'

/** Class representing a type registry.
 * @private
 */
class TypeRegistry {
  /**
   * Create a a type registry.
   */
  constructor() {
    this.__types = {}
    this.__names = {}

    // Types required for WebGL.
    this.registerType('SInt32', SInt32)
    this.registerType('UInt32', UInt32)
    this.registerType('Float32', Float32)
  }

  /**
   * The registerType method.
   * @param {any} key - The key value.
   * @param {any} type - The type value.
   */
  registerType(key, type) {
    this.__types[key] = type
    if (type.name) this.__names[type.name] = key
    else this.__names[type] = key
  }

  /**
   * The getType method.
   * @param {any} key - The key value.
   * @return {any} - The return value.
   */
  getType(key) {
    return this.__types[key]
  }

  /**
   * The getTypeName method.
   * @param {any} type - The type value.
   * @return {any} - The return value.
   */
  getTypeName(type) {
    if (this.__names[type]) return this.__names[type]
    if (this.__names[type.name]) return this.__names[type.name]
    throw ('Type not regitered:', type)
  }
}

const typeRegistry = new TypeRegistry()

export { typeRegistry }
