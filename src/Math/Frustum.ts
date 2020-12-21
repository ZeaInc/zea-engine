/* eslint-disable new-cap */
/* eslint-disable camelcase */
import { StringFunctions } from '../Utilities/StringFunctions'
import { Vec3 } from './Vec3.js'
import { PlaneType } from './PlaneType.js'
import { Registry } from '../Registry'

/**
 * Class representing a Frustum. Frustums are used to determine what
 * is inside the camera's field of view.
 * @private
 * */
class Frustum {
  p0: any;
  p1: any;
  p2: any;
  p3: any;
  p4: any;
  p5: any;
  planes: any;
  /**
   * Create a Frustum
   * @param {PlaneType} p0 - the p0 value.
   * @param {PlaneType} p1 - the p1 value.
   * @param {PlaneType} p2 - the p2 value.
   * @param {PlaneType} p3 - the p3 value.
   * @param {PlaneType} p4 - the p4 value.
   * @param {PlaneType} p5 - the p5 value.
   */
  constructor(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any) {
    this.planes = [
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p0 || new PlaneType(),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p1 || new PlaneType(),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p2 || new PlaneType(),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p3 || new PlaneType(),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p4 || new PlaneType(),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
      p5 || new PlaneType(),
    ]
  }

  /**
   * The setFromMatrix configures a Frustum object using a matrix.
   * Typically the matrix is a model view projection matrix.
   * @param {Mat4} mat4 - The matrix to use.
   */
  setFromMatrix(mat4: any) {
    const m = mat4
    const planes = this.planes
    planes[0].set(m.m03 - m.m00, m.m13 - m.m10, m.m23 - m.m20, m.m33 - m.m30)
    planes[1].set(m.m03 + m.m00, m.m13 + m.m10, m.m23 + m.m20, m.m33 + m.m30)
    planes[2].set(m.m03 + m.m01, m.m13 + m.m11, m.m23 + m.m21, m.m33 + m.m31)
    planes[3].set(m.m03 - m.m01, m.m13 - m.m11, m.m23 - m.m21, m.m33 - m.m31)
    planes[4].set(m.m03 - m.m02, m.m13 - m.m12, m.m23 - m.m22, m.m33 - m.m32)
    planes[5].set(m.m03 + m.m02, m.m13 + m.m12, m.m23 + m.m22, m.m33 + m.m32)

    planes.forEach((plane: any) => plane.normalizeInPlace())
  }

  /**
   * Tests a box to see if it is entirely within the frustum.
   * @param {Box3} box3 - The box to test.
   * @return {boolean} - True if the frustum intersects the box.
   */
  intersectsBox(box3: any) {
    const p = new Vec3()
    const planes = this.planes
    const { min, max } = box3

    for (let i = 0; i < 6; i++) {
      const plane = planes[i]

      // corner at max distance
      p.x = plane.normal.x > 0 ? max.x : min.x
      p.y = plane.normal.y > 0 ? max.y : min.y
      p.z = plane.normal.z > 0 ? max.z : min.z

      if (plane.distanceToPoint(p) < 0) return false
    }
    return true
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      p0: this.p0.toJSON(),
      p1: this.p1.toJSON(),
      p2: this.p2.toJSON(),
      p3: this.p3.toJSON(),
      p4: this.p4.toJSON(),
      p5: this.p5.toJSON(),
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object.
   */
  fromJSON(j: any) {
    this.p0.fromJSON(j.p0)
    this.p1.fromJSON(j.p1)
    this.p2.fromJSON(j.p2)
    this.p3.fromJSON(j.p3)
    this.p4.fromJSON(j.p4)
    this.p5.fromJSON(j.p5)
  }

  /**
   * Calls `toJSON` method and stringifies it.
   *
   * @return {string} - The return value.
   */
  toString() {
    return StringFunctions.stringifyJSONWithFixedPrecision(this.toJSON())
  }
}

Registry.register('Frustum', Frustum)

export { Frustum }
