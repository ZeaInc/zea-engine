import { Xfo } from '../../Math/Xfo'
import { XfoParameter } from './XfoParameter'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('XfoParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()
    const xfo = new Xfo()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoParameter.getValue()).toEqual(xfo)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoParameter.getDataType()).toEqual('Xfo')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()
    const value = new Xfo()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    xfoParameter.setValue(value)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoParameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()
    const xfo = new Xfo()
    xfo.tr.set(2, 5, 7)
    xfo.sc.set(2, 2, 2)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    xfoParameter.setValue(xfo)

    const expOutput = '{"value":{"tr":{"x":2,"y":5,"z":7},"ori":{"x":0,"y":0,"z":0,"w":1},"sc":{"x":2,"y":2,"z":2}}}'
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(xfoParameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()
    const input = { value: { tr: { x: 2, y: 5, z: 7 }, ori: { x: 0, y: 0, z: 0, w: 1 }, sc: { x: 2, y: 2, z: 2 } } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    xfoParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoParameter.getValue().toJSON()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const xfoParameter = new XfoParameter()

    const data = new Float32Array(10)
    data[0] = 2
    data[1] = 5
    data[2] = 7
    data[3] = 0
    data[4] = 0
    data[5] = 0
    data[6] = 1
    data[7] = 2
    data[8] = 2
    data[9] = 2
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    xfoParameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xfoParameter.getValue().toJSON()).toEqual({
      tr: { x: 2, y: 5, z: 7 },
      ori: { x: 0, y: 0, z: 0, w: 1 },
      sc: { x: 2, y: 2, z: 2 },
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new XfoParameter('TestParameter')
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-3 arguments, but got 4.
    const value = new Xfo(1, 2, 3, 4)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
