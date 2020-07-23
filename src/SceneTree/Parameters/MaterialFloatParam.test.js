import { MaterialFloatParam } from './MaterialFloatParam'
import { BaseImage } from '../BaseImage'
import { BinReader } from '../BinReader'

describe('MaterialFloatParam', () => {
  it('has an initial value.', () => {
    const materialParameter = new MaterialFloatParam()

    expect(materialParameter.getValue()).toBe(0)
  })

  it('checks value type.', () => {
    const materialParameter = new MaterialFloatParam()

    expect(materialParameter.getDataType()).toEqual('Number')
  })

  it('sets value.', () => {
    const materialParameter = new MaterialFloatParam('Foo', 15)
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    expect(materialParameter.getValue()).toEqual(15)
    expect(materialParameter.getImage()).toEqual(baseImage)
  })

  it('saves to JSON (serialization).', () => {
    const materialParameter = new MaterialFloatParam('Foo', 15)
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    const expOutput = '{"value":15}'

    expect(JSON.stringify(materialParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const materialParameter = new MaterialFloatParam('Foo')
    const input = { value: 1 }
    materialParameter.fromJSON(input)

    expect(materialParameter.getValue()).toEqual(input.value)
  })

  /*it('loads from binary (serialization).', () => {
    const materialParameter = new MaterialFloatParam('Foo')

    const data = Float32Array.of(15)
    const reader = new BinReader(data.buffer)
    materialParameter.readBinary(reader)

    expect(materialParameter.getValue()).toEqual(15)
  })

  it('clones parameter object', () => {
    const parameter = new MaterialFloatParam('Foo', 15)
    const baseImage = new BaseImage('Foo')
    parameter.setImage(baseImage)

    const parameter2 = parameter.clone()

    expect(parameter).toEqual(parameter2)
  })*/
})
