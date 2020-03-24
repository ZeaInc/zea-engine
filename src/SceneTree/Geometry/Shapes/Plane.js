import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { Mesh } from '../Mesh.js'
import { NumberParameter } from '../../Parameters/index'

/** A class for generating a plane geometry.
 * @extends Mesh
 */
class Plane extends Mesh {
  /**
   * Create a plane.
   * @param {number} SizeX - The length of the plane along the X axis.
   * @param {number} SizeY - The length of the plane along the Y axis.
   * @param {number} DetailX - The number of divisions along the X axis.
   * @param {number} DetailY - The number of divisions along the Y axis.
   * @param {boolean} addNormals - The addNormals value.
   * @param {boolean} addTextureCoords - The addTextureCoords value.
   */
  constructor(
    SizeX = 1.0,
    SizeY = 1.0,
    DetailX = 1,
    DetailY = 1,
    addNormals = true,
    addTextureCoords = true
  ) {
    super()

    if (isNaN(SizeX) || isNaN(SizeY) || isNaN(DetailX) || isNaN(DetailY))
      throw new Error('Invalid geom args')

    this.__sizeXParam = this.addParameter(new NumberParameter('SizeX', SizeX))
    this.__sizeYParam = this.addParameter(new NumberParameter('SizeY', SizeY))
    this.__detailXParam = this.addParameter(new NumberParameter('DetailX', DetailX))
    this.__detailYParam = this.addParameter(new NumberParameter('DetailY', DetailY))
    if (addNormals) this.addVertexAttribute('normals', Vec3)
    if (addTextureCoords) this.addVertexAttribute('texCoords', Vec2)
    this.__rebuild()
    
    this.__sizeXParam.valueChanged.connect(this.__resize.bind(this))
    this.__sizeYParam.valueChanged.connect(this.__resize.bind(this))
    this.__detailXParam.valueChanged.connect(this.__rebuild.bind(this))
    this.__detailYParam.valueChanged.connect(this.__rebuild.bind(this))
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const detailX = this.__detailXParam.getValue()
    const detailY = this.__detailYParam.getValue()
    this.setNumVertices((detailX + 1) * (detailY + 1))
    this.setFaceCounts([0, detailX * detailY])

    let quadId = 0
    for (let i = 0; i < detailY; i++) {
      for (let j = 0; j < detailX; j++) {
        const v0 = (detailX + 1) * (i + 1) + j
        const v1 = (detailX + 1) * (i + 1) + (j + 1)
        const v2 = (detailX + 1) * i + (j + 1)
        const v3 = (detailX + 1) * i + j
        this.setFaceVertexIndices(quadId, v0, v1, v2, v3)
        quadId = quadId + 1
      }
    }

    let voff = 0
    const normals = this.getVertexAttribute('normals')
    if (normals) {
      for (let i = 0; i <= detailY; i++) {
        for (let j = 0; j <= detailX; j++) {
          normals.getValueRef(voff).set(0, 0, 1)
          voff++
        }
      }
    }

    voff = 0
    const texCoords = this.getVertexAttribute('texCoords')
    if (texCoords) {
      for (let i = 0; i <= detailY; i++) {
        const y = i / detailY
        for (let j = 0; j <= detailX; j++) {
          const x = j / detailX
          texCoords.getValueRef(voff).set(x, y)
          voff++
        }
      }
    }

    this.__resize(false)
    this.geomDataTopologyChanged.emit()
  }

  /**
   * The __resize method.
   * @private
   */
  __resize(emit = true) {
    const sizeX = this.__sizeXParam.getValue()
    const sizeY = this.__sizeYParam.getValue()
    const detailX = this.__detailXParam.getValue()
    const detailY = this.__detailYParam.getValue()
    let voff = 0
    for (let i = 0; i <= detailY; i++) {
      const y = (i / detailY - 0.5) * sizeY
      for (let j = 0; j <= detailX; j++) {
        const x = (j / detailX - 0.5) * sizeX
        this.getVertex(voff).set(x, y, 0.0)
        voff++
      }
    }

    this.setBoundingBoxDirty()
    if (emit) this.geomDataChanged.emit()
  }
}

export { Plane }
