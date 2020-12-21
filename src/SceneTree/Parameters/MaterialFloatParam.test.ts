import { MaterialFloatParam } from './MaterialFloatParam'
import { BaseImage } from '../BaseImage'
import { BinReader } from '../BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MaterialFloatParam', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 0.
    const materialParameter = new MaterialFloatParam()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toBe(0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 0.
    const materialParameter = new MaterialFloatParam()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getDataType()).toEqual('Number')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    const materialParameter = new MaterialFloatParam('Foo', 15)
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toEqual(15)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getImage()).toEqual(baseImage)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    const materialParameter = new MaterialFloatParam('Foo', 15)
    const baseImage = new BaseImage('Foo')
    materialParameter.setImage(baseImage)

    const expOutput = '{"value":15}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(materialParameter.toJSON())).toEqual(expOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
    const materialParameter = new MaterialFloatParam('Foo')
    const input = { value: 1 }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    materialParameter.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(materialParameter.getValue()).toEqual(input.value)
  })

  /* it('loads from binary (serialization).', () => {
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
