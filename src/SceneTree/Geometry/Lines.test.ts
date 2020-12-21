import { Lines } from './Lines'
import { Vec3 } from '../../Math'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Lines', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for default positions attribute.', () => {
    const lines = new Lines()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.hasVertexAttribute('positions')).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check for positions attribute has the same length as the number of vertices.', () => {
    const lines = new Lines()
    const numVertices = 3
    lines.setNumVertices(numVertices)

    const positions = lines.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    lines.setNumSegments(2)
    lines.setSegmentVertexIndices(0, 0, 1)
    lines.setSegmentVertexIndices(1, 1, 2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 0)).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 1)).toBe(2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getVertexAttribute('positions').length).toBe(numVertices)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check resizing bigger the line segment indices.', () => {
    const lines = new Lines()
    const numVertices = 3
    lines.setNumVertices(numVertices)

    lines.setNumSegments(2)
    lines.setSegmentVertexIndices(0, 0, 1)
    lines.setSegmentVertexIndices(1, 1, 2)

    lines.setNumSegments(3)
    lines.setSegmentVertexIndices(2, 2, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 0)).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 1)).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getIndices(1, 1)).toEqual(new Uint32Array([0, 1, 1, 2, 2, 0]))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check resizing smaller the line segment indices.', () => {
    const lines = new Lines()
    const numVertices = 3
    lines.setNumVertices(numVertices)

    lines.setNumSegments(3)
    lines.setSegmentVertexIndices(0, 0, 1)
    lines.setSegmentVertexIndices(1, 1, 2)
    lines.setSegmentVertexIndices(2, 2, 0)

    lines.setNumSegments(2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 0)).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 1)).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getIndices(1, 1)).toEqual(new Uint32Array([0, 1, 1, 2]))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('Check generated buffers', () => {
    const lines = new Lines()
    const numVertices = 3
    lines.setNumVertices(numVertices)

    const positions = lines.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    lines.setNumSegments(2)
    lines.setSegmentVertexIndices(0, 0, 1)
    lines.setSegmentVertexIndices(1, 1, 2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 0)).toBe(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getSegmentVertexIndex(1, 1)).toBe(2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.genBuffers()).toEqual({
      attrBuffers: {
        positions: {
          count: 3,
          dataType: Vec3,
          normalized: false,
          values: new Float32Array([1, 2, 3, -1, -2, -3, 2, 1, -3]),
        },
      },
      indices: new Uint8Array([0, 1, 1, 2]),
      numVertices: 3,
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    const lines = new Lines()
    const numVertices = 3
    lines.setNumVertices(numVertices)
    const positions = lines.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    lines.setNumSegments(2)
    lines.setSegmentVertexIndices(0, 0, 1)
    lines.setSegmentVertexIndices(1, 1, 2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(lines.toJSON())).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    const lines = new Lines()
    const input = {
      type: 'Lines',
      numVertices: 3,
      vertexAttributes: {
        positions: { data: [1, 2, 3, -1, -2, -3, 2, 1, -3], dataType: 'Vec3', defaultValue: 0, length: 3 },
      },
      indices: [0, 1, 1, 2],
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    lines.fromJSON(input)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getVertexAttribute('positions').length).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(lines.getNumSegments()).toBe(2)
  })
})
