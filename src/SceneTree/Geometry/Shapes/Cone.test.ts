import { Cone } from './Cone'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Cone', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const cone = new Cone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Radius').getValue()).toBe(0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Height').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Detail').getValue()).toBe(32)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Cap').getValue()).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const cone = new Cone()
    cone.getParameter('Radius').setValue(1)
    cone.getParameter('Height').setValue(2)
    cone.getParameter('Detail').setValue(16)
    cone.getParameter('Cap').setValue(false)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Radius').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Height').getValue()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Detail').getValue()).toBe(16)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.getParameter('Cap').getValue()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const cone = new Cone(2, 5, 8, true)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = cone.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    cone.fromJSON(expectedOutput)

    const newCone = new Cone(2, 5, 8, true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cone.toJSON()).toEqual(newCone.toJSON())
  })
})
