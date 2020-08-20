/* eslint-disable camelcase */
import { BaseGeom } from './BaseGeom.js'
import Registry from '../../Registry'

/**
 * Class representing a point primitive drawing type, every vertex specified is a point.
 *
 * ```
 * const points = new Points()
 * ```
 *
 * * **Events**
 * * **boundingBoxChanged:** Triggered when the bounding box changes.
 *
 * @extends BaseGeom
 */
class Points extends BaseGeom {
  /**
   * Create points.
   */
  constructor() {
    super()
  }

  /**
   * Loads and populates `Points` object from a binary reader.
   *
   * @param {BinReader} reader - The reader value.
   */
  loadBin(reader) {
    this.name = reader.loadStr()
    const numVerts = reader.loadUInt32()
    this.__boundingBox.set(reader.loadFloat32Vec3(), reader.loadFloat32Vec3())
    this.setNumVertices(numVerts)
    const positions = this.getVertexAttribute('positions')

    if (numVerts < 256) {
      const bboxMat = this.__boundingBox.toMat4()
      const posAttr_8bit = reader.loadUInt8Array(numVerts * 3)
      for (let i = 0; i < numVerts; i++) {
        const pos = new Vec3(
          posAttr_8bit[i * 3 + 0] / 255.0,
          posAttr_8bit[i * 3 + 1] / 255.0,
          posAttr_8bit[i * 3 + 2] / 255.0
        )
        positions.setValue(i, bboxMat.transformVec3(pos))
      }
    } else {
      const numClusters = reader.loadUInt32()
      const clusters = []
      for (let i = 0; i < numClusters; i++) {
        const range = reader.loadUInt32Vec2()
        const p0 = reader.loadFloat32Vec3()
        const p1 = reader.loadFloat32Vec3()
        clusters.push({
          range: range,
          bbox: new Box3(p0, p1),
        })
      }
      const posAttr_8bit = reader.loadUInt8Array(numVerts * 3)

      for (let i = 0; i < numClusters; i++) {
        const bboxMat = clusters[i]['bbox'].toMat4()
        for (let j = clusters[i]['range'].x; j < clusters[i]['range'].y; j++) {
          const pos = new Vec3(
            posAttr_8bit[j * 3 + 0] / 255.0,
            posAttr_8bit[j * 3 + 1] / 255.0,
            posAttr_8bit[j * 3 + 2] / 255.0
          )
          positions.setValue(j, bboxMat.transformVec3(pos))
        }
      }
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Sets state of current geometry(Including line segments) using a binary reader object.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.loadBaseGeomBinary(reader)

    // this.computeVertexNormals();
    this.emit('geomDataChanged', {})
  }
}

Registry.register('Points', Points)

export default Points
export { Points }
