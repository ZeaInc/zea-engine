import { ColorParameter } from './ColorParameter'
import { Color } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ColorParameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const colorParameter = new ColorParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(colorParameter.getValue()).toEqual(new Color())
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const colorParameter = new ColorParameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(colorParameter.getDataType()).toEqual('Color')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const colorParameter = new ColorParameter()
    const color = new Color(1.0, 0.0, 0.0)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    colorParameter.setValue(color)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(colorParameter.getValue()).toEqual(color)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const colorParameter = new ColorParameter()
    const color = new Color(1.0, 0.0, 0.0)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    colorParameter.setValue(color)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(colorParameter.toJSON()).toEqual({ value: { a: 1, b: 0, g: 0, r: 1 } })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const colorParameter = new ColorParameter()
    const color = { value: { a: 1, b: 0, g: 0, r: 1 } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    colorParameter.fromJSON(color)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(colorParameter.getValue()).toEqual(new Color(1.0, 0.0, 0.0))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new ColorParameter('TestParameter')
    const color = new Color(1.0, 0.0, 0.0)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(color)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
