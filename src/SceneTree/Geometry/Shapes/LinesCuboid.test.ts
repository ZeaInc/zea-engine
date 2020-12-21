import { LinesCuboid } from './LinesCuboid'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LinesCuboid', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const linesCuboid = new LinesCuboid()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('X').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('Y').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('Z').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('BaseZAtZero').getValue()).toBeFalsy()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const linesCuboid = new LinesCuboid()
    linesCuboid.getParameter('X').setValue(3)
    linesCuboid.getParameter('Y').setValue(3)
    linesCuboid.getParameter('Z').setValue(3)
    linesCuboid.getParameter('BaseZAtZero').setValue(true)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('X').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('Y').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('Z').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.getParameter('BaseZAtZero').getValue()).toBeTruthy()
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const linesCuboid = new LinesCuboid(2, 2, 2, true)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = linesCuboid.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const linesCuboid = new LinesCuboid()
    const inputJSON = {
      params: { X: { value: 2 }, Y: { value: 2 }, Z: { value: 2 }, BaseZAtZero: { value: true } },
      type: 'LinesCuboid',
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    linesCuboid.fromJSON(inputJSON)

    const newLinesCuboid = new LinesCuboid(2, 2, 2, true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(linesCuboid.toJSON()).toEqual(newLinesCuboid.toJSON())
  })
})
