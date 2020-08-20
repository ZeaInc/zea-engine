import { Cylinder } from './Cylinder'

describe('Cylinder', () => {
  it('tests default parameters', () => {
    const cylinder = new Cylinder()

    expect(cylinder.getParameter('Radius').getValue()).toBe(0.5)
    expect(cylinder.getParameter('Height').getValue()).toBe(1)
    expect(cylinder.getParameter('Sides').getValue()).toBe(32)
    expect(cylinder.getParameter('Loops').getValue()).toBe(2)
    expect(cylinder.getParameter('Caps').getValue()).toBeTruthy()
    expect(cylinder.getParameter('BaseZAtZero').getValue()).toBeFalsy()
  })

  it.skip('updates parameters', () => {
    const cylinder = new Cylinder()

    cylinder.getParameter('Sides').setValue(16)
    expect(cylinder.getParameter('Sides').getValue()).toBe(16)

    cylinder.getParameter('Radius').setValue(3)
    expect(cylinder.getParameter('Radius').getValue()).toBe(3)

    cylinder.getParameter('Height').setValue(6)
    expect(cylinder.getParameter('Height').getValue()).toBe(6)

    cylinder.getParameter('Loops').setValue(3)
    expect(cylinder.getParameter('Loops').getValue()).toBe(3)

    cylinder.getParameter('Caps').setValue(false)
    expect(cylinder.getParameter('Caps').getValue()).toBeFalsy()

    cylinder.getParameter('BaseZAtZero').setValue(true)
    expect(cylinder.getParameter('BaseZAtZero').getValue()).toBeTruthy()
  })

  it('saves to JSON (serialization).', () => {
    const cylinder = new Cylinder(5, 0.2, 32)
    const outputJSON = cylinder.toJSON()

    expect(outputJSON).toEqual({
      params: {
        BaseZAtZero: {
          value: false,
        },
        Caps: {
          value: true,
        },
        Height: {
          value: 0.2,
        },
        Loops: {
          range: [1, 200],
          step: 1,
          value: 2,
        },
        Radius: {
          value: 5,
        },
        Sides: {
          range: [3, 200],
          step: 1,
          value: 32,
        },
      },
      type: 'Cylinder',
      vertexAttributes: {},
    })
  })

  it('restores from JSON (serialization).', () => {
    const cylinder = new Cylinder()
    const inputJSON = {
      params: {
        BaseZAtZero: {
          value: false,
        },
        Caps: {
          value: true,
        },
        Height: {
          value: 0.2,
        },
        Loops: {
          range: [1, 200],
          step: 1,
          value: 2,
        },
        Radius: {
          value: 5,
        },
        Sides: {
          range: [3, 200],
          step: 1,
          value: 32,
        },
      },
      type: 'Cylinder',
      vertexAttributes: {},
    }
    cylinder.fromJSON(inputJSON)

    const newCylinder = new Cylinder(5, 0.2, 32)
    expect(cylinder.toJSON()).toEqual(newCylinder.toJSON())
  })
})
