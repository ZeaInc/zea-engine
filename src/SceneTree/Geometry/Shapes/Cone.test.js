import { Cone } from './Cone'

describe('Cone', () => {
  it('tests default parameters', () => {
    const cone = new Cone()

    expect(cone.getParameter('Radius').getValue()).toBe(0.5)
    expect(cone.getParameter('Height').getValue()).toBe(1)
    expect(cone.getParameter('Detail').getValue()).toBe(32)
    expect(cone.getParameter('Cap').getValue()).toBe(true)
  })

  it('updates parameters', () => {
    const cone = new Cone()
    cone.getParameter('Radius').setValue(1)
    cone.getParameter('Height').setValue(2)
    cone.getParameter('Detail').setValue(16)
    cone.getParameter('Cap').setValue(false)

    expect(cone.getParameter('Radius').getValue()).toBe(1)
    expect(cone.getParameter('Height').getValue()).toBe(2)
    expect(cone.getParameter('Detail').getValue()).toBe(16)
    expect(cone.getParameter('Cap').getValue()).toBe(false)
  })

  it('saves to JSON (serialization).', () => {
    const cone = new Cone(2, 5, 8, true)
    const outputJSON = cone.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const cone = new Cone()
    const expectedOutput = {
      params: {
        Cap: {
          value: true,
        },
        Detail: {
          range: [3, 200],
          step: 1,
          value: 8,
        },
        Height: {
          value: 5,
        },
        Radius: {
          value: 2,
        },
      },
      type: 'Cone',
      vertexAttributes: {},
    }

    cone.fromJSON(expectedOutput)

    const newCone = new Cone(2, 5, 8, true)
    expect(cone.toJSON()).toEqual(newCone.toJSON())
  })
})
