import { MaterialParameter } from './MaterialParameter'
import { Material } from '../Material'
import { BinReader } from '../BinReader'
import { ColorParameter } from './ColorParameter'
import { Color } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MaterialParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const materialParameter = new MaterialParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toBeUndefined()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const materialParameter = new MaterialParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getDataType()).toEqual('Material')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const materialParameter = new MaterialParameter('Foo')
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const material = new Material('itemMaterial')
    materialParameter.setValue(material)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toEqual(material)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('replaces a value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const materialParameter = new MaterialParameter('Foo', new Material('itemMaterial1'))

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const material2 = new Material('itemMaterial2')
    materialParameter.setValue(material2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toEqual(material2)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('propagate events.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const materialParameter = new MaterialParameter('Foo')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const material = new Material('itemMaterial1')
    material.addParameter(new ColorParameter('Color', new Color(1, 0, 0)))
    materialParameter.setValue(material)

    let changedParam
    materialParameter.on('valueParameterValueChanged', (event: any) => {
      changedParam = event.param
    })

    material.getParameter('Color').setValue(new Color(0, 1, 0))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
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
