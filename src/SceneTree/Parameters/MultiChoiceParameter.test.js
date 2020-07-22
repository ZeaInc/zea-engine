import { MultiChoiceParameter } from './MultiChoiceParameter'
import { BinReader } from '../BinReader'

describe('MultiChoiceParameter', () => {

  it('checks value type.', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 0, [])

    expect(multiChoiceParameter.getDataType()).toEqual('Number')
  })

  it('sets value.', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 0, [1, 2, 3])
    multiChoiceParameter.setValue(1)

    expect(multiChoiceParameter.getValue()).toEqual(1)
  })

  it('saves to JSON (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    const expOutput = '{"value":1,"range":[0,3],"step":1}'

    expect(JSON.stringify(multiChoiceParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    const input = { value: 1 }
    multiChoiceParameter.fromJSON(input)

    expect(multiChoiceParameter.getValue()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const multiChoiceParameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])

    const data = Float32Array.of(1)
    const reader = new BinReader(data.buffer)
    multiChoiceParameter.readBinary(reader)

    expect(multiChoiceParameter.getValue()).toEqual(1)
  })

  it('clones parameter object', () => {
    const parameter = new MultiChoiceParameter('Foo', 1, [1, 2, 3])
    parameter.setValue(2)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
