import { Xfo } from './Xfo'
import { Vec3, Quat, Mat4 } from './index'
import { BinReader } from '../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Xfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has initial values', () => {
    const xfo = new Xfo()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({ ori: { w: 1, x: 0, y: 0, z: 0 }, tr: { x: 0, y: 0, z: 0 } })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value on instantiation', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfoFromVec3 = new Xfo(new Vec3(1, 2, 3))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoFromVec3.toJSON()).toEqual({ ori: { w: 1, x: 0, y: 0, z: 0 }, tr: { x: 1, y: 2, z: 3 } })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Quat' is not assignable to param... Remove this comment to see the full error message
    const xfoFromQuat = new Xfo(new Quat(0, 1, 0, 0))
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoFromQuat.toJSON()).toEqual({ ori: { w: 0, x: 0, y: 1, z: 0 }, tr: { x: 0, y: 0, z: 0 } })

    // Float32Array can't be tested in jest like everything else due to some ArrayBuffer regression in node.
    // There's a workaround but adds complexity to the testing. Although this works in the browser.
    // const xfoFromFloat32Array = new Xfo(Float32Array.of(1, 2, 3, 4, 5, 6, 7))
    // expect(xfoFromFloat32Array.toJSON()).toEqual({ ori: { w: 4, x: 1, y: 2, z: 3 }, tr: { x: 0, y: 0, z: 0 } })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 0, 1, 0), new Vec3(8, 9, 10))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({
      ori: { w: 0, x: 0, y: 0, z: 1 },
      tr: { x: 1, y: 2, z: 3 },
      sc: { x: 8, y: 9, z: 10 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value from method', () => {
    const xfo = new Xfo()
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    xfo.set(new Vec3(1, 2, 3), new Quat(0, 1, 0, 0), new Vec3(8, 9, 10))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({
      ori: { w: 0, x: 0, y: 1, z: 0 },
      tr: { x: 1, y: 2, z: 3 },
      sc: { x: 8, y: 9, z: 10 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value from another xfo', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 1, 0, 0), new Vec3(8, 9, 10))
    const xfo2 = new Xfo()
    xfo2.setFromOther(xfo)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo2.toJSON()).toEqual({
      ori: { w: 0, x: 0, y: 1, z: 0 },
      tr: { x: 1, y: 2, z: 3 },
      sc: { x: 8, y: 9, z: 10 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks that the xfo is an identity', () => {
    const xfo = new Xfo()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.isIdentity()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('multiplies two xfo values', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 1, 0, 0), new Vec3(8, 9, 10))
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo2 = new Xfo(new Vec3(3, 2, 3), new Quat(0, 1, 0, 0), new Vec3(8, 9, 10))
    const resultXfo = xfo.multiply(xfo2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultXfo.toJSON()).toEqual({
      ori: { w: -1, x: 0, y: 0, z: 0 },
      tr: { x: -23, y: 20, z: -27 },
      sc: { x: 64, y: 81, z: 100 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calculates the inverse of the xfo', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 1, 0, 0), new Vec3(8, 9, 10))
    const resultXfo = xfo.inverse()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultXfo.toJSON()).toEqual({
      ori: { w: 0, x: -0, y: -1, z: -0 },
      tr: { x: 8, y: -18, z: 30 },
      sc: { x: 8, y: 9, z: 10 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('transforms xfo with a specified Vec3', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(1, 0, 0, 0), new Vec3(8, 9, 10))
    const transformedTr = xfo.transformVec3(new Vec3(3, 4, 3))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(transformedTr.toJSON()).toEqual({ x: 25, y: -34, z: -27 })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns Mat4 representation of the xfo', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(1, 0, 0, 0), new Vec3(8, 9, 10))
    const mat4 = xfo.toMat4()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat4).toEqual(new Mat4(8, 0, 0, 0, 0, -9, 0, 0, 0, 0, -10, 0, 1, 2, 3, 1))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores xfo from a Mat4', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 1, 0, 0))
    const mat4 = xfo.toMat4()

    const restoredXfo = new Xfo()
    restoredXfo.fromMat4(mat4)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(restoredXfo).toEqual(xfo)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones xfo', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 0, 1, 0), new Vec3(8, 9, 10))
    const xfo2 = xfo.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo2).toEqual(xfo)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('serializes xfo as a JSON', () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Vec3' is not assignable to param... Remove this comment to see the full error message
    const xfo = new Xfo(new Vec3(1, 2, 3), new Quat(0, 0, 1, 0), new Vec3(8, 9, 10))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({
      ori: { w: 0, x: 0, y: 0, z: 1 },
      sc: { x: 8, y: 9, z: 10 },
      tr: { x: 1, y: 2, z: 3 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores xfo from JSON', () => {
    const xfo = new Xfo()
    xfo.fromJSON({
      ori: { w: 0.6236095428466797, x: 0.35634833574295044, y: 0.44543540477752686, z: 0.5345224738121033 },
      sc: { x: 8, y: 9, z: 10 },
      tr: { x: 1, y: 2, z: 3 },
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({
      ori: { w: 0.6236095428466797, x: 0.35634833574295044, y: 0.44543540477752686, z: 0.5345224738121033 },
      sc: { x: 8, y: 9, z: 10 },
      tr: { x: 1, y: 2, z: 3 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores xfo from binary', () => {
    const data = Float32Array.of(1, 2, 3, 1, 0, 0, 0, 8, 9, 10)
    const binReader = new BinReader(data.buffer)
    const xfo = new Xfo()
    xfo.readBinary(binReader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfo.toJSON()).toEqual({
      ori: { w: 0, x: 1, y: 0, z: 0 },
      sc: { x: 8, y: 9, z: 10 },
      tr: { x: 1, y: 2, z: 3 },
    })
  })
})
