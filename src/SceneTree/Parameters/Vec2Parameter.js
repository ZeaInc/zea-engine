import { Vec2 } from '../../Math';
import { Parameter } from './Parameter.js';

class Vec2Parameter extends Parameter {
  constructor(name, value, range = undefined) {
    super(name, value ? value : new Vec2(), 'Vec2');
    this.__range = range;
  }

  getRange() {
    // Range should be an array of 2 vec2s. [min(x,y), max(x,y)]
    return this.__range;
  }

  __setRange(range) {
    // Should be an array [0, 20]
    this.__range = range;
    this.rangeChanged.emit();
  }

  clone(flags) {
    const clonedParam = new Vec2Parameter(this.__name, this.__value.clone());
    return clonedParam;
  }
}

export { Vec2Parameter };
