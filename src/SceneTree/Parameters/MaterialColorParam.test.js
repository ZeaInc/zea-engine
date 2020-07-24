import { MaterialColorParam } from './MaterialColorParam'
import { Color } from '../../Math/Color'
import { BaseImage } from '../BaseImage'
import { BinReader } from '../BinReader'

describe('MaterialColorParam', () => {
  it('has an initial value.', () => {
    const materialParameter = new MaterialColorParam()

    expect(materialParameter.getValue()).toEqual(new Color())
  })

  it('checks value type.', () => {
    const materialParameter = new MaterialColorParam()

    expect(materialParameter.getDataType()).toEqual('Color')
  })

  it('sets value.', () => {
    const materialParameter = new MaterialColorParam('Foo', new Color(1.0, 0.0, 0.0))
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    expect(materialParameter.getValue()).toEqual(new Color(1.0, 0.0, 0.0))
    expect(materialParameter.getImage()).toEqual(baseImage)
  })

  it('saves to JSON (serialization).', () => {
    const materialParameter = new MaterialColorParam('Foo', new Color(1.0, 0.0, 0.0))
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    const expOutput = '{"value":{"r":1,"g":0,"b":0,"a":1}}'

    expect(JSON.stringify(materialParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const materialParameter = new MaterialColorParam('Foo')
    const input = { value: { a: 1, b: 0, g: 0, r: 1 } }
    materialParameter.fromJSON(input)

    expect(materialParameter.getValue()).toEqual(new Color(1.0, 0.0, 0.0))
  })

  /*it('loads from binary (serialization).', () => {
    const materialParameter = new MaterialColorParam('Foo')

    const data = Float32Array.of(15)
    const reader = new BinReader(data.buffer)
    materialParameter.readBinary(reader)

    expect(materialParameter.getValue()).toEqual(15)
  })

  it('clones parameter object', () => {
    const parameter = new MaterialColorParam('Foo', new Color(1.0, 0.0, 0.0))
    const baseImage = new BaseImage('Foo')
    parameter.setImage(baseImage)

    const parameter2 = parameter.clone()

    expect(parameter).toEqual(parameter2)
  })*/
})
