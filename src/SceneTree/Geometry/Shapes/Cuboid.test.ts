import { Cuboid } from './Cuboid'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Cuboid', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const cuboid = new Cuboid()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('X').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('Y').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('Z').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('BaseZAtZero').getValue()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const cuboid = new Cuboid()
    cuboid.getParameter('X').setValue(3)
    cuboid.getParameter('Y').setValue(4)
    cuboid.getParameter('Z').setValue(5)
    cuboid.getParameter('BaseZAtZero').setValue(true)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('X').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('Y').getValue()).toBe(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('Z').getValue()).toBe(5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.getParameter('BaseZAtZero').getValue()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const cuboid = new Cuboid(4, 6, 4)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = cuboid.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    cuboid.fromJSON(inputJSON)

    const newCuboid = new Cuboid(4, 6, 4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cuboid.toJSON()).toEqual(newCuboid.toJSON())
  })
})
