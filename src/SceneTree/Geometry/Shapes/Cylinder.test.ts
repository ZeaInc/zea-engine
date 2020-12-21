import { Cylinder } from './Cylinder'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Cylinder', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const cylinder = new Cylinder()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Radius').getValue()).toBe(0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Height').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Sides').getValue()).toBe(32)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Loops').getValue()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Caps').getValue()).toBeTruthy()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('BaseZAtZero').getValue()).toBeFalsy()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it.skip('updates parameters', () => {
    const cylinder = new Cylinder()

    cylinder.getParameter('Sides').setValue(16)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Sides').getValue()).toBe(16)

    cylinder.getParameter('Radius').setValue(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Radius').getValue()).toBe(3)

    cylinder.getParameter('Height').setValue(6)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Height').getValue()).toBe(6)

    cylinder.getParameter('Loops').setValue(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Loops').getValue()).toBe(3)

    cylinder.getParameter('Caps').setValue(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('Caps').getValue()).toBeFalsy()

    cylinder.getParameter('BaseZAtZero').setValue(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.getParameter('BaseZAtZero').getValue()).toBeTruthy()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const cylinder = new Cylinder(5, 0.2, 32)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = cylinder.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    cylinder.fromJSON(inputJSON)

    const newCylinder = new Cylinder(5, 0.2, 32)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cylinder.toJSON()).toEqual(newCylinder.toJSON())
  })
})
