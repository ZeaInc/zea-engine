import { NumberParameter } from './NumberParameter'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('NumberParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(numberParameter.getValue()).toEqual(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(numberParameter.getDataType()).toEqual('Number')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets a value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()
    const value = 1356
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    numberParameter.setValue(value)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(numberParameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()
    const value = 1356
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    numberParameter.setValue(value)

    const expOutput = '{"value":1356}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(numberParameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()
    const input = { value: 1356 }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    numberParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(numberParameter.getValue()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-4 arguments, but got 0.
    const numberParameter = new NumberParameter()

    const value = 1356
    const data = new Float32Array(1)
    data[0] = value
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    numberParameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(numberParameter.getValue()).toEqual(value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    const parameter = new NumberParameter('Test', 1.0)
    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
