/* eslint-disable prefer-rest-params */
/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { Vec3 } from '../../Math/Vec3'
import { BaseGeom } from './BaseGeom.js'
import { Attribute } from './Attribute.js'

import { VertexAttribute } from './VertexAttribute.js'
import Registry from '../../Registry'

/**
 * The Mesh class provides a flexible and fast polygon mesh representation. It supports polygons of arbitrary complexity,
 * from basic triangles and quads to pentagons more.
 * It supports storing per face attributes, and per edge attributes.
 * The Mesh class handles converting its internal representation of polygons into a simpler triangles representation for rendering.
 *
 * ```
 * const mesh = new Mesh()
 * ```
 *
 * **Events**
 * * **geomDataTopologyChanged:** Triggered when the topology of the mesh has been changed.
 * * **geomDataChanged:** Triggered when the vertices of the mesh have changed, but not necessarily the topology.
 *
 * @extends BaseGeom
 */
class Mesh extends BaseGeom {
  /**
   * Creates an instance of Mesh.
   */
  constructor() {
    super()
    this.init()
  }

  /**
   * The init method.
   * @private
   */
  init() {
    this.__faceCounts = []
    this.__faceVertexIndices = new Uint32Array()

    this.__faceAttributes = new Map()
    this.__edgeAttributes = new Map()

    this.__logTopologyWarnings = false

    this.edgeVerts = undefined
    this.vertexEdges = undefined
    this.numEdges = 0
    this.edgeAngles = new Float32Array()
  }

  /**
   * The getFaceCounts method.
   * @return {array} - The return value.
   */
  getFaceCounts() {
    return this.__faceCounts
  }

  /**
   * The getNumFaces method.
   * @return {number} - The return value.
   */
  getNumFaces() {
    return this.__faceCounts.length == 0 ? 0 : this.__faceCounts.reduce((numFaces, fc) => (numFaces += fc))
  }

  /**
   * The clear method.
   */
  clear() {
    this.__faceVertexIndices = undefined
    this.__faceCounts = []
  }

  /**
   * Sets the number of faces on the mesh using an array specifying the counts per polygon size.
   * The first item in the array specifies the number of triangles, the second, the number of quads, the 3rd, the number o f5 sided polygons etc..
   * e.g. to specify 2 triangles, and 7 quads, we would pass [2, 7]
   * @param {array} faceCounts - The faceCounts value.
   */
  setFaceCounts(faceCounts) {
    let numFaces = 0
    let numFacesVertices = 0
    let numVertsPerFace = 3
    for (const fc of faceCounts) {
      numFaces += fc
      numFacesVertices += fc * numVertsPerFace
      numVertsPerFace++
    }

    const prevNumFaces = this.getNumFaces()
    if (prevNumFaces == 0) {
      this.__faceVertexIndices = new Uint32Array(numFacesVertices)
    } else {
      const faceVertexIndices = new Uint32Array(numFacesVertices)

      // Now we preserve the existing indices if they fit within the new faceVertexIndices array.
      let startSrc = 0
      let startTgt = 0
      numFacesVertices = 0
      numVertsPerFace = 3
      faceCounts.forEach((fc, index) => {
        const endSrc = startSrc + Math.min(fc, this.__faceCounts[index]) * numVertsPerFace
        faceVertexIndices.set(this.__faceVertexIndices.slice(startSrc, endSrc), startTgt)
        startSrc += this.__faceCounts[index] * numVertsPerFace
        startTgt += fc * numVertsPerFace
        numVertsPerFace++
      })
      this.__faceVertexIndices = faceVertexIndices
    }
    this.__faceCounts = faceCounts

    for (const attr of this.__faceAttributes) attr.resize(numFaces)
  }

  /**
   * Returns the number of vertices indexed by this face
   * @param {number} faceIndex - The faceIndex value.
   * @return {number} - The return value.
   */
  getFaceVertexCount(faceIndex) {
    let idx = 0
    let count = 0
    this.__faceCounts.some((fc, index) => {
      idx += fc
      if (idx > faceIndex) {
        count = index + 3
        return true
      }
    })
    return count
  }

