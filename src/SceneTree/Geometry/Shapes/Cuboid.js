import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { Mesh } from '../Mesh.js'
import { BooleanParameter, NumberParameter } from '../../Parameters/index'
import { sgFactory } from '../../SGFactory.js'

/** A class for generating a cuboid geometry.
 * @extends Mesh
 */
class Cuboid extends Mesh {
  /**
   * Create a cuboid.
   * @param {number} x - The length of the cuboid along the X axis.
   * @param {number} y - The length of the cuboid along the Y axis.
   * @param {number} z - The length of the cuboid along the Z axis.
   * @param {boolean} baseZAtZero - The baseZAtZero value.
   */
  constructor(x = 1.0, y = 1.0, z = 1.0, baseZAtZero = false) {
    super()

    if (isNaN(x) || isNaN(y) || isNaN(z)) throw new Error('Invalid geom args')

    this.__xParam = this.addParameter(new NumberParameter('x', x))
    this.__yParam = this.addParameter(new NumberParameter('y', y))
    this.__zParam = this.addParameter(new NumberParameter('z', z))
    this.__baseZAtZeroParam = this.addParameter(
      new BooleanParameter('baseZAtZero', baseZAtZero)
    )

    this.setFaceCounts([0, 6])
    this.setFaceVertexIndices(0, 0, 1, 2, 3)
    this.setFaceVertexIndices(1, 7, 6, 5, 4)

    this.setFaceVertexIndices(2, 1, 0, 4, 5)
    this.setFaceVertexIndices(3, 3, 2, 6, 7)

    this.setFaceVertexIndices(4, 0, 3, 7, 4)
    this.setFaceVertexIndices(5, 2, 1, 5, 6)
    this.setNumVertices(8)
    this.addVertexAttribute('texCoords', Vec2)
    this.addVertexAttribute('normals', Vec3)
    this.__rebuild()

    const resize = () => {
      this.__resize()
    }
    this.__xParam.valueChanged.connect(resize)
    this.__yParam.valueChanged.connect(resize)
    this.__zParam.valueChanged.connect(resize)
    this.__baseZAtZeroParam.valueChanged.connect(resize)
  }

  /**
   * Setter for the size of the cuboid.
   * @param {number} x - The length of the edges along the X axis.
   * @param {number} y - The length of the edges along the Y axis.
   * @param {number} z - The length of the edges along the Z axis.
   */
  setSize(x, y, z) {
    this.__xParam.setValue(x)
    this.__yParam.setValue(y)
    this.__zParam.setValue(z)
  }

  /**
   * Setter for the base size of the cuboid.
   * @param {number} x - The length of the edges along the X axis.
   * @param {number} y - The length of the edges along the Y axis.
   */
  setBaseSize(x, y) {
    this.__xParam.setValue(x)
    this.__yParam.setValue(y)
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const normals = this.getVertexAttribute('normals')
    for (let i = 0; i < 6; i++) {
      let normal
      switch (i) {
        case 0:
          normal = new Vec3(0, 0, 1)
          break
        case 1:
          normal = new Vec3(0, 0, -1)
          break
        case 2:
          normal = new Vec3(1, 0, 0)
          break
        case 3:
          normal = new Vec3(-1, 0, 0)
          break
        case 4:
          normal = new Vec3(0, 1, 0)
          break
        case 5:
          normal = new Vec3(0, -1, 0)
          break
      }
      normals.setFaceVertexValue(i, 0, normal)
      normals.setFaceVertexValue(i, 1, normal)
      normals.setFaceVertexValue(i, 2, normal)
      normals.setFaceVertexValue(i, 3, normal)
    }
    const texCoords = this.getVertexAttribute('texCoords')
    for (let i = 0; i < 6; i++) {
      texCoords.setFaceVertexValue(i, 0, new Vec2(0, 0))
      texCoords.setFaceVertexValue(i, 1, new Vec2(1, 0))
      texCoords.setFaceVertexValue(i, 2, new Vec2(1, 1))
      texCoords.setFaceVertexValue(i, 3, new Vec2(0, 1))
    }
    this.__resize()
  }

  /**
   * The __resize method.
   * @param {number} mode - The mode value.
   * @private
   */
  __resize(mode) {
    const x = this.__xParam.getValue()
    const y = this.__yParam.getValue()
    const z = this.__zParam.getValue()
    const baseZAtZero = this.__baseZAtZeroParam.getValue()
    let zoff = 0.5
    if (baseZAtZero) zoff = 1.0
    this.getVertex(0).set(0.5 * x, -0.5 * y, zoff * z)
    this.getVertex(1).set(0.5 * x, 0.5 * y, zoff * z)
    this.getVertex(2).set(-0.5 * x, 0.5 * y, zoff * z)
    this.getVertex(3).set(-0.5 * x, -0.5 * y, zoff * z)

    zoff = -0.5
    if (baseZAtZero) zoff = 0.0
    this.getVertex(4).set(0.5 * x, -0.5 * y, zoff * z)
    this.getVertex(5).set(0.5 * x, 0.5 * y, zoff * z)
    this.getVertex(6).set(-0.5 * x, 0.5 * y, zoff * z)
    this.getVertex(7).set(-0.5 * x, -0.5 * y, zoff * z)

    this.setBoundingBoxDirty()
    this.geomDataChanged.emit()
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @return {object} - Returns the json object.
   */
  toJSON() {
    const json = super.toJSON()
    json['x'] = this.__x
    json['y'] = this.__y
    json['z'] = this.__z
    return json
  }
}

sgFactory.registerClass('Cuboid', Cuboid)

export { Cuboid }
