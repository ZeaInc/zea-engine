import { Plane } from './Plane'

describe('Plane', () => {
  it('tests default parameters', () => {
    const plane = new Plane()

    expect(plane.getParameter('SizeX').getValue()).toBe(1)
    expect(plane.getParameter('SizeY').getValue()).toBe(1)
    expect(plane.getParameter('DetailX').getValue()).toBe(1)
    expect(plane.getParameter('DetailY').getValue()).toBe(1)
  })

  it('updates parameters', () => {
    const plane = new Plane()
    plane.getParameter('SizeX').setValue(3)
    plane.getParameter('SizeY').setValue(3)
    plane.getParameter('DetailX').setValue(3)
    plane.getParameter('DetailY').setValue(4)

    expect(plane.getParameter('SizeX').getValue()).toBe(3)
    expect(plane.getParameter('SizeY').getValue()).toBe(3)
    expect(plane.getParameter('DetailX').getValue()).toBe(3)
    expect(plane.getParameter('DetailY').getValue()).toBe(4)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  it('saves to JSON (serialization).', () => {
    const plane = new Plane(2, 2, 2, 2, true, true)
    const outputJSON = plane.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const plane = new Plane()
    const inputJSON = {
      params: { SizeX: { value: 2 }, SizeY: { value: 2 }, DetailX: { value: 2 }, DetailY: { value: 2 } },
      type: 'Plane',
      numVertices: 9,
      vertexAttributes: {},
    }
    plane.fromJSON(inputJSON)

    const newPlane = new Plane(2, 2, 2, 2, true, true)
    expect(plane.toJSON()).toEqual(newPlane.toJSON())
  })
})
