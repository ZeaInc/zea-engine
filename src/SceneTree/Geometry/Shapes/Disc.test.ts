import { Disc } from './Disc'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Disc', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const disc = new Disc()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disc.getParameter('Radius').getValue()).toBe(0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disc.getParameter('Sides').getValue()).toBe(32)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const disc = new Disc()
    disc.getParameter('Radius').setValue(4)
    disc.getParameter('Sides').setValue(16)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disc.getParameter('Radius').getValue()).toBe(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disc.getParameter('Sides').getValue()).toBe(16)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const disc = new Disc(3, 16)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = disc.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const disc = new Disc()
    const jsonStr = {
      params: {
        Radius: {
          value: 3,
        },
        Sides: {
          value: 16,
          range: [3, 200],
          step: 1,
        },
      },
      type: 'Disc',
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    disc.fromJSON(jsonStr)

    const newDisc = new Disc(3, 16)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disc.toJSON()).toEqual(newDisc.toJSON())
  })
})
