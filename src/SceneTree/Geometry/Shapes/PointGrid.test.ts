import { PointGrid } from './PointGrid'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PointGrid', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const pointGrid = new PointGrid()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('X').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('Y').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('XDivisions').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('YDivisions').getValue()).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const pointGrid = new PointGrid()

    pointGrid.getParameter('X').setValue(5)
    pointGrid.getParameter('Y').setValue(5)
    pointGrid.getParameter('XDivisions').setValue(10)
    pointGrid.getParameter('YDivisions').setValue(10)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('X').getValue()).toBe(5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('Y').getValue()).toBe(5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('XDivisions').getValue()).toBe(10)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.getParameter('YDivisions').getValue()).toBe(10)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const pointGrid = new PointGrid(3, 3, 6, 6, true)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = pointGrid.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const pointGrid = new PointGrid()
    const inputJSON = {
      params: {
        X: {
          value: 3,
        },
        XDivisions: {
          value: 6,
        },
        Y: {
          value: 3,
        },
        YDivisions: {
          value: 6,
        },
      },
      type: 'PointGrid',
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    pointGrid.fromJSON(inputJSON)

    const newPointGrid = new PointGrid(3, 3, 6, 6, true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(pointGrid.toJSON()).toEqual(newPointGrid.toJSON())
  })
})
