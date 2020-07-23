import { MaterialParameter } from './MaterialParameter'
import { Material } from '../Material'
import { BinReader } from '../BinReader'

describe('MaterialParameter', () => {
  it('has an initial value.', () => {
    const materialParameter = new MaterialParameter()

    expect(materialParameter.getValue()).toBeUndefined()
  })

  it('checks value type.', () => {
    const materialParameter = new MaterialParameter()

    expect(materialParameter.getDataType()).toEqual('Material')
  })

  it('sets value.', () => {
    const materialParameter = new MaterialParameter('Foo')
    const material = new Material('itemMaterial')
    materialParameter.setValue(material)

    expect(materialParameter.getValue()).toEqual(material)
  })

  /*it.skip('saves to JSON (serialization).', () => {
    const materialParameter = new MaterialParameter('Foo')
    const material = new Material('itemMaterial')
    materialParameter.setValue(material)

    const expOutput = '{"value":...}'

    expect(JSON.stringify(materialParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const materialParameter = new MaterialParameter('Foo')
    const input = { value: 1 }
    materialParameter.fromJSON(input)

    expect(materialParameter.getValue()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const materialParameter = new MaterialParameter('Foo', 1, [1, 2, 3])

    const data = Float32Array.of(1)
    const reader = new BinReader(data.buffer)
    materialParameter.readBinary(reader)

    expect(materialParameter.getValue()).toEqual(1)
  })

  it('clones parameter object', () => {
    const parameter = new MaterialParameter('Foo')
    const material = new Material('itemMaterial')
    parameter.setValue(material)

    const parameter2 = parameter.clone()

    expect(parameter).toEqual(parameter2)
  })*/
})
