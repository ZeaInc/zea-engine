import { Points } from './Points'
import { Vec2, Vec3, Box3 } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Points', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for default positions attribute.', () => {
    const points = new Points()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.hasVertexAttribute('positions')).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for positions attribute has the same length as the number of vertices.', () => {
    const points = new Points()
    const numVertices = 10
    points.setNumVertices(numVertices)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.getVertexAttribute('positions').length).toBe(numVertices)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check if new attribute has the same length as the number of vertices.', () => {
    const points = new Points()
    const numVertices = 10
    points.setNumVertices(numVertices)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '1' is not assignable to paramete... Remove this comment to see the full error message
    points.addVertexAttribute('foo', Vec2, 1.0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.getVertexAttribute('foo').length).toBe(numVertices)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.getVertexAttribute('foo').getValueRef(0).toJSON()).toStrictEqual({ x: 1, y: 1 })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for calculation of bounding box.', () => {
    const points = new Points()
    const numVertices = 3
    points.setNumVertices(numVertices)
    const positions = points.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    points.setBoundingBoxDirty()

    const box3 = new Box3()
    box3.min.set(-1, -2, -3)
    box3.max.set(2, 2, 3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.getBoundingBox()).toEqual(box3)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check resizing bigger the number of vertices.', () => {
    const points = new Points()

    points.setNumVertices(3)
    const positions = points.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    points.setNumVertices(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(positions.getValueRef(0)).toEqual(new Vec3(1, 2, 3))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check resizing smaller the number of vertices.', () => {
    const points = new Points()

    points.setNumVertices(3)
    const positions = points.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    points.setNumVertices(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(positions.getValueRef(0)).toEqual(new Vec3(1, 2, 3))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check generated buffers', () => {
    const points = new Points()
    const numVertices = 3
    points.setNumVertices(numVertices)
    const positions = points.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.genBuffers()).toEqual({
      attrBuffers: {
        positions: {
          count: 3,
          dataType: Vec3,
          normalized: false,
          values: new Float32Array([1, 2, 3, -1, -2, -3, 2, 1, -3]),
        },
      },
      numVertices: 3,
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const points = new Points()
    const numVertices = 3
    points.setNumVertices(numVertices)
    const positions = points.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(points.toJSON())).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    const points = new Points()
    const input = {
      type: 'Points',
      numVertices: 3,
      vertexAttributes: {
        positions: { data: [1, 2, 3, -1, -2, -3, 2, 1, -3], dataType: 'Vec3', defaultValue: 0, length: 3 },
      },
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    points.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(points.getVertexAttribute('positions').length).toBe(3)
  })
})
