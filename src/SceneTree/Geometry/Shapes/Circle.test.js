import { Circle } from './Circle'

describe('Circle', () => {
  it('tests default parameters', () => {
    const circle = new Circle()

    expect(circle.getParameter('Radius').getValue()).toBe(1.0)
    expect(circle.getParameter('Angle').getValue()).toBe(Math.PI * 2)
    expect(circle.getParameter('NumSegments').getValue()).toBe(32)
  })

  it('updates parameters', () => {
    const circle = new Circle()
    circle.getParameter('Radius').setValue(2)
    circle.getParameter('Angle').setValue(Math.PI)
    circle.getParameter('NumSegments').setValue(64)

    expect(circle.getParameter('Radius').getValue()).toBe(2)
    expect(circle.getParameter('Angle').getValue()).toBe(Math.PI)
    expect(circle.getParameter('NumSegments').getValue()).toBe(64)
  })

  it('saves to JSON (serialization).', () => {
    const circle = new Circle(2, 6, Math.PI * 2)
    const outputJSON = circle.toJSON()

    expect(outputJSON).toMatchSnapshot()
  })

  it('restores from JSON (serialization).', () => {
    const circle = new Circle()
    const expectedOutput = {
      params: {
        Angle: { value: 6.283185307179586 },
        NumSegments: {
          range: [3, 200],
          step: 1,
          value: 6,
        },
        Radius: { value: 2 },
      },
      type: 'Circle',
      vertexAttributes: {},
    }
    circle.fromJSON(expectedOutput)

    const newCircle = new Circle(2, 6, Math.PI * 2)
    expect(circle.toJSON()).toEqual(newCircle.toJSON())
  })
})
