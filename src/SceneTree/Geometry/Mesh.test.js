import { Mesh } from './Mesh'
import { Vec2, Vec3, Box3 } from '../../Math'

describe('Mesh', () => {
  test('Check for default positions attribute.', () => {
    const mesh = new Mesh()
    expect(mesh.hasVertexAttribute('positions')).toBe(true)
    expect(mesh.getNumFaces()).toBe(0)
  })

  test('Check various face counts and offset', () => {
    const mesh = new Mesh()
    mesh.setFaceCounts([7, 5, 3])
    mesh.setFaceVertexIndices(3, [0, 1, 2])
    mesh.setFaceVertexIndices(9, [0, 1, 2, 3])
    mesh.setFaceVertexIndices(13, [0, 1, 2, 3, 4])
    expect(() => {
      mesh.setFaceVertexIndices(14, [0, 1, 2, 3, 4, 5])
    }).toThrow()

    expect(mesh.getFaceVertexCount(3)).toBe(3)
    expect(mesh.getFaceVertexCount(9)).toBe(4)
    expect(mesh.getFaceVertexCount(13)).toBe(5)
    expect(mesh.getFaceVertexIndices(3)).toEqual([0, 1, 2])
    expect(mesh.getFaceVertexIndices(9)).toEqual([0, 1, 2, 3])
    expect(mesh.getFaceVertexIndices(13)).toEqual([0, 1, 2, 3, 4])
  })

  test('Check adding a triangle', () => {
    const mesh = new Mesh()
    // The first face is a quad.
    mesh.addFace([0, 1, 2])
    expect(mesh.getNumFaces()).toBe(1)
    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
  })

  test('Check adding a quad', () => {
    const mesh = new Mesh()
    // The first face is a quad.
    mesh.addFace([0, 1, 2, 3])
    expect(mesh.getNumFaces()).toBe(1)
    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2, 3])
  })

  test('Check adding faces one at a time', () => {
    const mesh = new Mesh()

    mesh.addFace([0, 1, 2])
    mesh.addFace([0, 1, 2, 3])
    mesh.addFace([0, 1, 2, 3, 4])
    mesh.addFace([0, 1, 2])
    mesh.addFace([0, 1, 2, 3, 4, 5])

    expect(mesh.getFaceVertexCount(0)).toBe(3)
    expect(mesh.getFaceVertexCount(2)).toBe(4)
    expect(mesh.getFaceVertexCount(3)).toBe(5)
    expect(mesh.getFaceVertexCount(1)).toBe(3)
    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
    expect(mesh.getFaceVertexIndices(2)).toEqual([0, 1, 2, 3])
    expect(mesh.getFaceVertexIndices(3)).toEqual([0, 1, 2, 3, 4])
    expect(mesh.getFaceVertexIndices(1)).toEqual([0, 1, 2])
    expect(mesh.getFaceVertexIndices(4)).toEqual([0, 1, 2, 3, 4, 5])
  })

  test('Check for setting up a single triangle', () => {
    const mesh = new Mesh()
    const numVertices = 3
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    mesh.setFaceCounts([1])
    mesh.setFaceVertexIndices(0, [0, 1, 2])

    expect(mesh.getNumFaces()).toBe(1)
    expect(mesh.getFaceVertexCount(0)).toBe(3)
    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
    expect(mesh.computeHardEdgesIndices()).toEqual(new Uint32Array([0, 1, 1, 2, 0, 2]))

    expect(mesh.getVertexAttribute('positions').length).toBe(numVertices)
  })

  test('Check for setting up a single quad', () => {
    const mesh = new Mesh()
    const numVertices = 4
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(0, -1, -1)
    positions.getValueRef(1).set(0, -1, 1)
    positions.getValueRef(2).set(0, 1, 1)
    positions.getValueRef(3).set(0, 1, -1)

    const normals = mesh.addVertexAttribute('normals', Vec3, 0.0)
    normals.getValueRef(0).set(-1, 0, 0)
    normals.getValueRef(1).set(-1, 0, 0)
    normals.getValueRef(2).set(-1, 0, 0)
    normals.getValueRef(3).set(-1, 0, 0)

    mesh.setFaceCounts([0, 1])
    mesh.setFaceVertexIndices(0, [0, 1, 2, 3])
    expect(mesh.computeHardEdgesIndices()).toEqual(new Uint32Array([0, 1, 1, 2, 2, 3, 0, 3]))

    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2, 3])
  })

  test('Check for setting up 2 neighboring quads', () => {
    const mesh = new Mesh()
    const numVertices = 6
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(0, -1, -1)
    positions.getValueRef(1).set(0, -1, 1)
    positions.getValueRef(2).set(0, 1, 1)
    positions.getValueRef(3).set(0, 1, -1)
    positions.getValueRef(4).set(1, 1, 1)
    positions.getValueRef(5).set(1, 1, -1)

    mesh.setFaceCounts([0, 2])
    mesh.setFaceVertexIndices(0, [0, 1, 2, 3])
    mesh.setFaceVertexIndices(1, [3, 2, 4, 5])

    const normals = mesh.addVertexAttribute('normals', Vec3, 0.0)

    // The first face has normals along the -X axis
    normals.setFaceVertexValue(0, 0, new Vec3(-1, 0, 0))
    normals.setFaceVertexValue(0, 1, new Vec3(-1, 0, 0))
    normals.setFaceVertexValue(0, 2, new Vec3(-1, 0, 0))
    normals.setFaceVertexValue(0, 3, new Vec3(-1, 0, 0))

    // The second face has normals along the Y axis
    normals.setFaceVertexValue(1, 0, new Vec3(0, 1, 0))
    normals.setFaceVertexValue(1, 1, new Vec3(0, 1, 0))
    normals.setFaceVertexValue(1, 2, new Vec3(0, 1, 0))
    normals.setFaceVertexValue(1, 3, new Vec3(0, 1, 0))

    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2, 3])
    expect(mesh.getFaceVertexIndices(1)).toEqual([3, 2, 4, 5])
  })

  test('Check computing normals on 2 neighboring quads', () => {
    const mesh = new Mesh()
    const numVertices = 6
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(0, -1, -1)
    positions.getValueRef(1).set(0, -1, 1)
    positions.getValueRef(2).set(0, 1, 1)
    positions.getValueRef(3).set(0, 1, -1)
    positions.getValueRef(4).set(1, 1, 1)
    positions.getValueRef(5).set(1, 1, -1)

    mesh.setFaceCounts([0, 2, 0])
    mesh.setFaceVertexIndices(0, [0, 1, 2, 3])
    mesh.setFaceVertexIndices(1, [3, 2, 4, 5])

    mesh.computeVertexNormals()

    // Now check that the 2 faces have normals
    const faceNormals = mesh.getFaceAttribute('normals')
    expect(faceNormals.getValueRef(0)).toEqual(new Vec3(1, 0, 0))
    expect(faceNormals.getValueRef(1)).toEqual(new Vec3(0, -1, 0))

    // Now we check that the 2 normal values for the ve
    // vertex id 2 is used by Face 0 at facevertex 2, and Face 1 and facevertex index 1
    // vertex id 3 is used by Face 0 at facevertex 3, and Face 1 and facevertex index 0
    const normals = mesh.getVertexAttribute('normals')
    expect(normals.getFaceVertexValueRef(0, 2)).toEqual(new Vec3(1, 0, 0))
    expect(normals.getFaceVertexValueRef(1, 1)).toEqual(new Vec3(0, -1, 0))
    expect(normals.getFaceVertexValueRef(0, 3)).toEqual(new Vec3(1, 0, 0))
    expect(normals.getFaceVertexValueRef(1, 0)).toEqual(new Vec3(0, -1, 0))

    expect(JSON.stringify(mesh.toJSON())).toMatchSnapshot()
  })

  test('Check computing edge indices', () => {
    const mesh = new Mesh()
    const numVertices = 6
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(0, -1, -1)
    positions.getValueRef(1).set(0, -1, 1)
    positions.getValueRef(2).set(0, 1, 1)
    positions.getValueRef(3).set(0, 1, -1)
    positions.getValueRef(4).set(0, 2, 1)
    positions.getValueRef(5).set(0, 2, -1)

    mesh.addFace([0, 1, 2, 3])
    mesh.addFace([3, 2, 4, 5])

    expect(mesh.computeHardEdgesIndices()).toEqual(new Uint32Array([0, 1, 1, 2, 0, 3, 2, 4, 4, 5, 3, 5]))
  })

  test('Check computing edge indices (hard edge in the middle)', () => {
    const mesh = new Mesh()
    const numVertices = 6
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(0, -1, -1)
    positions.getValueRef(1).set(0, -1, 1)
    positions.getValueRef(2).set(0, 1, 1)
    positions.getValueRef(3).set(0, 1, -1)
    positions.getValueRef(4).set(1, 1, 1)
    positions.getValueRef(5).set(1, 1, -1)

    mesh.addFace([0, 1, 2, 3])
    mesh.addFace([3, 2, 4, 5])

    expect(mesh.computeHardEdgesIndices()).toEqual(new Uint32Array([0, 1, 1, 2, 2, 3, 0, 3, 2, 4, 4, 5, 3, 5]))
  })

  test('Check resizing bigger the face indices.', () => {
    const mesh = new Mesh()
    const numVertices = 4
    mesh.setNumVertices(numVertices)

    // one triangle and one quad.
    mesh.setFaceCounts([1, 1])
    mesh.setFaceVertexIndices(0, [0, 1, 2])
    mesh.setFaceVertexIndices(1, [0, 1, 2, 3])

    // Now we add another triangle
    mesh.setFaceCounts([2, 1])
    mesh.setFaceVertexIndices(1, [2, 1, 3])

    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
    expect(mesh.getFaceVertexIndices(1)).toEqual([2, 1, 3])
    expect(mesh.getFaceVertexIndices(2)).toEqual([0, 1, 2, 3])
  })

  test.skip('Check resizing smaller the face indices.', () => {
    const mesh = new Mesh()
    const numVertices = 4
    mesh.setNumVertices(numVertices)

    // two triangleas and one quad.
    mesh.setFaceCounts([2, 1])
    mesh.setFaceVertexIndices(0, [0, 1, 2])
    mesh.setFaceVertexIndices(1, [2, 1, 3])
    mesh.setFaceVertexIndices(1, [2, 1, 3])

    // remove a triangle. Now one triangle and one quad.
    mesh.setFaceCounts([1, 1])

    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
    expect(mesh.getFaceVertexIndices(1)).toEqual([0, 1, 2, 3])
  })

  test('Check generated buffers', () => {
    const mesh = new Mesh()
    const numVertices = 3
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    mesh.setFaceCounts([1])
    mesh.setFaceVertexIndices(0, [0, 1, 2])

    expect(mesh.genBuffers()).toEqual({
      attrBuffers: {
        positions: {
          count: 3,
          dataType: Vec3,
          dimension: 3,
          normalized: false,
          values: new Float32Array([1, 2, 3, -1, -2, -3, 2, 1, -3]),
        },
      },
      indices: new Uint8Array([0, 1, 2]),
      numRenderVerts: 3,
      numVertices: 3,
    })
  })

  test('saves to JSON (serialization).', () => {
    const mesh = new Mesh()
    const numVertices = 3
    mesh.setNumVertices(numVertices)

    const positions = mesh.getVertexAttribute('positions')
    positions.getValueRef(0).set(1, 2, 3)
    positions.getValueRef(1).set(-1, -2, -3)
    positions.getValueRef(2).set(2, 1, -3)

    mesh.setFaceCounts([1])
    mesh.setFaceVertexIndices(0, [0, 1, 2])

    expect(JSON.stringify(mesh.toJSON())).toMatchSnapshot()
  })

  test('loads from JSON (serialization).', () => {
    const mesh = new Mesh()
    const input = {
      type: 'Mesh',
      numVertices: 3,
      vertexAttributes: {
        positions: {
          data: [1, 2, 3, -1, -2, -3, 2, 1, -3],
          dataType: 'Vec3',
          defaultValue: 0,
          length: 3,
          splits: {},
          splitValues: [],
        },
      },
      faceCounts: [1],
      faceVertexIndices: [0, 1, 2],
    }
    mesh.fromJSON(input)

    expect(mesh.getVertexAttribute('positions').length).toBe(3)
    expect(mesh.getFaceCounts()).toEqual([1])
    expect(mesh.getFaceVertexIndices(0)).toEqual([0, 1, 2])
  })
})
