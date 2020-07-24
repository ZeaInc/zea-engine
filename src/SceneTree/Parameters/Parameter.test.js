import { Parameter } from './Parameter'
import { BaseItem } from '../BaseItem'

describe('Parameter', () => {
  it('has name', () => {
    const NAME = 'TestParameter'
    const parameter = new Parameter(NAME)

    expect(parameter.getName()).toEqual(NAME)
  })

  it('emits event on name set', () => {
    const parameter = new Parameter('param1')

    const mockFn = jest.fn()
    const event = { newName: 'param2', prevName: 'param1' }
    parameter.on('nameChanged', mockFn)

    parameter.setName('param2')

    expect(mockFn).toHaveBeenCalledWith(event)
  })

  it('emits event on value change', () => {
    const parameter = new Parameter('param1', '', 'String')

    const mockFn = jest.fn()
    const event = { mode: 2 }
    parameter.on('valueChanged', mockFn)

    parameter.setValue('Test')

    expect(mockFn).toHaveBeenCalledWith(event)
  })

  it('sets owner item', () => {
    const item = new BaseItem('item1')

    const parameter = new Parameter('param1')
    parameter.setOwner(item)

    expect(parameter.getOwner()).toEqual(item)
  })

  it('has path to parameter', () => {
    const parameter = new Parameter('param1')

    expect(parameter.getPath()).toEqual(['param1'])
  })

  test('Saving to JSON (serialization).', () => {
    const parameter = new Parameter('name', 'value')

    const expOutput = '{"value":"value"}'

    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  test('Loading from JSON (deserialization).', () => {
    const edited = 'Edited'
    const json = { value: edited }

    const parameter = new Parameter('name', 'value')
    parameter.fromJSON(json)

    // TODO: test that the USER_EDITED flag was set.

    expect(parameter.getValue()).toEqual(edited)
  })

  it('Has path to parameter when owned', () => {
    const item = new BaseItem('item1')

    const parameter = new Parameter('param1')
    parameter.setOwner(item)

    expect(parameter.getPath()).toEqual(['item1', 'param1'])
  })

  it('Has data type', () => {
    const parameter = new Parameter('param1', '', 'String')

    expect(parameter.getDataType()).toEqual('String')
  })

  it('save to JSON(serialization).', () => {
    const parameter = new Parameter('TestParameter', 'test', 'String')
    const expOutput = '{"value":"test"}'

    expect(JSON.stringify(parameter.toJSON())).toEqual(expOutput)
  })

  it('load from JSON(serialization).', () => {
    const parameter = new Parameter('TestParameter', '', 'String')
    const input = { value: 'test' }
    parameter.fromJSON(input)

    expect(parameter.getValue()).toEqual(input.value)
  })

  it('clones parameter object', () => {
    const parameter = new Parameter('TestParameter', '', 'String')
    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
