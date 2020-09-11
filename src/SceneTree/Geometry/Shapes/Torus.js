import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { ProceduralMesh } from './ProceduralMesh'
import { Registry } from '../../../Registry'
import { NumberParameter } from '../../Parameters/NumberParameter'

/**
 * A class for generating a torus geometry.
 *
 * ```
 * const torus = new Torus(0.4, 1.3)
 * ```
 *
 * @extends ProceduralMesh
 */
class Torus extends ProceduralMesh {
  /**
   * Creates an instance of Torus.
   *
   * @param {number} [innerRadius=0.5] - The inner radius of the torus.
   * @param {number} [outerRadius=3] - The outer radius of the torus.
   * @param {number} [detail=32] - The detail of the cone.
   * @param {number} [loops=6] - The number of loops.
   */
  constructor(innerRadius = 0.5, outerRadius = 3, detail = 32) {
    super()

    if (isNaN(innerRadius) || isNaN(outerRadius) || isNaN(detail)) throw new Error('Invalid geom args')

    this.__innerRadiusParam = this.addParameter(new NumberParameter('InnerRadius', innerRadius))
    this.__outerRadiusParam = this.addParameter(new NumberParameter('OuterRadius', outerRadius))
    this.__detailParam = this.addParameter(new NumberParameter('Detail', detail >= 3 ? detail : 3, [3, 200], 1))

    this.addVertexAttribute('texCoords', Vec2)
    this.addVertexAttribute('normals', Vec3)
    this.__rebuild()

    const resize = () => {
      this.__resize()
    }
    const rebuild = () => {
      this.__rebuild()
    }

    this.__innerRadiusParam.on('valueChanged', resize)
    this.__outerRadiusParam.on('valueChanged', resize)
    this.__detailParam.on('valueChanged', rebuild)
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const innerRadius = this.__innerRadiusParam.getValue()
    const outerRadius = this.__outerRadiusParam.getValue()
    const detail = this.__detailParam.getValue()
    const nbSlices = detail
    const nbLoops = detail * 2
    const numVertices = nbSlices * nbLoops

    this.setNumVertices(numVertices)
    this.setFaceCounts([0, nbSlices * nbLoops])

    // ////////////////////////////
    // Set Vertex Positions

    const positions = this.getVertexAttribute('positions')
    const normals = this.getVertexAttribute('normals')
    let vertex = 0
    for (let i = 0; i < nbLoops; i++) {
      const theta = (i / nbLoops) * 2.0 * Math.PI
      const ctheta = Math.cos(theta)
      const stheta = Math.sin(theta)

      for (let j = 0; j < nbSlices; j++) {
        const phi = (j / nbSlices) * 2.0 * Math.PI

        const sphi = Math.sin(phi)
        const cphi = Math.cos(phi)
        const d = outerRadius + cphi * innerRadius

        // Set positions and normals at the same time.
        positions.getValueRef(vertex).set(ctheta * d, stheta * d, innerRadius * sphi)
        normals.getValueRef(vertex).set(ctheta * cphi, stheta * cphi, sphi)
        vertex++
      }
    }

    // ////////////////////////////
    // Build the topology and texCoords
    const texCoords = this.getVertexAttribute('texCoords')
    let faceIndex = 0
    for (let i = 0; i < nbLoops; i++) {
      for (let j = 0; j < nbSlices; j++) {
        const ip = (i + 1) % nbLoops
        const jp = (j + 1) % nbSlices
        const v0 = nbSlices * i + j
        const v1 = nbSlices * i + jp
        const v2 = nbSlices * ip + jp
        const v3 = nbSlices * ip + j
        this.setFaceVertexIndices(faceIndex, [v0, v1, v2, v3])

        texCoords.setFaceVertexValue(faceIndex, 0, new Vec2(i / nbLoops, j / nbLoops))
        texCoords.setFaceVertexValue(faceIndex, 1, new Vec2(i / nbLoops, (j + 1) / nbLoops))
        texCoords.setFaceVertexValue(faceIndex, 2, new Vec2((i + 1) / nbLoops, (j + 1) / nbLoops))
        texCoords.setFaceVertexValue(faceIndex, 3, new Vec2((i + 1) / nbLoops, j / nbLoops))
        faceIndex++
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
    const innerRadius = this.__innerRadiusParam.getValue()
    const outerRadius = this.__outerRadiusParam.getValue()
    const detail = this.__detailParam.getValue()
    const nbSlices = detail
    const nbLoops = detail * 2

    const positions = this.getVertexAttribute('positions')
    let vertex = 0
    for (let i = 0; i < nbLoops; i++) {
      const theta = (i / nbLoops) * 2.0 * Math.PI
      const ctheta = Math.cos(theta)
      const stheta = Math.sin(theta)

      for (let j = 0; j < nbSlices; j++) {
        const phi = (j / nbSlices) * 2.0 * Math.PI

        const sphi = Math.sin(phi)
        const cphi = Math.cos(phi)
        const d = outerRadius + cphi * innerRadius

        // Set positions and normals at the same time.
        positions.getValueRef(vertex).set(ctheta * d, stheta * d, innerRadius * sphi)
        vertex++
      }
    }

    this.setBoundingBoxDirty()
    this.emit('geomDataChanged', {})
  }
}

Registry.register('Torus', Torus)

export { Torus }
