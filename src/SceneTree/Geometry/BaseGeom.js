/* eslint-disable require-jsdoc */
/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
import { Vec2, Vec3, Box2, Box3, typeRegistry } from '../../Math/index'
import { ParameterOwner } from '../ParameterOwner.js'
import { Attribute } from './Attribute.js'
import { sgFactory } from '../SGFactory.js'

// Defines used to explicity specify types for WebGL.
const SAVE_FLAG_SKIP_GEOMDATA = 1 << 10
function isTypedArray(obj) {
  return !!obj && obj.byteLength !== undefined
}

/**
 * Represents a base class for 3D geometry items.
 *
 * **Events**
 * * **boundingBoxChanged:** Triggered when the bounding box changes.
 *
 * @extends ParameterOwner
 */
class BaseGeom extends ParameterOwner {
  /**
   * Create a base geom.
   */
  constructor() {
    super()
    this.__numVertices = 0
    this.__boundingBox = new Box3()
    this.__boundingBoxDirty = true
    this.__vertexAttributes = new Map()
    this.__metaData = new Map()
    this.addVertexAttribute('positions', Vec3, 0.0)
  }

  /**
   * Establishes a name for the geometry.
   *
   * @param {string} name - The debug name value.
   */
  setDebugName(name) {
    this.__name = name
  }

  /**
   * Adds a new vertex attribute to the geometry.
   *
   * @param {string} name - The name of the vertex attribute.
   * @param {AttrValue|number} dataType - The dataType value.
   * @param {number} defaultScalarValue - The default scalar value.
   * @return {Attribute} - Returns an attribute.
   */
  addVertexAttribute(name, dataType, defaultScalarValue = undefined) {
    let attr
    if (isTypedArray(defaultScalarValue)) {
      attr = new Attribute(dataType, defaultScalarValue)
    } else {
      attr = new Attribute(dataType, this.vertices != undefined ? this.vertices.length : 0, defaultScalarValue)
    }
    this.__vertexAttributes.set(name, attr)
    return attr
  }

  /**
   * Checks if the the geometry has an attribute with the specified name.
   *
   * @param {string} name - The name of the vertex attribute.
   * @return {boolean} - The return value.
   */
  hasVertexAttribute(name) {
    return this.__vertexAttributes.has(name)
  }

  /**
   * Returns vertex attribute with the specified name.
   *
   * @param {string} name - The name of the vertex attribute.
   * @return {Attribute} - The return value.
   */
  getVertexAttribute(name) {
    return this.__vertexAttributes.get(name)
  }

  /**
   * Returns all vertex attributes in an object with their names.
   *
   * @return {object} - The return value.
   */
  getVertexAttributes() {
    const vertexAttributes = {}
    for (const [key, attr] of this.__vertexAttributes.entries()) vertexAttributes[key] = attr
    return vertexAttributes
  }

  /**
   * Returns 'positions' vertex attribute.
   */
  get vertices() {
    return this.__vertexAttributes.get('positions')
  }

  /**
   * Returns the number of vertex attributes.
   *
   * @return {number} - The return value.
   */
  numVertices() {
    return this.__numVertices
  }

  /**
   * Returns the number of vertex attributes.
   *
   * @return {number} - The return value.
   */
  getNumVertices() {
    return this.__numVertices
  }

  /**
   * Sets the number of vertices the geometry has.
   *
   * @param {number} count - The count value.
   */
  setNumVertices(count) {
    this.__numVertices = count
    // Resizes each of the vertex attributes to match the new count.
    this.__vertexAttributes.forEach((attr) => attr.resize(this.__numVertices))
  }

  /**
   * The getVertex method.
   * @param {number} index - The index value.
   * @return {Vec3} - Returns a Vec3.
   */
  getVertex(index) {
    return Vec3.createFromFloat32Buffer(this.vertices.data.buffer, index * 3)
  }

  /**
   * The setVertex method.
   * @param {index} index - The index value.
   * @param {Vec3} vec3 - The vec3 value.
   * @return {Vec3} - Returns a Vec3.
   */
  setVertex(index, vec3) {
    return Vec3.createFromFloat32Buffer(this.vertices.data.buffer, index * 3).setFromOther(vec3)
  }

  /**
   * The moveVertices method.
   * @param {Vec3} delta - The delta value.
   */
  moveVertices(delta) {
    const vertices = this.vertices
    for (let i = 0; i < vertices.length; i++) vertices.getValueRef(i).addInPlace(delta)
    this.setBoundingBoxDirty()
  }