  /**
   * Returns the offset of the face indices within the entire index array.
   * @param {number} faceIndex - The faceIndex value.
   * @return {number} - The return value.
   */
  getFaceVertexOffset(faceIndex) {
    let idx = 0
    let offset = 0
    this.__faceCounts.some((fc, index) => {
      if (idx + fc > faceIndex) {
        offset += (faceIndex - idx) * (index + 3)
        return true
      }
      idx += fc
      offset += fc * (index + 3)
    })
    return offset
  }

  /**
   * The setFaceVertexIndices method.
   * @param {number} faceIndex - The faceIndex value.
   * @param {array} vertexIndices - The array of vertex indices for this face value.
   */
  setFaceVertexIndices(faceIndex, vertexIndices) {
    if (arguments.length != 2) {
      console.warn(`deprecated interface. Please pass vertexIndices as an array`)
      vertexIndices = Array.prototype.slice.call(arguments, 1)
    }
    const faceVertexCount = this.getFaceVertexCount(faceIndex)
    if (vertexIndices.length != faceVertexCount) {
      throw new Error(
        `Invalid indices for face:${faceIndex} vertexIndices:${vertexIndices}. Expected ${faceVertexCount} indices`
      )
    }
    const offset = this.getFaceVertexOffset(faceIndex)
    this.__faceVertexIndices.set(vertexIndices, offset)
  }

  /**
   * Adds a new face to the mesh
   * @param {array} vertexIndices - The vertex indices of the face.
   * @return {number} - The index of the face in the mesh.
   */
  addFace(vertexIndices) {
    const faceCounts = [...this.__faceCounts]
    if (faceCounts.length <= vertexIndices.length - 3) {
      for (let i = faceCounts.length; i < vertexIndices.length - 3; i++) faceCounts[i] = 0
      faceCounts[vertexIndices.length - 3] = 1
    } else {
      faceCounts[vertexIndices.length - 3]++
    }
    this.setFaceCounts(faceCounts)

    // Calculate the offset in the faceVertexIndices of this new face.
    let faceIndex = 0
    let offset = 0
    this.__faceCounts.some((fc, index) => {
      if (index + 3 == vertexIndices.length) {
        faceIndex += fc - 1
        offset += (fc - 1) * (index + 3)
        return true
      }
      faceIndex += fc
      offset += fc * (index + 3)
    })
    this.__faceVertexIndices.set(vertexIndices, offset)
    return faceIndex
  }

  /**
   * Returns the vertex indices of the specified face.
   * @param {number} faceIndex - The index of the specified face
   * @return {array} - An array of indices into the vertex attributes
   */
  getFaceVertexIndices(faceIndex) {
    const vertexIndices = []
    const offset = this.getFaceVertexOffset(faceIndex)
    const count = this.getFaceVertexCount(faceIndex)
    for (let i = 0; i < count; i++) {
      vertexIndices.push(this.__faceVertexIndices[offset + i])
    }
    return vertexIndices
  }

  /**
   * Returns a single vertex index for a given face and facevertex.
   * @param {number} faceIndex - The faceIndex value.
   * @param {number} facevertex - The face vertex is the index within the face. So the first vertex index is 0.
   * @return {number} - The vertex index
   */
  getFaceVertexIndex(faceIndex, facevertex) {
    const offset = this.getFaceVertexOffset(faceIndex)
    return this.__faceVertexIndices[offset + facevertex]
  }

  // ///////////////////////////
  // Vertex Attributes

  /**
   * Adds a `VertexAttribute` to the geometry.
   *
   * @param {string} name - The name of the vertex attribute to add.
   * @param {AttrValue|number} dataType - The dataType value.
   * @param {number} defaultScalarValue - The default scalar value.
   * @return {VertexAttribute} - Returns a vertex attribute.
   */
  addVertexAttribute(name, dataType, defaultScalarValue = undefined) {
    const positions = this.getVertexAttribute('positions')
    const attr = new VertexAttribute(this, dataType, positions != undefined ? positions.length : 0, defaultScalarValue)
    this.__vertexAttributes.set(name, attr)
    return attr
  }

  // ///////////////////////////
  // Face Attributes

