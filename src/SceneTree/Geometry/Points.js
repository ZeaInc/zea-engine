import { BaseGeom } from './BaseGeom.js';

/** Class representing points.
 * @extends BaseGeom
 */
class Points extends BaseGeom {
  /**
   * Create points.
   */
  constructor() {
    super();
  }

  /**
   * The loadBin method.
   * @param {object} reader - The reader value.
   */
  loadBin(reader) {
    this.name = reader.loadStr();
    const numVerts = reader.loadUInt32();
    this.__boundingBox.set(reader.loadFloat32Vec3(), reader.loadFloat32Vec3());
    this.setNumVertices(numVerts);
    const vertices = this.vertices;

    if (numVerts < 256) {
      const bboxMat = this.__boundingBox.toMat4();
      const posAttr_8bit = reader.loadUInt8Array(numVerts * 3);
      for (let i = 0; i < numVerts; i++) {
        const pos = new Vec3(
          posAttr_8bit[i * 3 + 0] / 255.0,
          posAttr_8bit[i * 3 + 1] / 255.0,
          posAttr_8bit[i * 3 + 2] / 255.0
        );
        vertices.setValue(i, bboxMat.transformVec3(pos));
      }
    } else {
      const numClusters = reader.loadUInt32();
      const clusters = [];
      for (let i = 0; i < numClusters; i++) {
        const range = reader.loadUInt32Vec2();
        const p0 = reader.loadFloat32Vec3();
        const p1 = reader.loadFloat32Vec3();
        clusters.push({
          range: range,
          bbox: new Box3(p0, p1),
        });
      }
      const posAttr_8bit = reader.loadUInt8Array(numVerts * 3);

      for (let i = 0; i < numClusters; i++) {
        const bboxMat = clusters[i]['bbox'].toMat4();
        for (let j = clusters[i]['range'].x; j < clusters[i]['range'].y; j++) {
          const pos = new Vec3(
            posAttr_8bit[j * 3 + 0] / 255.0,
            posAttr_8bit[j * 3 + 1] / 255.0,
            posAttr_8bit[j * 3 + 2] / 255.0
          );
          vertices.setValue(j, bboxMat.transformVec3(pos));
        }
      }
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The readBinary method.
   * @param {object} reader - The reader param.
   * @param {object} context - The context param.
   */
  readBinary(reader, context) {
    super.loadBaseGeomBinary(reader);

    // this.computeVertexNormals();
    this.geomDataChanged.emit();
  }
}

export { Points };
