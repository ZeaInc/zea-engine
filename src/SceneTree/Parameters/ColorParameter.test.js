import { ColorParameter } from './ColorParameter'
import { Color } from '../../Math'

describe('ColorParameter', () => {
  it('has an initial value.', () => {
    const colorParameter = new ColorParameter()

    expect(colorParameter.getValue()).toEqual(new Color())
  })

  it('checks value type.', () => {
    const colorParameter = new ColorParameter()

    expect(colorParameter.getDataType()).toEqual('Color')
  })

  it('sets value.', () => {
    const colorParameter = new ColorParameter()
    const color = new Color(1.0, 0.0, 0.0)
    colorParameter.setValue(color)

    expect(colorParameter.getValue()).toEqual(color)
  })

  it('saves to JSON (serialization).', () => {
    const colorParameter = new ColorParameter()
    const color = new Color(1.0, 0.0, 0.0)
    colorParameter.setValue(color)

    expect(colorParameter.toJSON()).toEqual({ value: { a: 1, b: 0, g: 0, r: 1 } })
  })

  it('loads from JSON (serialization).', () => {
    const colorParameter = new ColorParameter()
    const color = { value: { a: 1, b: 0, g: 0, r: 1 } }
    colorParameter.fromJSON(color)

    expect(colorParameter.getValue()).toEqual(new Color(1.0, 0.0, 0.0))
  })

  it('clones parameter object', () => {
    const parameter = new ColorParameter('TestParameter')
    const color = new Color(1.0, 0.0, 0.0)
    parameter.setValue(color)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