  /**
   * The transformVertices method.
   * @param {Xfo} xfo - The xfo tranform.
   */
  transformVertices(xfo) {
    const vertices = this.vertices
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices.getValueRef(i)
      const v2 = xfo.transformVec3(v)
      v.set(v2.x, v2.y, v2.z)
    }
    this.setBoundingBoxDirty()
  }

  // ////////////////////////////////////////
  // BoundingBox

  /**
   * The boundingBox method.
   * @return {Vec3} - The return value.
   */
  get boundingBox() {
    if (this.__boundingBoxDirty) this.updateBoundingBox()
    return this.__boundingBox
  }

  /**
   * The setBoundingBoxDirty method.
   */
  setBoundingBoxDirty() {
    this.__boundingBoxDirty = true
    this.emit('boundingBoxChanged', {})
  }

  /**
   * The updateBoundingBox method.
   */
  updateBoundingBox() {
    const vertices = this.vertices
    const bbox = new Box3()
    const numVerts = vertices.length
    for (let i = 0; i < numVerts; i++) bbox.addPoint(vertices.getValueRef(i))
    this.__boundingBox = bbox
    this.__boundingBoxDirty = false
  }

  // ////////////////////////////////////////
  // Metadata

  /**
   * Returns metadata value of the specified name.
   *
   * @param {string} key - The key value.
   * @return {object} - The return value.
   */
  getMetadata(key) {
    return this.__metaData.get(key)
  }

  /**
   * Verifies if geometry's metadata contains a value with the specified key.
   *
   * @param {string} key - The key value.
   * @return {boolean} - The return value.
   */
  hasMetadata(key) {
    return this.__metaData.has(key)
  }

  /**
   * Sets metadata value to the geometry.
   *
   * @param {string} key - The key value.
   * @param {object} metaData - The metaData value.
   */
  setMetadata(key, metaData) {
    this.__metaData.set(key, metaData)
  }

  /**
   * Removes metadata value from the geometry with the specified key.
   *
   * @param {string} key - The key value.
   */
  deleteMetadata(key) {
    this.__metaData.delete(key)
  }

  // ////////////////////////////////////////
  // Memory

  /**
   * Returns vertex attributes buffers and its count.
   *
   * @param {object} opts - The opts value.
   * @return {object} - The return value.
   */
  genBuffers(opts) {
    const attrBuffers = {}
    for (const [attrName, attr] of this.__vertexAttributes) {
      attrBuffers[attrName] = {
        values: attr.data,
        count: attr.size,
        dataType: attr.dataType,
        normalized: attr.normalized,
      }
    }
    return {
      numVertices: this.numVertices(),
      attrBuffers,
    }
  }

  /**
   * The freeBuffers method.
   */
  freeBuffers() {
    // Before destroying all our data,
    // make sure the bbox is up to date.
    // if (this.__boundingBoxDirty)
    //     this.updateBoundingBox();
    // // TODO: push the data to a worker thread and terminate like in MeshProxy.
    // this.__vertexAttributes = new Map();
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Sets state of current Geometry(Including Vertices and Bounding Box) using a binary reader object.
   *
   * @param {BinReader} reader - The reader value.
   */
  loadBaseGeomBinary(reader) {
    this.name = reader.loadStr()
    const flags = reader.loadUInt8()
    this.debugColor = reader.loadRGBFloat32Color()
    const numVerts = reader.loadUInt32()
    this.__boundingBox.set(reader.loadFloat32Vec3(), reader.loadFloat32Vec3())

    this.setNumVertices(numVerts)
    const positionsAttr = this.vertices
    let normalsAttr
    let texCoordsAttr
    if (flags & (1 << 1)) {
      normalsAttr = this.getVertexAttribute('normals')
      if (!normalsAttr) normalsAttr = this.addVertexAttribute('normals', Vec3, 0.0)
    }
    if (flags & (1 << 2)) {
      texCoordsAttr = this.getVertexAttribute('texCoords')
      if (!texCoordsAttr) texCoordsAttr = this.addVertexAttribute('texCoords', Vec2, 0.0)
    }

    const parse8BitPositionsArray = (range, offset, sclVec, positions_8bit) => {
      for (let i = range[0]; i < range[1]; i++) {
        const pos = new Vec3(
          positions_8bit[i * 3 + 0] / 255.0,
          positions_8bit[i * 3 + 1] / 255.0,
          positions_8bit[i * 3 + 2] / 255.0
        )
        pos.multiplyInPlace(sclVec)
        pos.addInPlace(offset)
        positionsAttr.setValue(i, pos)
      }
    }

    const parse8BitNormalsArray = (range, offset, sclVec, normals_8bit) => {
      if (sclVec.isNull()) sclVec.set(1, 1, 1)
      for (let i = range[0]; i < range[1]; i++) {
        const normal = new Vec3(
          normals_8bit[i * 3 + 0] / 255.0,
          normals_8bit[i * 3 + 1] / 255.0,
          normals_8bit[i * 3 + 2] / 255.0
        )
        normal.multiplyInPlace(sclVec)
        normal.addInPlace(offset)
        normal.normalizeInPlace()
        normalsAttr.setValue(i, normal)
      }
    }
    const parse8BitTextureCoordsArray = (range, offset, sclVec, texCoords_8bit) => {
      // if (sclVec.isNull())
      //     sclVec.set(1, 1, 1);
      for (let i = range[0]; i < range[1]; i++) {
        const textureCoord = new Vec2(texCoords_8bit[i * 2 + 0] / 255.0, texCoords_8bit[i * 2 + 1] / 255.0)
        textureCoord.multiplyInPlace(sclVec)
        textureCoord.addInPlace(offset)
        texCoordsAttr.setValue(i, textureCoord)
      }
    }

    const numClusters = reader.loadUInt32()
    if (numClusters == 1) {
      {
        const box3 = this.__boundingBox
        const positions_8bit = reader.loadUInt8Array(numVerts * 3)
        parse8BitPositionsArray([0, numVerts], box3.p0, box3.diagonal(), positions_8bit)
      }

      if (normalsAttr) {
        const box3 = new Box3(reader.loadFloat32Vec3(), reader.loadFloat32Vec3())
        const normals_8bit = reader.loadUInt8Array(numVerts * 3)
        parse8BitNormalsArray([0, numVerts], box3.p0, box3.diagonal(), normals_8bit)

        normalsAttr.loadSplitValues(reader)
      }
      if (texCoordsAttr) {
        const box2 = new Box2(reader.loadFloat32Vec2(), reader.loadFloat32Vec2())
        const texCoords_8bit = reader.loadUInt8Array(numVerts * 2)
        parse8BitTextureCoordsArray([0, numVerts], box2.p0, box2.diagonal(), texCoords_8bit)

        texCoordsAttr.loadSplitValues(reader)
      }
    } else {
      const clusters = []
      let offset = 0
      for (let i = 0; i < numClusters; i++) {
        const count = reader.loadUInt32()
        const box3 = new Box3(reader.loadFloat32Vec3(), reader.loadFloat32Vec3())
        const clusterData = {
          range: [offset, offset + count],
          bbox: box3,
        }
        if (normalsAttr) {
          clusterData.normalsRange = new Box3(reader.loadFloat32Vec3(), reader.loadFloat32Vec3())
        }
        if (texCoordsAttr) {
          clusterData.texCoordsRange = new Box2(reader.loadFloat32Vec2(), reader.loadFloat32Vec2())
        }

        clusters.push(clusterData)
        offset += count
      }
      const positions_8bit = reader.loadUInt8Array(numVerts * 3)
      let normals_8bit
      let texCoords_8bit
      if (normalsAttr) {
        normals_8bit = reader.loadUInt8Array(numVerts * 3)
      }
      if (texCoordsAttr) {
        texCoords_8bit = reader.loadUInt8Array(numVerts * 2)
      }

      for (let i = 0; i < numClusters; i++) {
        {
          const box3 = clusters[i].bbox
          parse8BitPositionsArray(clusters[i].range, box3.p0, box3.diagonal(), positions_8bit)
        }

        if (normalsAttr) {
          const box3 = clusters[i].normalsRange
          parse8BitNormalsArray(clusters[i].range, box3.p0, box3.diagonal(), normals_8bit)
        }
        if (texCoordsAttr) {
          const box2 = clusters[i].texCoordsRange
          parse8BitTextureCoordsArray(clusters[i].range, box2.p0, box2.diagonal(), texCoords_8bit)
        }
      }
      if (normalsAttr) {
        normalsAttr.loadSplitValues(reader)
      }
      if (texCoordsAttr) {
        texCoordsAttr.loadSplitValues(reader)
      }
    }
  }

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    let json = super.toJSON(context, flags)
    if (!json) json = {}
    json.type = sgFactory.getClassName(this)

    if (!(flags & SAVE_FLAG_SKIP_GEOMDATA)) {
      const vertexAttributes = {}
      for (const [key, attr] of this.__vertexAttributes.entries()) {
        // if (!opts || !('attrList' in opts) || opts.attrList.indexOf(key) != -1)
        vertexAttributes[key] = attr.toJSON(context, flags)
      }
      json.vertexAttributes = vertexAttributes
    }
    return json
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(json, context, flags) {
    super.fromJSON(json, context, flags)
    for (const name in json.vertexAttributes) {
      let attr = this.__vertexAttributes.get(name)
      const attrJSON = json.vertexAttributes[name]
      if (!attr) {
        const dataType = typeRegistry.getType(attrJSON.dataType)
        attr = new VertexAttribute(this, dataType, 0, attrJSON.defaultScalarValue)
        this.__vertexAttributes.set(name, attr)
      }
      attr.fromJSON(attrJSON)
    }
  }

  /**
   * Returns geometry data value in json format.
   *
   * @return {string} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }
}
export { BaseGeom, SAVE_FLAG_SKIP_GEOMDATA }
