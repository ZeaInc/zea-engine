import { Cuboid } from './Cuboid'

describe('Cuboid', () => {
  it('tests default parameters', () => {
    const cuboid = new Cuboid()

    expect(cuboid.getParameter('X').getValue()).toBe(1)
    expect(cuboid.getParameter('Y').getValue()).toBe(1)
    expect(cuboid.getParameter('Z').getValue()).toBe(1)
    expect(cuboid.getParameter('BaseZAtZero').getValue()).toBe(false)
  })

  it('updates parameters', () => {
    const cuboid = new Cuboid()
    cuboid.getParameter('X').setValue(3)
    cuboid.getParameter('Y').setValue(4)
    cuboid.getParameter('Z').setValue(5)
    cuboid.getParameter('BaseZAtZero').setValue(true)

    expect(cuboid.getParameter('X').getValue()).toBe(3)
    expect(cuboid.getParameter('Y').getValue()).toBe(4)
    expect(cuboid.getParameter('Z').getValue()).toBe(5)
    expect(cuboid.getParameter('BaseZAtZero').getValue()).toBe(true)
  })

  it('saves to JSON (serialization).', () => {
    const cuboid = new Cuboid(4, 6, 4)
    const outputJSON = cuboid.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const cuboid = new Cuboid(4, 6, 4)
    const inputJSON = {
      params: {
        BaseZAtZero: {
          value: false,
        },
        X: {
          value: 4,
        },
        Y: {
          value: 6,
        },
        Z: {
          value: 4,
        },
      },
      type: 'Cuboid',
      vertexAttributes: {},
    }
    cuboid.fromJSON(inputJSON)

    const newCuboid = new Cuboid(4, 6, 4)
    expect(cuboid.toJSON()).toEqual(newCuboid.toJSON())
  })
})
