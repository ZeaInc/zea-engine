import { NumberParameter } from './NumberParameter'
import '../../Math/Common'

describe('NumberParameter', () => {
  it('has an initial value.', () => {
    const numberParameter = new NumberParameter()

    expect(numberParameter.getValue()).toEqual(0)
  })

  it('checks value type.', () => {
    const numberParameter = new NumberParameter()

    expect(numberParameter.getDataType()).toEqual('Number')
  })

  it('sets a value.', () => {
    const numberParameter = new NumberParameter()
    const value = 1356
    numberParameter.setValue(value)
    expect(numberParameter.getValue()).toEqual(value)
  })

  it('clamps value with the specified range.', () => {
    const numberParameter = new NumberParameter('Test', 0, [0, 5])

    // Higher range
    numberParameter.setValue(6, 0)
    expect(numberParameter.getValue()).toEqual(5)

    // Lower range
    numberParameter.setValue(-1, 0)
    expect(numberParameter.getValue()).toEqual(0)
  })

  it('rounds value to the nearest the step multiple.', () => {
    const numberParameter = new NumberParameter('Test')
    numberParameter.setStep(5)

    numberParameter.setValue(23, 0)
    expect(numberParameter.getValue()).toEqual(25)
  })

  it('saves to JSON (serialization).', () => {
    const numberParameter = new NumberParameter()
    const value = 1356
    numberParameter.setValue(value)

    const expOutput = '{"value":1356}'

    expect(JSON.stringify(numberParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const numberParameter = new NumberParameter()
    const input = { value: 1356 }
    numberParameter.fromJSON(input)

    expect(numberParameter.getValue()).toEqual(input.value)
  })

  it('clones parameter object', () => {
    const parameter = new NumberParameter('Test', 1.0)
    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
