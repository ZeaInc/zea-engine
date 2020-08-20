import { PointGrid } from './PointGrid'

describe('PointGrid', () => {
  it('tests default parameters', () => {
    const pointGrid = new PointGrid()

    expect(pointGrid.getParameter('X').getValue()).toBe(1)
    expect(pointGrid.getParameter('Y').getValue()).toBe(1)
    expect(pointGrid.getParameter('XDivisions').getValue()).toBe(1)
    expect(pointGrid.getParameter('YDivisions').getValue()).toBe(1)
  })

  it('updates parameters', () => {
    const pointGrid = new PointGrid()

    pointGrid.getParameter('X').setValue(5)
    pointGrid.getParameter('Y').setValue(5)
    pointGrid.getParameter('XDivisions').setValue(10)
    pointGrid.getParameter('YDivisions').setValue(10)

    expect(pointGrid.getParameter('X').getValue()).toBe(5)
    expect(pointGrid.getParameter('Y').getValue()).toBe(5)
    expect(pointGrid.getParameter('XDivisions').getValue()).toBe(10)
    expect(pointGrid.getParameter('YDivisions').getValue()).toBe(10)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  it('saves to JSON (serialization).', () => {
    const pointGrid = new PointGrid(3, 3, 6, 6, true)
    const outputJSON = pointGrid.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

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
    pointGrid.fromJSON(inputJSON)

    const newPointGrid = new PointGrid(3, 3, 6, 6, true)
    expect(pointGrid.toJSON()).toEqual(newPointGrid.toJSON())
  })
})
