import { Rect } from './Rect'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Rect', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const rect = new Rect()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rect.getParameter('X').getValue()).toBe(1.0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rect.getParameter('Y').getValue()).toBe(1.0)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets rectangle size', () => {
    const rect = new Rect()
    rect.getParameter('X').setValue(3)
    rect.getParameter('Y').setValue(4)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rect.getParameter('X').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rect.getParameter('Y').getValue()).toBe(4)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const rect = new Rect(3, 4)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = rect.toJSON()

    const expectedOutput = {
      params: {
        X: {
          value: 3,
        },
        Y: {
          value: 4,
        },
      },
      type: 'Rect',
      vertexAttributes: {},
    }

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toEqual(expectedOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const rect = new Rect()
    const expectedOutput = {
      params: { X: { value: 3 }, Y: { value: 4 } },
      type: 'Rect',
      numVertices: 4,
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    rect.fromJSON(expectedOutput)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(rect.toJSON()).toEqual(new Rect(3, 4).toJSON())
  })
})
