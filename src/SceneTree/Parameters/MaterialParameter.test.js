import { MaterialParameter } from './MaterialParameter'
import { Material } from '../Material'
import { BinReader } from '../BinReader'
import { ColorParameter } from './ColorParameter'
import { Color } from '../../Math'

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

  it('replaces a value.', () => {
    const materialParameter = new MaterialParameter('Foo', new Material('itemMaterial1'))

    const material2 = new Material('itemMaterial2')
    materialParameter.setValue(material2)

    expect(materialParameter.getValue()).toEqual(material2)
  })

  it('propagate events.', () => {
    const materialParameter = new MaterialParameter('Foo')

    const material = new Material('itemMaterial1')
    material.addParameter(new ColorParameter('Color', new Color(1, 0, 0)))
    materialParameter.setValue(material)

    let changedParam
    materialParameter.on('valueParameterValueChanged', (event) => {
      changedParam = event.param
    })

    material.getParameter('Color').setValue(new Color(0, 1, 0))

    expect(changedParam).toEqual(material.getParameter('Color'))
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
