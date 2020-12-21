import { Circle } from './Circle'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Circle', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const circle = new Circle()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('Radius').getValue()).toBe(1.0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('Angle').getValue()).toBe(Math.PI * 2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('NumSegments').getValue()).toBe(32)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const circle = new Circle()
    circle.getParameter('Radius').setValue(2)
    circle.getParameter('Angle').setValue(Math.PI)
    circle.getParameter('NumSegments').setValue(64)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('Radius').getValue()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('Angle').getValue()).toBe(Math.PI)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.getParameter('NumSegments').getValue()).toBe(64)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const circle = new Circle(2, 6, Math.PI * 2)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = circle.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    circle.fromJSON(expectedOutput)

    const newCircle = new Circle(2, 6, Math.PI * 2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(circle.toJSON()).toEqual(newCircle.toJSON())
  })
})
