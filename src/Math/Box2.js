import { JSON_stringify_fixedPrecision } from './Common.js';
import { Vec2 } from './Vec2';
import { typeRegistry } from './TypeRegistry.js';

class Box2 {
  constructor(p0 = undefined, p1 = undefined) {
    if (p0 instanceof Vec2) {
      this.p0 = p0;
    } else {
      this.p0 = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }
    if (p1 instanceof Vec2) {
      this.p1 = p1;
    } else {
      this.p1 = new Vec2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    }
  }

  set(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
  }

  reset() {
    this.p0.x = Number.POSITIVE_INFINITY;
    this.p1.x = Number.NEGATIVE_INFINITY;
    this.p0.y = Number.POSITIVE_INFINITY;
    this.p1.y = Number.NEGATIVE_INFINITY;
  }

  isValid() {
    return (
      this.p0.x != Number.POSITIVE_INFINITY &&
      this.p1.x != Number.NEGATIVE_INFINITY &&
      this.p0.y != Number.POSITIVE_INFINITY &&
      this.p1.y != Number.NEGATIVE_INFINITY
    );
  }

  addPoint(point) {
    if (this.p0.x == Number.POSITIVE_INFINITY || point.x < this.p0.x)
      this.p0.x = point.x;
    if (this.p0.y == Number.POSITIVE_INFINITY || point.y < this.p0.y)
      this.p0.y = point.y;

    if (this.p1.y == Number.NEGATIVE_INFINITY || point.x > this.p1.x)
      this.p1.x = point.x;
    if (this.p1.y == Number.NEGATIVE_INFINITY || point.y > this.p1.y)
      this.p1.y = point.y;
  }

  size() {
    return this.p1.subtract(this.p0);
  }
  diagonal() {
    return this.p1.subtract(this.p0);
  }

  center() {
    const result = this.p1.subtract(this.p0);
    result.scaleInPlace(0.5);
    result.addInPlace(this.p0);
    return result;
  }

  // ////////////////////////////////////////
  // Static Methods

  static create(...args) {
    return new Box2(...args);
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON() {
    return {
      p0: this.p0.toJSON(),
      p1: this.p1.toJSON(),
    };
  }

  toString() {
    return JSON_stringify_fixedPrecision(this.toJSON());
  }
}

typeRegistry.registerType('Box2', Box2);

export { Box2 };
// export default Box2;
