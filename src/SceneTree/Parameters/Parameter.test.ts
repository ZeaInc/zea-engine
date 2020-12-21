import { Parameter } from './Parameter'
import { BaseItem } from '../BaseItem'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Parameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has name', () => {
    const NAME = 'TestParameter'
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter(NAME)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getName()).toEqual(NAME)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emits event on name set', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter('param1')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()
    const event = { newName: 'param2', prevName: 'param1' }
    parameter.on('nameChanged', mockFn)

    parameter.setName('param2')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalledWith(event)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emits event on value change', () => {
    const parameter = new Parameter('param1', '', 'String')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const mockFn = jest.fn()
    parameter.on('valueChanged', mockFn)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue('Test')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mockFn).toHaveBeenCalled()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets owner item', () => {
    const item = new BaseItem('item1')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter('param1')
    parameter.setOwner(item)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getOwner()).toEqual(item)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has path to parameter', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter('param1')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getPath()).toEqual(['param1'])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Saving to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    const parameter = new Parameter('name', 'value')

    const expOutput = '{"value":"value"}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Loading from JSON (deserialization).', () => {
    const edited = 'Edited'
    const json = { value: edited }

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    const parameter = new Parameter('name', 'value')
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.fromJSON(json)

    // TODO: test that the USER_EDITED flag was set.

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getValue()).toEqual(edited)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has path to parameter when owned', () => {
    const item = new BaseItem('item1')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const parameter = new Parameter('param1')
    parameter.setOwner(item)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getPath()).toEqual(['item1', 'param1'])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has data type', () => {
    const parameter = new Parameter('param1', '', 'String')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getDataType()).toEqual('String')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('save to JSON(serialization).', () => {
    const parameter = new Parameter('TestParameter', 'test', 'String')
    const expOutput = '{"value":"test"}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('load from JSON(serialization).', () => {
    const parameter = new Parameter('TestParameter', '', 'String')
    const input = { value: 'test' }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getValue()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    const parameter = new Parameter('TestParameter', '', 'String')
    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