  /**
   * The addFaceAttribute method.
   * @param {string} name - The name of the face attribute to add.
   * @param {AttrValue|number} dataType - The data type.
   * @param {number|TypedArray} count - The count value.
   * @return {Attribute} - Returns a face attribute.
   */
  addFaceAttribute(name, dataType, count = undefined) {
    const attr = new Attribute(dataType, count != undefined ? count : this.getNumFaces())
    this.__faceAttributes.set(name, attr)
    return attr
  }

  /**
   * The hasFaceAttribute method.
   * @param {string} name - The name of the face attribute.
   * @return {boolean} - The return value.
   */
  hasFaceAttribute(name) {
    return this.__faceAttributes.has(name)
  }

  /**
   * The getFaceAttribute method.
   * @param {string} name - The name of the face attribute.
   * @return {boolean} - The return value.
   */
  getFaceAttribute(name) {
    return this.__faceAttributes.get(name)
  }

  // /////////////////////////
  // Edge Attributes

  /**
   * The addEdgeAttribute method.
   * @param {string} name - The name of the edge attribute t oadd.
   * @param {AttrValue|number} dataType - The data type.
   * @param {number} count - The default scalar value.
   * @return {Attribute} - Returns an edge attribute.
   */
  addEdgeAttribute(name, dataType, count = undefined) {
    const attr = new Attribute(dataType, count != undefined ? count : this.getNumEdges())
    this.__edgeAttributes.set(name, attr)
    return attr
  }

  /**
   * The hasEdgeAttribute method.
   * @param {string} name - The name of the edge attribute.
   * @return {boolean} - The return value.
   */
  hasEdgeAttribute(name) {
    return this.__edgeAttributes.has(name)
  }

  /**
   * The getEdgeAttribute method.
   * @param {string} name - The name of the edge attribute.
   * @return {Attribute} - The return value.
   */
  getEdgeAttribute(name) {
    return this.__edgeAttributes.get(name)
  }

  // ///////////////////////////

