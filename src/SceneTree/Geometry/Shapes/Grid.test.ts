import { Grid } from './Grid'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Grid', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const grid = new Grid()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('X').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('Y').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('XDivisions').getValue()).toBe(10)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('YDivisions').getValue()).toBe(10)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('SkipCenterLines').getValue()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const grid = new Grid()
    grid.getParameter('X').setValue(2)
    grid.getParameter('Y').setValue(2)
    grid.getParameter('XDivisions').setValue(20)
    grid.getParameter('YDivisions').setValue(15)
    grid.getParameter('SkipCenterLines').setValue(true)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('X').getValue()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('Y').getValue()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('XDivisions').getValue()).toBe(20)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('YDivisions').getValue()).toBe(15)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.getParameter('SkipCenterLines').getValue()).toBe(true)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const grid = new Grid(4, 4, 2, 2, true)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = grid.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const grid = new Grid()
    const inputJSON = {
      params: {
        X: { value: 4 },
        Y: { value: 4 },
        XDivisions: { value: 2 },
        YDivisions: { value: 2 },
        SkipCenterLines: { value: true },
      },
      type: 'Grid',
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    grid.fromJSON(inputJSON)

    const newGrid = new Grid(4, 4, 2, 2, true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(grid.toJSON()).toEqual(newGrid.toJSON())
  })
})
