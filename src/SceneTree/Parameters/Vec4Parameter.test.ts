import { Vec4 } from '../../Math/Vec4'
import { Vec4Parameter } from './Vec4Parameter'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Vec4Parameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()
    const vec4 = new Vec4()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec4Parameter.getValue().isEqual(vec4)).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec4Parameter.getDataType()).toEqual('Vec4')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()
    const value = new Vec4()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec4Parameter.setValue(value)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec4Parameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec4Parameter.setValue(new Vec4(1, 2, 3, 4))

    const expOutput = '{"value":{"x":1,"y":2,"z":3,"t":4}}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(vec4Parameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()
    const input = { value: { x: 1, y: 2, z: 3, t: 4 } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec4Parameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec4Parameter.getValue().toJSON()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const vec4Parameter = new Vec4Parameter()

    const data = new Float32Array(4)
    data[0] = 1
    data[1] = 2
    data[2] = 3
    data[3] = 4
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    vec4Parameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec4Parameter.getValue().toJSON()).toEqual({ x: 1, y: 2, z: 3, t: 4 })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new Vec4Parameter('TestParameter')
    const value = new Vec4(1, 2, 3, 4)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
