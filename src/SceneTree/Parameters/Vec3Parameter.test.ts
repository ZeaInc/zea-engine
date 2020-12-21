import { Vec3 } from '../../Math/Vec3'
import { Vec3Parameter } from './Vec3Parameter'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Vec3Parameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()

    const vec3 = new Vec3()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3Parameter.getValue().isEqual(vec3)).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3Parameter.getDataType()).toEqual('Vec3')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()
    const value = new Vec3()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec3Parameter.setValue(value)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3Parameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()
    const value = new Vec3(1, 2, 3)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec3Parameter.setValue(value)

    const expOutput = '{"value":{"x":1,"y":2,"z":3}}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(vec3Parameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()
    const input = { value: { x: 1, y: 2, z: 3 } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec3Parameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3Parameter.getValue().toJSON()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 0.
    const vec3Parameter = new Vec3Parameter()

    const data = new Float32Array(3)
    data[0] = 1
    data[1] = 2
    data[2] = 3
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec3Parameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3Parameter.getValue().toJSON()).toEqual({ x: 1, y: 2, z: 3 })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 1.
    const parameter = new Vec3Parameter('TestParameter')
    const value = new Vec3(1, 2, 3)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
