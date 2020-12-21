import { Quat } from '../../Math/Quat'
import { QuatParameter } from './QuatParameter'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('QuatParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()
    const quat = new Quat()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quatParameter.getValue().isEqual(quat)).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quatParameter.getDataType()).toEqual('Quat')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()
    const value = new Quat()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    quatParameter.setValue(value)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quatParameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    quatParameter.setValue(new Quat(1, 0, 0, 0))

    const expOutput = '{"value":{"x":1,"y":0,"z":0,"w":0}}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(quatParameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()
    const input = { value: { x: 1, y: 0, z: 0, w: 0 } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    quatParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quatParameter.getValue().toJSON()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const quatParameter = new QuatParameter()

    const data = new Float32Array(4)
    data[0] = 1
    data[1] = 0
    data[2] = 0
    data[3] = 0
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    quatParameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(quatParameter.getValue().toJSON()).toEqual({ x: 1, y: 0, z: 0, w: 0 })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new QuatParameter('TestParameter')
    const value = new Quat(1, 0, 0, 0)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
