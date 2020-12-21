import { Sphere } from './Sphere'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Sphere', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('test default parameters.', () => {
    const sphere = new Sphere()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Radius').getValue()).toBe(1.0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Sides').getValue()).toBe(12)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Loops').getValue()).toBe(12)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('test update parameters.', () => {
    const sphere = new Sphere()
    sphere.getParameter('Radius').setValue(2.6)
    sphere.getParameter('Sides').setValue(24)
    sphere.getParameter('Loops').setValue(30)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Radius').getValue()).toBe(2.6)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Sides').getValue()).toBe(24)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.getParameter('Loops').getValue()).toBe(30)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const sphere = new Sphere(2.6, 5, 5)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = sphere.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    sphere.fromJSON(inputJSON)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(sphere.toJSON()).toEqual(new Sphere(2.6, 5, 5).toJSON())
  })
})
