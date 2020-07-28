import { StringParameter } from './StringParameter'
import { BaseItem } from '../BaseItem'
import { BinReader } from '../../SceneTree/BinReader'

describe('StringParameter', () => {
  it('has name', () => {
    const NAME = 'TestParameter'
    const parameter = new StringParameter(NAME)

    expect(parameter.getName()).toEqual(NAME)
  })

  it('emits event on name set', () => {
    const parameter = new StringParameter('param1')

    const mockFn = jest.fn()
    const event = { newName: 'param2', prevName: 'param1' }
    parameter.on('nameChanged', mockFn)

    parameter.setName('param2')

    expect(mockFn).toHaveBeenCalledWith(event)
  })

  it('emits event on value change', () => {
    const parameter = new StringParameter('param1', '', 'String')

    const mockFn = jest.fn()
    const event = { mode: 2 }
    parameter.on('valueChanged', mockFn)

    parameter.setValue('Test')

    expect(mockFn).toHaveBeenCalledWith(event)
  })

  it('sets owner item', () => {
    const item = new BaseItem('item1')

    const parameter = new StringParameter('param1')
    parameter.setOwner(item)

    expect(parameter.getOwner()).toEqual(item)
  })

  it('has path to parameter', () => {
    const parameter = new StringParameter('param1')

    expect(parameter.getPath()).toEqual(['param1'])
  })

  it('Has path to parameter when owned', () => {
    const item = new BaseItem('item1')

    const parameter = new StringParameter('param1')
    parameter.setOwner(item)

    expect(parameter.getPath()).toEqual(['item1', 'param1'])
  })

  it('Has data type', () => {
    const parameter = new StringParameter('param1')

    expect(parameter.getDataType()).toEqual('String')
  })

  it('save to JSON(serialization).', () => {
    const parameter = new StringParameter('TestParameter', 'test')
    const expOutput = '{"value":"test"}'

    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  it('load from JSON(serialization).', () => {
    const parameter = new StringParameter('TestParameter', '')
    const input = { value: 'test' }
    parameter.fromJSON(input)

    expect(parameter.getValue()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const parameter = new StringParameter()

    const str = 'FooBar'
    const view = new DataView(new ArrayBuffer(10))
    let byteOffset = 0
    view.setUint32(byteOffset, str.length, true)
    byteOffset += 4
    for (let i = 0; i < str.length; i++) {
      view.setUint8(byteOffset, str.charCodeAt(i), true)
      byteOffset += 1
    }

    const reader = new BinReader(view.buffer)
    parameter.readBinary(reader)

    expect(parameter.getValue()).toEqual(str)
  })

  it('clones parameter object', () => {
    const parameter = new StringParameter('TestParameter', '')
    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
