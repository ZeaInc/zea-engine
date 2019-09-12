import { JSON_stringify_fixedPrecision } from './Common.js';
import { Vec2 } from './Vec2.js';
import { typeRegistry } from './TypeRegistry.js';

class Rect2 {
  constructor(pos = undefined, size = undefined) {
    if (pos instanceof Vec2) {
      this.pos = pos;
    } else {
      this.pos = new Vec2();
    }
    if (size instanceof Vec2) {
      this.size = size;
    } else {
      this.size = new Vec2();
    }
  }

  get left() {
    return this.pos.x;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y;
  }

  get top() {
    return this.pos.y + this.size.y;
  }

  get area() {
    return this.size.x * this.size.y;
  }

  expandByPoint(point) {
    if (point.x < this.pos.x) {
      this.size.x += this.pos.x - point.x;
      this.pos.x = point.x;
    }
    if (point.y < this.pos.y) {
      this.size.y += this.pos.y - point.y;
      this.pos.y = point.y;
    }
    if (point.x > this.pos.x + this.size.x)
      this.size.x += point.x - (this.pos.x + this.size.x);
    if (point.y > this.pos.y + this.size.y)
      this.size.y += point.y - (this.pos.y + this.size.y);
  }

  // scales the rect modifying it size value.
  scaleInPlace(scalar) {
    this.pos.scaleInPlace(scalar);
    this.size.scaleInPlace(scalar);
  }

  corners() {
    return {
      p0: this.pos.toJSON(),
      p1: this.pos.add(this.size).toJSON(),
    };
  }

  // ////////////////////////////////////////
  // Static Methods

  static create(...args) {
    return new Rect2(...args);
  }

  // ///////////////////////////
  // Persistence

  toJSON() {
    return {
      pos: this.pos.toJSON(),
      size: this.size.toJSON(),
    };
  }

  toString() {
    return JSON_stringify_fixedPrecision(this.toJSON());
  }
}

typeRegistry.registerType('Rect2', Rect2);

export { Rect2 };
// export default Rect2;
