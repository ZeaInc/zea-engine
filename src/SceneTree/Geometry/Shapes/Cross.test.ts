import { Cross } from './Cross'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Cross', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const cross = new Cross()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cross.getParameter('Size').getValue()).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const cross = new Cross()
    cross.getParameter('Size').setValue(5)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cross.getParameter('Size').getValue()).toBe(5)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const cross = new Cross(4)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = cross.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toEqual({
      params: { Size: { value: 4 } },
      type: 'Cross',
      vertexAttributes: {},
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const cross = new Cross()
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    cross.fromJSON({
      params: { Size: { value: 4 } },
      type: 'Cross',
      vertexAttributes: {},
    })

    const newCross = new Cross(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cross.toJSON()).toEqual(newCross.toJSON())
  })
})
