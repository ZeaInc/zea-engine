/* eslint-disable no-unused-vars */
import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { BooleanParameter, NumberParameter } from '../../Parameters/index'
import { Registry } from '../../../Registry'
import { ProceduralMesh } from './ProceduralMesh'

/**
 * Represents a cone geometry.
 *
 * ```
 * const cone = new Cone(1.2, 4.0)
 * ```
 *
 * **Parameters**
 * * **Radius(`NumberParameter`):** Specifies the radius of the base of the cone.
 * * **Height(`NumberParameter`):** Specifies the height of the cone.
 * * **Detail(`NumberParameter`):** Specifies the number of subdivisions around the `Z` axis.
 * * **Cap(`BooleanParameter`):** Specifies whether the base of the cone is capped or open.
 *
 * @extends {ProceduralMesh}
 */
class Cone extends ProceduralMesh {
  /**
   * Create a cone.
   * @param {number} radius - The radius of the base of the cone.
   * @param {number} height - The height of the cone.
   * @param {number} detail - The detail of the cone.
   * @param {boolean} cap -  A boolean indicating whether the base of the cone is capped or open.
   */
  constructor(radius = 0.5, height = 1.0, detail = 32, cap = true) {
    super()

    if (isNaN(radius) || isNaN(height) || isNaN(detail)) throw new Error('Invalid geom args')

    this.__radiusParam = this.addParameter(new NumberParameter('Radius', radius))
    this.__heightParam = this.addParameter(new NumberParameter('Height', height))
    this.__detailParam = this.addParameter(new NumberParameter('Detail', detail >= 3 ? detail : 3, [3, 200], 1))
    this.__capParam = this.addParameter(new BooleanParameter('Cap', cap))

    this.addVertexAttribute('texCoords', Vec2)
    this.addVertexAttribute('normals', Vec3)
    this.__rebuild()

    const resize = () => {
      this.__resize()
    }
    const rebuild = () => {
      this.__rebuild()
    }
    this.__radiusParam.on('valueChanged', resize)
    this.__heightParam.on('valueChanged', resize)
    this.__detailParam.on('valueChanged', rebuild)
    this.__capParam.on('valueChanged', rebuild)
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    this.clear()

    const nbSides = this.__detailParam.getValue()
    const radius = this.__radiusParam.getValue()
    const height = this.__heightParam.getValue()
    const cap = this.__capParam.getValue()
    let numVertices = nbSides + 1
    if (cap) {
      numVertices += 1
    }
    this.setNumVertices(numVertices)
    const tipPoint = nbSides
    const basePoint = nbSides + 1

    // ////////////////////////////
    // Set Vertex Positions
    const positions = this.getVertexAttribute('positions')

    positions.getValueRef(tipPoint).set(0.0, 0.0, height)
    for (let i = 0; i < nbSides; i++) {
      const theta = (i / nbSides) * 2.0 * Math.PI
      positions.getValueRef(i).set(radius * Math.cos(theta), radius * Math.sin(theta), 0.0)
    }
    if (cap) {
      positions.getValueRef(basePoint).set(0.0, 0.0, 0.0)
    }

    // ////////////////////////////
    // Build the topology
    this.setFaceCounts([nbSides + (cap ? nbSides : 0)])
    for (let i = 0; i < nbSides; i++) {
      const j = (i + 1) % nbSides
      this.setFaceVertexIndices(i, [j, i, tipPoint])
    }
    if (cap) {
      for (let i = 0; i < nbSides; i++) {
        const j = (i + 1) % nbSides
        this.setFaceVertexIndices(nbSides + i, [i, j, basePoint])
      }
    }

    // ////////////////////////////
    // setNormals
    const normals = this.getVertexAttribute('normals')

    let normalElevation
    const divider = height
    if (Math.abs(height) < 1.0e-12) normalElevation = height < 0 ? -1.0e-12 : 1.0e-12
    normalElevation = radius / divider

    let tri = 0
    for (let i = 0; i < nbSides; i++) {
      const theta1 = ((i + 1) / nbSides) * 2.0 * Math.PI
      const theta2 = (i / nbSides) * 2.0 * Math.PI
      const theta = (theta1 + theta2) * 0.5

      normals.setFaceVertexValue(tri, 0, new Vec3(Math.cos(theta1), normalElevation, Math.sin(theta1)).normalize())
      normals.setFaceVertexValue(tri, 1, new Vec3(Math.cos(theta2), normalElevation, Math.sin(theta2)).normalize())
      normals.setFaceVertexValue(tri, 2, new Vec3(Math.cos(theta), normalElevation, Math.sin(theta)).normalize())
      tri++
    }
    if (cap) {
      const normal = new Vec3(0.0, -1.0, 0.0)
      for (let i = 0; i < nbSides; i++) {
        normals.setFaceVertexValue(tri, 0, normal)
        normals.setFaceVertexValue(tri, 1, normal)
        normals.setFaceVertexValue(tri, 2, normal)
        tri++
      }
    }

    // ////////////////////////////
    // setUVs
    const texCoords = this.getVertexAttribute('texCoords')

    // Now set the attrbute values
    tri = 0
    for (let i = 0; i < nbSides; i++) {
      texCoords.setFaceVertexValue(tri, 0, new Vec2((i + 1) / nbSides, 0.0))
      texCoords.setFaceVertexValue(tri, 1, new Vec2(i / nbSides, 0.0))
      texCoords.setFaceVertexValue(tri, 2, new Vec2((i + 0.5) / nbSides, 1.0))
    }
    if (cap) {
      for (let i = 0; i < nbSides; i++) {
        texCoords.setFaceVertexValue(tri, 0, new Vec2(i / nbSides, 0.0))
        texCoords.setFaceVertexValue(tri, 1, new Vec2((i + 1) / nbSides, 0.0))
        texCoords.setFaceVertexValue(tri, 2, new Vec2((i + 0.5) / nbSides, 1.0))
        tri++
      }
    }

    this.setBoundingBoxDirty()
    this.emit('geomDataTopologyChanged', {})
  }

  /**
   * The __resize method.
   * @private
   */
  __resize() {
    const nbSides = this.__detailParam.getValue()
    const radius = this.__radiusParam.getValue()
    const height = this.__heightParam.getValue()
    const cap = this.__capParam.getValue()

    const tipPoint = nbSides
    const basePoint = nbSides + 1

    const positions = this.getVertexAttribute('positions')
    positions.getValueRef(tipPoint).set(0.0, 0.0, height)
    for (let i = 0; i < nbSides; i++) {
      const theta = (i / nbSides) * 2.0 * Math.PI
      positions.getValueRef(i).set(radius * Math.cos(theta), radius * Math.sin(theta), 0.0)
    }
    if (this.__cap) {
      positions.getValueRef(basePoint).set(0.0, 0.0, 0.0)
    }

    this.setBoundingBoxDirty()
    this.emit('geomDataChanged', {})
  }
}

Registry.register('Cone', Cone)
export { Cone }
