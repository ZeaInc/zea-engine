import { Plane } from './Plane'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Plane', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('tests default parameters', () => {
    const plane = new Plane()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('SizeX').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('SizeY').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('DetailX').getValue()).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('DetailY').getValue()).toBe(1)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('updates parameters', () => {
    const plane = new Plane()
    plane.getParameter('SizeX').setValue(3)
    plane.getParameter('SizeY').setValue(3)
    plane.getParameter('DetailX').setValue(3)
    plane.getParameter('DetailY').setValue(4)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('SizeX').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('SizeY').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('DetailX').getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.getParameter('DetailY').getValue()).toBe(4)
  })

  // There's an issue with flags, that are preventing parameters to be exported.
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const plane = new Plane(2, 2, 2, 2, true, true)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const outputJSON = plane.toJSON()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outputJSON).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('restores from JSON (serialization).', () => {
    const plane = new Plane()
    const inputJSON = {
      params: { SizeX: { value: 2 }, SizeY: { value: 2 }, DetailX: { value: 2 }, DetailY: { value: 2 } },
      type: 'Plane',
      numVertices: 9,
      vertexAttributes: {},
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    plane.fromJSON(inputJSON)

    const newPlane = new Plane(2, 2, 2, 2, true, true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(plane.toJSON()).toEqual(newPlane.toJSON())
  })
})
