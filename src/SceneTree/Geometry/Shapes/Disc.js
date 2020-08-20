import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { NumberParameter } from '../../Parameters/index'
import Registry from '../../../Registry'
import ProceduralMesh from './ProceduralMesh'

/**
 * A class for generating a disc geometry.
 *
 * ```
 * const disc = new Disc(2.0, 22)
 * ```
 *
 * **Parameters**
 * * **Radius(`NumberParameter`):** Specifies the radius of the disc.
 * * **Sides(`NumberParameter`):** Specifies the resolution, or the disc subdivisions around `Z` axis.
 *
 * @extends {ProceduralMesh}
 */
class Disc extends ProceduralMesh {
  /**
   * Creates an instance of Disc.
   *
   * @param {number} [radius=0.5] - The radius of the disc.
   * @param {number} [sides=32] - The number of sides.
   */
  constructor(radius = 0.5, sides = 32) {
    super()

    if (isNaN(radius) || isNaN(sides)) throw new Error('Invalid geom args')

    this.__radiusParam = this.addParameter(new NumberParameter('Radius', radius))
    this.__sidesParam = this.addParameter(new NumberParameter('Sides', sides >= 3 ? sides : 3, [3, 200], 1))

    this.addVertexAttribute('texCoords', Vec2)
    this.addVertexAttribute('normals', Vec3)
    this.__rebuild()
  }

  /**
   * Returns the value of the `radius` parameter.
   *
   * @return {number} - Returns the radius.
   */
  get radius() {
    return this.__radius
  }

  /**
   * Sets the value of the `radius` parameter.
   *
   * @param {number} val - The radius value.
   */
  set radius(val) {
    this.__radius = val
    this.__resize()
  }

  /**
   * Sets the value of the `sides` parameter.
   * @param {number} val - The number of sides.
   */
  set sides(val) {
    this.__sides = val >= 3 ? val : 3
    this.__rebuild()
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const nbSides = this.__sidesParam.getValue()

    this.setNumVertices(nbSides + 1)
    this.setFaceCounts([nbSides])

    // ////////////////////////////
    // Set Vertex Positions
    const positions = this.getVertexAttribute('positions')
    positions.getValueRef(0).set(0.0, 0.0, 0.0)

    // ////////////////////////////
    // Build the topology
    for (let j = 0; j < nbSides; j++) {
      const v1 = (j % nbSides) + 1
      const v2 = ((j + 1) % nbSides) + 1
      this.setFaceVertexIndices(j, [0, v1, v2])
    }

    // ////////////////////////////
    // setNormals
    const normals = this.getVertexAttribute('normals')
    // Now set the attrbute values
    const normal = new Vec3(0, 0, 1)
    normals.setValue(0, normal)
    for (let i = 0; i < nbSides; i++) {
      normals.setValue(i + 1, normal)
    }

    // ////////////////////////////
    // setUVs
    const texCoords = this.getVertexAttribute('texCoords')
    texCoords.getValueRef(0).set(0.5, 0.5)
    for (let i = 0; i < nbSides; i++) {
      const phi = (i / nbSides) * 2.0 * Math.PI
      texCoords.getValueRef(i + 1).set(Math.sin(phi) * 0.5 + 0.5, Math.cos(phi) * 0.5 + 0.5)
    }

    this.setBoundingBoxDirty()
    this.__resize()
  }

  /**
   * The __resize method.
   * @private
   */
  __resize() {
    const nbSides = this.__sidesParam.getValue()
    const radius = this.__radiusParam.getValue()
    const positions = this.getVertexAttribute('positions')
    for (let i = 0; i < nbSides; i++) {
      const phi = (i / nbSides) * 2.0 * Math.PI
      positions.getValueRef(i + 1).set(Math.sin(phi) * radius, Math.cos(phi) * radius, 0.0)
    }
    this.setBoundingBoxDirty()
    this.emit('geomDataChanged', {})
  }
}

Registry.register('Disc', Disc)

export { Disc }
