import { MultiChoiceParameter } from './MultiChoiceParameter'
import { BinReader } from '../BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MultiChoiceParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 0, [])

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(multiChoiceParameter.getDataType()).toEqual('Number')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 0, [1, 2, 3])
    multiChoiceParameter.setValue(1)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(multiChoiceParameter.getValue()).toEqual(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    const expOutput = '{"value":1,"range":[0,3],"step":1}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(multiChoiceParameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    const input = { value: 1 }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    multiChoiceParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(multiChoiceParameter.getValue()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])

    const data = Float32Array.of(1)
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    multiChoiceParameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(multiChoiceParameter.getValue()).toEqual(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    const parameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    parameter.setValue(2)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
