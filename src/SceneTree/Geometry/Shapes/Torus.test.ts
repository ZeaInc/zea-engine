import { Torus } from './Torus'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Torus', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('test default parameters.', () => {
    const torus = new Torus()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('InnerRadius').getValue()).toBe(0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('OuterRadius').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('Detail').getValue()).toBe(32)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('test update parameters.', () => {
    const torus = new Torus()
    torus.getParameter('InnerRadius').setValue(3)
    torus.getParameter('OuterRadius').setValue(5)
    torus.getParameter('Detail').setValue(16)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('InnerRadius').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('OuterRadius').getValue()).toBe(5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.getParameter('Detail').getValue()).toBe(16)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const torus = new Torus(3, 5, 8)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = torus.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        OuterRadius: {
          value: 5,
        },
      },
      type: 'Torus',
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    torus.fromJSON(inputJSON)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(torus.toJSON()).toEqual(new Torus(3, 5, 8).toJSON())
  })
})
