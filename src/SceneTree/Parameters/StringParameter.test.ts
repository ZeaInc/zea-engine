import { StringParameter } from './StringParameter'
import { BaseItem } from '../BaseItem'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('StringParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has name', () => {
    const NAME = 'TestParameter'
    const parameter = new StringParameter(NAME)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getName()).toEqual(NAME)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emits event on name set', () => {
    const parameter = new StringParameter('param1')

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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 3.
    const parameter = new StringParameter('param1', '', 'String')

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

    const parameter = new StringParameter('param1')
    parameter.setOwner(item)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getOwner()).toEqual(item)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has path to parameter', () => {
    const parameter = new StringParameter('param1')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getPath()).toEqual(['param1'])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has path to parameter when owned', () => {
    const item = new BaseItem('item1')

    const parameter = new StringParameter('param1')
    parameter.setOwner(item)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getPath()).toEqual(['item1', 'param1'])
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Has data type', () => {
    const parameter = new StringParameter('param1')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getDataType()).toEqual('String')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('save to JSON(serialization).', () => {
    const parameter = new StringParameter('TestParameter', 'test')
    const expOutput = '{"value":"test"}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('load from JSON(serialization).', () => {
    const parameter = new StringParameter('TestParameter', '')
    const input = { value: 'test' }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getValue()).toEqual(input.value)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    const parameter = new StringParameter()

    const str = 'FooBar'
    const view = new DataView(new ArrayBuffer(10))
    let byteOffset = 0
    view.setUint32(byteOffset, str.length, true)
    byteOffset += 4
    for (let i = 0; i < str.length; i++) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
      view.setUint8(byteOffset, str.charCodeAt(i), true)
      byteOffset += 1
    }

    const reader = new BinReader(view.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getValue()).toEqual(str)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    const parameter = new StringParameter('TestParameter', '')
    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
