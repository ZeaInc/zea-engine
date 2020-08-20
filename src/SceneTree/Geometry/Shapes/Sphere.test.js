import { Sphere } from './Sphere'

describe('Sphere', () => {
  test('test default parameters.', () => {
    const sphere = new Sphere()

    expect(sphere.getParameter('Radius').getValue()).toBe(1.0)
    expect(sphere.getParameter('Sides').getValue()).toBe(12)
    expect(sphere.getParameter('Loops').getValue()).toBe(12)
  })

  test('test update parameters.', () => {
    const sphere = new Sphere()
    sphere.getParameter('Radius').setValue(2.6)
    sphere.getParameter('Sides').setValue(24)
    sphere.getParameter('Loops').setValue(30)

    expect(sphere.getParameter('Radius').getValue()).toBe(2.6)
    expect(sphere.getParameter('Sides').getValue()).toBe(24)
    expect(sphere.getParameter('Loops').getValue()).toBe(30)
  })

  it('saves to JSON (serialization).', () => {
    const sphere = new Sphere(2.6, 5, 5)
    const outputJSON = sphere.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const sphere = new Sphere()
    const inputJSON = {
      params: {
        Loops: {
          range: [3, 200],
          step: 1,
          value: 5,
        },
        Radius: {
          value: 2.6,
        },
        Sides: {
          range: [3, 200],
          step: 1,
          value: 5,
        },
      },
      type: 'Sphere',
      vertexAttributes: {},
    }
    sphere.fromJSON(inputJSON)

    expect(sphere.toJSON()).toEqual(new Sphere(2.6, 5, 5).toJSON())
  })
})
