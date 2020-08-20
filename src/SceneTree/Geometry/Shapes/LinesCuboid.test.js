import { LinesCuboid } from './LinesCuboid'

describe('LinesCuboid', () => {
  it('tests default parameters', () => {
    const linesCuboid = new LinesCuboid()

    expect(linesCuboid.getParameter('X').getValue()).toBe(1)
    expect(linesCuboid.getParameter('Y').getValue()).toBe(1)
    expect(linesCuboid.getParameter('Z').getValue()).toBe(1)
    expect(linesCuboid.getParameter('BaseZAtZero').getValue()).toBeFalsy()
  })

  it('updates parameters', () => {
    const linesCuboid = new LinesCuboid()
    linesCuboid.getParameter('X').setValue(3)
    linesCuboid.getParameter('Y').setValue(3)
    linesCuboid.getParameter('Z').setValue(3)
    linesCuboid.getParameter('BaseZAtZero').setValue(true)

    expect(linesCuboid.getParameter('X').getValue()).toBe(3)
    expect(linesCuboid.getParameter('Y').getValue()).toBe(3)
    expect(linesCuboid.getParameter('Z').getValue()).toBe(3)
    expect(linesCuboid.getParameter('BaseZAtZero').getValue()).toBeTruthy()
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  it('saves to JSON (serialization).', () => {
    const linesCuboid = new LinesCuboid(2, 2, 2, true)
    const outputJSON = linesCuboid.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const linesCuboid = new LinesCuboid()
    const inputJSON = {
      params: { X: { value: 2 }, Y: { value: 2 }, Z: { value: 2 }, BaseZAtZero: { value: true } },
      type: 'LinesCuboid',
      vertexAttributes: {},
    }
    linesCuboid.fromJSON(inputJSON)

    const newLinesCuboid = new LinesCuboid(2, 2, 2, true)
    expect(linesCuboid.toJSON()).toEqual(newLinesCuboid.toJSON())
  })
})
