import { Grid } from './Grid'

describe('Grid', () => {
  it('tests default parameters', () => {
    const grid = new Grid()

    expect(grid.getParameter('X').getValue()).toBe(1)
    expect(grid.getParameter('Y').getValue()).toBe(1)
    expect(grid.getParameter('XDivisions').getValue()).toBe(10)
    expect(grid.getParameter('YDivisions').getValue()).toBe(10)
    expect(grid.getParameter('SkipCenterLines').getValue()).toBe(false)
  })

  it('updates parameters', () => {
    const grid = new Grid()
    grid.getParameter('X').setValue(2)
    grid.getParameter('Y').setValue(2)
    grid.getParameter('XDivisions').setValue(20)
    grid.getParameter('YDivisions').setValue(15)
    grid.getParameter('SkipCenterLines').setValue(true)

    expect(grid.getParameter('X').getValue()).toBe(2)
    expect(grid.getParameter('Y').getValue()).toBe(2)
    expect(grid.getParameter('XDivisions').getValue()).toBe(20)
    expect(grid.getParameter('YDivisions').getValue()).toBe(15)
    expect(grid.getParameter('SkipCenterLines').getValue()).toBe(true)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  it('saves to JSON (serialization).', () => {
    const grid = new Grid(4, 4, 2, 2, true)
    const outputJSON = grid.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

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
    grid.fromJSON(inputJSON)

    const newGrid = new Grid(4, 4, 2, 2, true)
    expect(grid.toJSON()).toEqual(newGrid.toJSON())
  })
})
