import { Torus } from './Torus'

describe('Torus', () => {
  test('test default parameters.', () => {
    const torus = new Torus()

    expect(torus.getParameter('InnerRadius').getValue()).toBe(0.5)
    expect(torus.getParameter('OuterRadius').getValue()).toBe(3)
    expect(torus.getParameter('Detail').getValue()).toBe(32)
    expect(torus.getParameter('Loops').getValue()).toBe(6)
  })

  test('test update parameters.', () => {
    const torus = new Torus()
    torus.getParameter('InnerRadius').setValue(3)
    torus.getParameter('OuterRadius').setValue(5)
    torus.getParameter('Detail').setValue(16)
    torus.getParameter('Loops').setValue(10)

    expect(torus.getParameter('InnerRadius').getValue()).toBe(3)
    expect(torus.getParameter('OuterRadius').getValue()).toBe(5)
    expect(torus.getParameter('Detail').getValue()).toBe(16)
    expect(torus.getParameter('Loops').getValue()).toBe(10)
  })

  it('saves to JSON (serialization).', () => {
    const torus = new Torus(3, 5, 8)
    const outputJSON = torus.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const torus = new Torus()
    const inputJSON = {
      params: {
        Detail: {
          range: [3, 200],
          step: 1,
          value: 8,
        },
        InnerRadius: {
          value: 3,
        },
        Loops: {
          range: [3, 200],
          step: 1,
          value: 6,
        },
        OuterRadius: {
          range: [3, 200],
          step: 1,
          value: 5,
        },
      },
      type: 'Torus',
      vertexAttributes: {},
    }
    torus.fromJSON(inputJSON)

    expect(torus.toJSON()).toEqual(new Torus(3, 5, 8).toJSON())
  })
})
