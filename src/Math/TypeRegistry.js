import { SInt32, UInt32, Float32 } from './Common.js';

class TypeRegistry {
  constructor() {
    this.__types = {};
    this.__names = {};

    // Types required for WebGL.
    this.registerType('SInt32', SInt32);
    this.registerType('UInt32', UInt32);
    this.registerType('Float32', Float32);
  }

  registerType(key, type) {
    this.__types[key] = type;
    if (type.name) this.__names[type.name] = key;
    else this.__names[type] = key;
  }

  getType(key) {
    return this.__types[key];
  }

  getTypeName(type) {
    if (this.__names[type]) return this.__names[type];
    if (this.__names[type.name]) return this.__names[type.name];
    throw ('Type not regitered:', type);
  }
}

const typeRegistry = new TypeRegistry();

export { typeRegistry };