  /**
   * The genTopologyInfo method.
   */
  genTopologyInfo() {
    const connectedVertices = {} // acceleration structure.
    this.vertexEdges = [] // 2d array of vertex to edges.
    // this.vertexFaces = []; // 2d array of vertex to faces.
    this.edgeFaces = [] // flat array of 2 face indices per edge
    this.edgeVerts = [] // flat array of 2 vert indices per edge
    this.faceEdges = [] // the edges bordering each face.
    this.numEdges = 0

    const positions = this.getVertexAttribute('positions')
    const getEdgeIndex = (v0, v1) => {
      let tmp0 = v0
      let tmp1 = v1
      if (tmp1 < tmp0) {
        const tmp = tmp0
        tmp0 = tmp1
        tmp1 = tmp
      }
      const key = tmp0 + '>' + tmp1
      if (key in connectedVertices) {
        // console.log(key + ':' + connectedVertices[key] + " face:" + ( v0 < v1 ? 0 : 1) );
        return connectedVertices[key]
      }

      const p0 = positions.getValueRef(tmp0)
      const p1 = positions.getValueRef(tmp1)
      const edgeVec = p1.subtract(p0)

      const edgeIndex = this.edgeFaces.length / 2
      const edgeData = {
        edgeIndex: edgeIndex,
        edgeVec: edgeVec,
      }
      connectedVertices[key] = edgeData

      this.edgeFaces.push(-1)
      this.edgeFaces.push(-1)
      this.edgeVerts.push(tmp0)
      this.edgeVerts.push(tmp1)
      // console.log(key + ':' + connectedVertices[key] + " face:" + ( v0 < v1 ? 0 : 1));

      this.numEdges++
      return edgeData
    }

    const addEdge = (v0, v1, faceIndex) => {
      // console.log('addEdge:' + v0 + " :" + v1 + " faceIndex:" + faceIndex );
      const edgeData = getEdgeIndex(v0, v1)
      const edgeIndex = edgeData.edgeIndex
      if (v1 < v0) {
        const edgeFaceIndex = edgeIndex * 2 + 0
        if (this.__logTopologyWarnings && this.edgeFaces[edgeFaceIndex] != -1)
          console.warn('Edge poly 0 already set. Mesh is non-manifold.')
        this.edgeFaces[edgeFaceIndex] = faceIndex
      } else {
        const edgeFaceIndex = edgeIndex * 2 + 1
        if (this.__logTopologyWarnings && this.edgeFaces[edgeFaceIndex] != -1)
          console.warn('Edge poly 1 already set. Mesh is non-manifold.')
        this.edgeFaces[edgeFaceIndex] = faceIndex
      }

      if (!(faceIndex in this.faceEdges)) this.faceEdges[faceIndex] = []
      this.faceEdges[faceIndex].push(edgeIndex)

      // Push the edge index onto both vertex edge lists.
      // We use Sets to avoid adding the same edge 2x to the same vertex.
      if (this.vertexEdges[v0] == undefined) {
        this.vertexEdges[v0] = new Set()
      }
      if (this.vertexEdges[v1] == undefined) {
        this.vertexEdges[v1] = new Set()
      }
      this.vertexEdges[v0].add(edgeIndex)
      this.vertexEdges[v1].add(edgeIndex)

      // if (this.vertexFaces[v0] == undefined) {
      //     this.vertexFaces[v0] = [];
      // }
      // this.vertexFaces[v0].push(faceIndex);
    }

    const numFaces = this.getNumFaces()
    for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
      const faceVerts = this.getFaceVertexIndices(faceIndex)
      for (let j = 0; j < faceVerts.length; j++) {
        const v0 = faceVerts[j]
        const v1 = faceVerts[(j + 1) % faceVerts.length]
        addEdge(v0, v1, faceIndex)
      }
    }
  }

  /**
   * Computes a normal value per face by averaging the triangle normals of the face.
   */
  computeFaceNormals() {
    const positions = this.getVertexAttribute('positions')
    const faceNormals = this.addFaceAttribute('normals', Vec3)
    const numFaces = this.getNumFaces()
    for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
      const faceVerts = this.getFaceVertexIndices(faceIndex)
      const p0 = positions.getValueRef(faceVerts[0])
      const p1 = positions.getValueRef(faceVerts[1])
      let prev = p1
      const faceNormal = new Vec3()
      for (let j = 2; j < faceVerts.length; j++) {
        const pn = positions.getValueRef(faceVerts[j])
        const v0 = prev.subtract(p0)
        const v1 = pn.subtract(p0)
        faceNormal.addInPlace(v0.cross(v1).normalize())
        prev = pn
      }
      if (faceNormal.lengthSquared() < Number.EPSILON) {
        // Note: we are getting many faces with no surface area.
        // This is simply an authoring issue.
        // console.warn("Invalid Mesh topology");
        // if(debugMesh){
        //     printf("Face positions are coincident face:%i", i);
        //     for (let j = 0; j < faceVerts.length; j++)
        //         printf("v:%i", this.__faceVertexIndices[ numFacesVertices + (i*faceVerts.length) + j ]);
        //     printf("\n");
        // }
      } else {
        faceNormals.setValue(faceIndex, faceNormal.normalize())
      }
    }
  }

  /**
   * Calculates the angles at each edge between the adjoining faces
   */
  calculateEdgeAngles() {
    if (this.vertexEdges == undefined) this.genTopologyInfo()

    if (!this.hasFaceAttribute('normals')) this.computeFaceNormals()

    const positions = this.getVertexAttribute('positions')
    const faceNormals = this.getFaceAttribute('normals')
    this.edgeVecs = []
    this.edgeAngles = new Float32Array(this.numEdges)
    for (let i = 0; i < this.edgeFaces.length; i += 2) {
      const v0 = this.edgeVerts[i]
      const v1 = this.edgeVerts[i + 1]
      const e_vec = positions.getValueRef(v1).subtract(positions.getValueRef(v0))
      e_vec.normalizeInPlace()
      this.edgeVecs.push(e_vec)

      const p0 = this.edgeFaces[i]
      const p1 = this.edgeFaces[i + 1]
      if (p0 == -1 || p1 == -1) {
        // Flag the edge as a border edge....
        this.edgeAngles[i / 2] = Math.PI * 2.0
        continue
      }

      const n0 = faceNormals.getValueRef(p0)
      const n1 = faceNormals.getValueRef(p1)
      this.edgeAngles[i / 2] = n0.angleTo(n1)
    }
  }

  /**
   * Compute vertex normals.
   * @param {number} hardAngle - The hardAngle value in radians.
   * @return {VertexAttribute} - The return value.
   */
  computeVertexNormals(hardAngle = 1.0 /* radians */) {
    // console.log("computeVertexNormals");

    this.calculateEdgeAngles()

    const faceNormals = this.getFaceAttribute('normals')
    const normalsAttr = this.addVertexAttribute('normals', Vec3)

    // these methods are faster versions than using the methods
    // provided on the attributes. We cache values and use hard coded constants.
    const faceNormalsBuffer = faceNormals.data.buffer
    const getFaceNormal = (index) => {
      return Vec3.createFromBuffer(faceNormalsBuffer, index * 3 * 4) // 3 components at 4 bytes each.
    }
    const vertexNormalsArray = normalsAttr.data
    const setVertexNormal = (index, value) => {
      vertexNormalsArray[index * 3 + 0] = value.x
      vertexNormalsArray[index * 3 + 1] = value.y
      vertexNormalsArray[index * 3 + 2] = value.z
    }
    const getConnectedEdgeVecs = (faceIndex, vertexIndex) => {
      let e0
      let e1
      const faceEdges = this.faceEdges[faceIndex]
      for (const e of faceEdges) {
        if (this.edgeVerts[e * 2] == vertexIndex) {
          if (!e0) e0 = this.edgeVecs[e]
          else e1 = this.edgeVecs[e]
        } else if (this.edgeVerts[e * 2 + 1] == vertexIndex) {
          if (!e0) e0 = this.edgeVecs[e]
          else e1 = this.edgeVecs[e]
        }
      }
      return [e0, e1]
    }

    for (let i = 0; i < this.vertexEdges.length; i++) {
      // If this face indexing doesn't start at 0, then the vertexEdges don't either.
      if (this.vertexEdges[i] == undefined) continue

      const edges = this.vertexEdges[i]

      // Groups of faces having a smooth normal at the current vertex.
      const faceGroups = []
      const addFaceToGroup = (face) => {
        let inGroup = false
        for (const faceGroup of faceGroups) {
          inGroup = faceGroup.indexOf(face) != -1
          if (inGroup) break
        }
        if (!inGroup) faceGroups.push([face])
      }
      for (const e of edges) {
        const f0 = this.edgeFaces[e * 2]
        const f1 = this.edgeFaces[e * 2 + 1]
        if (f0 != -1 && f1 == -1 && this.edgeAngles[e] < hardAngle) {
          let f0groupIndex = -1
          let f1groupIndex = -1
          for (let groupIndex = 0; groupIndex < faceGroups.length; groupIndex++) {
            if (f0groupIndex == -1 && faceGroups[groupIndex].indexOf(f0) != -1) f0groupIndex = groupIndex
            if (f1groupIndex == -1 && faceGroups[groupIndex].indexOf(f1) != -1) f1groupIndex = groupIndex
          }
          if (f0groupIndex == -1 && f1groupIndex == -1) {
            faceGroups.push([f0, f1])
          } else if (f0groupIndex != -1 && f1groupIndex != -1) {
            if (f0groupIndex != f1groupIndex) {
              // Merge the 2 groups that the smooth edge joins.
              faceGroups[f0groupIndex] = faceGroups[f0groupIndex].concat(faceGroups[f1groupIndex])
              faceGroups.splice(f1groupIndex, 1)
            }
          } else {
            if (f0groupIndex == -1) {
              faceGroups[f1groupIndex].push(f0)
            }
            if (f1groupIndex == -1) {
              faceGroups[f0groupIndex].push(f1)
            }
          }
          continue
        }
        // This is a hard edge or a border edge... Add faces separately group.
        if (f0 != -1) addFaceToGroup(f0)
        if (f1 != -1) addFaceToGroup(f1)
      }

      // Sort the groups to have the biggest group first.
      faceGroups.sort((a, b) => (a.length < b.length ? 1 : a.length > b.length ? -1 : 0))

      let firstVirtex = true
      for (const faceGroup of faceGroups) {
        const normal = new Vec3()
        for (const faceIndex of faceGroup) {
          const face_edges = getConnectedEdgeVecs(faceIndex, i)
          const weight = face_edges[0].angleTo(face_edges[1])
          // if (i == 1)
          //     console.log("FaceNormal:" + faceIndex + ":" + getFaceNormal(faceIndex).toString());
          normal.addInPlace(getFaceNormal(faceIndex).scale(weight))
        }
        normal.normalizeInPlace()
        if (firstVirtex) {
          setVertexNormal(i, normal)
          firstVirtex = false
        } else {
          normalsAttr.setSplitVertexValues(i, faceGroup, normal)
        }
      }
    }

    return normalsAttr
  }

  /**
   * The computeHardEdgesIndices method.
   * @param {number} hardAngle - The hardAngle value in radians.
   * @return {array} - The return value.
   */
  computeHardEdgesIndices(hardAngle = 1.0) {
    if (!this.edgeVerts) this.calculateEdgeAngles()

    const hardEdges = []
    const addEdge = (index) => {
      hardEdges.push(this.edgeVerts[index])
      hardEdges.push(this.edgeVerts[index + 1])
    }
    for (let i = 0; i < this.edgeAngles.length; i++) {
      if (this.edgeAngles[i] > hardAngle) {
        addEdge(i * 2)
      }
    }
    return Uint32Array.from(hardEdges)
  }

  /**
   * The getWireframeIndices method.
   * @return {any} - The return value.
   * @private
   */
  getWireframeIndices() {
    console.warn('@todo-review - This returns nothing')
    return indices
  }

  // ////////////////////////////////////////
  // Rendering

  /**
   * The genBuffers method.
   * @param {object} opts - The opts value.
   * @return {object} - The return value.
   */
  genBuffers(opts) {
    // Compute the normals on demand.
    // if (!('normals' in this.__vertexAttributes)) {
    //     // this.__geom.computeVertexNormals();
    //     this.addVertexAttribute("normals", Vec3, 0.0);
    // }

    const splitIndices = {}
    let splitCount = 0
    for (const [, attr] of this.__vertexAttributes) {
      const attrSplits = attr.getSplits()
      for (const polygon in attrSplits) {
        if (!(polygon in splitIndices)) splitIndices[polygon] = {}
        const vertices = attrSplits[polygon]
        for (const v in vertices) {
          const vertex = parseInt(v)
          if (!(vertex in splitIndices[polygon])) {
            splitIndices[polygon][vertex] = splitCount
            splitCount++
          }
        }
      }
    }

    const positions = this.getVertexAttribute('positions')
    const numUnSplitVertices = positions.length
    const totalNumVertices = numUnSplitVertices + splitCount

    let indices
    if (!opts || opts.includeIndices != false) {
      indices = this.generateTriangulatedIndices(totalNumVertices, numUnSplitVertices, splitIndices)
    }

    // let maxIndex;
    // if (debugAttrValues)
    //     maxIndex = Math.max(...indices);
    const attrBuffers = {}
    for (const [attrName, attr] of this.__vertexAttributes) {
      let values
      if (splitCount == 0) values = attr.data
      else values = attr.generateSplitValues(splitIndices, splitCount)

      const dimension = attr.numElements
      const count = values.length / dimension

      // if (debugAttrValues) {
      //     if (count <= maxIndex)
      //         console.warn("Invalid indexing. Attr value is insufficient for indexing:" + attrName + ". Max Index:" + maxIndex + " Attr Size:" + count);
      // }

      attrBuffers[attrName] = {
        values: values,
        count: count,
        dimension: dimension,
        normalized: attrName == 'normals',
        dataType: attr.dataType,
      }
    }

    const result = {
      numVertices: this.numVertices(),
      numRenderVerts: totalNumVertices,
      indices,
      attrBuffers,
    }

    if (opts && opts.includeVertexNeighbors) {
      if (this.vertexEdges == undefined) this.genTopologyInfo()

      let count = 0
      for (let i = 0; i < this.vertexEdges.length; i++) {
        // If this face indexing doesn't start at 0, then the vertexEdges don't either.
        if (this.vertexEdges[i]) count += this.vertexEdges[i].size
      }
      // The array will be structured as a start+offset for each vertex, followed
      // by a 2d array of neighbor indices.
      const vertexNeighbors = new Uint32Array(this.vertexEdges.length * 2 + count)

      const sortFanEdges = (fanEdges) => {
        for (let i = 0; i < fanEdges.length; i++) {
          const feA = fanEdges[i]
          for (let j = 0; j < i; j++) {
            const feB = fanEdges[j]
            if (feA[0] != -1 && feA[0] == feB[1]) {
              //  move feA after feB;
              if (i != j + 1) {
                fanEdges.splice(i, 1)
                fanEdges.splice(j + 1, 0, feA)
              }
              break
            }
            if (feA[1] != -1 && feA[1] == feB[0]) {
              //  move feA before feB;
              fanEdges.splice(i, 1)
              fanEdges.splice(j, 0, feA)
              break
            }
          }
        }
      }

      const checkFanEdges = (fanEdges) => {
        // now check that the faces all build a fan. Maybe starting and ending with -1
        if (fanEdges[0][0] == -1 || fanEdges[fanEdges.length - 1][1] == -1) {
          if (fanEdges[0][0] != -1 || fanEdges[fanEdges.length - 1][1] != -1) {
            throw new Error('If fan starts with -1, it must also end with -1')
          }
        }
        for (let i = 0; i < fanEdges.length; i++) {
          const fe = fanEdges[i]
          if (fe[0] == -1 || fe[1] == -1) {
            if (i != 0 && i != fanEdges.length - 1) {
              throw new Error('-1 only allowed at the beginning and end of a fan.')
            }
          }
          if (fe[0] != -1) {
            let prev = i - 1
            if (prev < 0) prev += fanEdges.length
            if (fe[0] != fanEdges[prev][1]) {
              throw new Error('Faces are not sequential')
            }
          }
          if (fe[1] != -1) {
            const next = (i + 1) % fanEdges.length
            if (fe[1] != fanEdges[next][0]) {
              throw new Error('Faces are not sequential')
            }
          }
        }
      }

      // Populate the start and offset values.
      let offset = this.vertexEdges.length * 2
      for (let i = 0; i < this.vertexEdges.length; i++) {
        if (this.vertexEdges[i] == undefined) continue
        const edges = this.vertexEdges[i]

        // Build a sorted list of faces based on a fan around
        // the vertex.
        const fanEdges = []
        for (const e of edges) {
          const v0 = this.edgeVerts[e * 2]
          const v1 = this.edgeVerts[e * 2 + 1]
          let f0 = this.edgeFaces[e * 2]
          let f1 = this.edgeFaces[e * 2 + 1]
          let neigVert
          if (v0 == i) {
            neigVert = v1
          } else if (v1 == i) {
            neigVert = v0
            // swap the faces
            const tmp = f0
            f0 = f1
            f1 = tmp
          } else {
            throw new Error('Invalid topology')
          }
          fanEdges.push([f0, f1, neigVert])
        }
        sortFanEdges(fanEdges)
        checkFanEdges(fanEdges)
        const closed = fanEdges[0][0] != -1 || fanEdges[fanEdges.length - 1][1] != -1
        let flags = 0
        if (closed) flags += 1
        vertexNeighbors[i * 2] = offset
        vertexNeighbors[i * 2 + 1] = edges.size + (flags << 8)
        for (const fe of fanEdges) {
          vertexNeighbors[offset] = fe[2]
          offset++
        }
      }

      result.vertexNeighbors = vertexNeighbors
    }

    return result
  }

  /**
   * Compute the number of triangles. For higher degree polygons, they are divided into multiple triangles for rendering.
   * @return {number} - Returns the number of triangles.
   */
  computeNumTriangles() {
    let numVertsPerFace = 3
    let trisCount = 0
    for (const fc of this.__faceCounts) {
      trisCount += fc * (numVertsPerFace - 2)
      numVertsPerFace++
    }
    return trisCount
  }

  /**
   * To prepare data for rendering, the indices for the polygons is used to compute a new index buffer based on
   * only triangles. This is used during rendering and the resulting indices uploaded ot the GPU  by GLMesh class.
   *
   * @param {number} totalNumVertices - The total number of vertices.
   * @param {number} numUnSplitVertices - The total number of unsplit vertices.
   * @param {array} splitIndices - The splitIndices value.
   * @return {TypedArray} - Retures a typed array containing the triangulated indices.
   */
  generateTriangulatedIndices(totalNumVertices, numUnSplitVertices, splitIndices) {
    const trisCount = this.computeNumTriangles()

    let trianglulatedIndices
    if (totalNumVertices < Math.pow(2, 8)) trianglulatedIndices = new Uint8Array(trisCount * 3)
    else if (totalNumVertices < Math.pow(2, 16)) trianglulatedIndices = new Uint16Array(trisCount * 3)
    else trianglulatedIndices = new Uint32Array(trisCount * 3)

    let triangleVertex = 0
    const addTriangleVertexIndex = function (vertex, faceIndex) {
      if (vertex in splitIndices && faceIndex in splitIndices[vertex])
        vertex = numUnSplitVertices + splitIndices[vertex][faceIndex]
      trianglulatedIndices[triangleVertex] = vertex
      triangleVertex++
    }
    const numFaces = this.getNumFaces()
    for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
      const faceVerts = this.getFaceVertexIndices(faceIndex)
      for (let j = 0; j < faceVerts.length; j++) {
        if (j >= 3) {
          // For each aditional triangle, we have to add 2 indices.
          addTriangleVertexIndex(faceVerts[0], faceIndex)
          addTriangleVertexIndex(faceVerts[j - 1], faceIndex)
        }
        addTriangleVertexIndex(faceVerts[j], faceIndex)
      }
    }
    return trianglulatedIndices
  }

  /**
   * The freeBuffers method.
   */
  freeBuffers() {
    super.freeBuffers()
    this.init()
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Restores mesh properties from a binary reader.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.loadBaseGeomBinary(reader)
    this.setFaceCounts(reader.loadUInt32Array())

    // Note: we can remove this. We can infer this from the above faceCounts array.
    const faceVertexCounts = reader.loadUInt8Array(this.getNumFaces())
    const offsetRange = reader.loadSInt32Vec2()
    const bytes = reader.loadUInt8()
    let faceVertexIndexDeltas
    if (bytes == 1) faceVertexIndexDeltas = reader.loadUInt8Array()
    else if (bytes == 2) faceVertexIndexDeltas = reader.loadUInt16Array()
    else if (bytes == 4) faceVertexIndexDeltas = reader.loadUInt32Array()

    const numFaces = this.getNumFaces()
    let offset = 0
    let prevCount = 0
    let faceOffsets = []
    for (let faceIndex = 0; faceIndex < numFaces; faceIndex++) {
      const count = this.getFaceVertexCount(faceIndex)
      faceOffsets[faceIndex] = offset
      for (let j = 0; j < count; j++) {
        const faceVertex = offset + j
        const delta = faceVertexIndexDeltas[faceVertex] + offsetRange.x
        if (faceIndex == 0) this.__faceVertexIndices[faceVertex] = delta
        else {
          let prevFaceVertex = faceOffsets[faceIndex - 1]
          prevFaceVertex += j < prevCount ? j : prevCount - 1
          this.__faceVertexIndices[faceVertex] = this.__faceVertexIndices[prevFaceVertex] + delta
        }
      }
      offset += count
      prevCount = count
    }
    this.__numPopulatedFaceVertexIndices = offset

    if (!this.hasVertexAttribute('normals')) {
      this.computeVertexNormals()
    }

    // this.computeVertexNormals();
    this.emit('geomDataChanged', {})
  }

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    if (!context || !context.skipTopology) {
      j.faceCounts = Array.from(this.__faceCounts)
      j.faceVertexIndices = Array.from(this.__faceVertexIndices)
    }

    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)
    if (j.faceCounts) this.__faceCounts = j.faceCounts
    if (j.faceVertexIndices) this.__faceVertexIndices = Uint32Array.from(j.faceVertexIndices)
  }
}

Registry.register('Mesh', Mesh)

export default Mesh
export { Mesh }
