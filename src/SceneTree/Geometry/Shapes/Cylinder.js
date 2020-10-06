import { Vec2 } from '../../../Math/Vec2'
import { Vec3 } from '../../../Math/Vec3'
import { BooleanParameter, NumberParameter } from '../../Parameters/index'
import { Registry } from '../../../Registry'
import { ProceduralMesh } from './ProceduralMesh'

/**
 * A class for generating a cylinder geometry. It is very much like a cuboid but with `N` number of sides.
 *
 * ```
 * const cylinder = new Cylinder(1.5, 2.0, 6)
 * ```
 *
 * **Parameters**
 * * **Radius(`NumberParameter`):** Specifies the radius of the cylinder.
 * * **Height(`NumberParameter`):** Specifies the height of the cone.
 * * **Sides(`NumberParameter`):** Specifies the number of subdivisions around the `Z` axis.
 * * **Loops(`NumberParameter`):** Specifies the number of subdivisions(stacks) on the `Z` axis.
 * * **Caps(`BooleanParameter`):** Specifies whether the ends of the cylinder are capped or open.
 * * **BaseZAtZero(`BooleanParameter`):** Property to start or not `Z` axis from position `0.
 *
 * @extends {ProceduralMesh}
 */
class Cylinder extends ProceduralMesh {
  /**
   * Create a cylinder.
   * @param {number} radius - The radius of the cylinder.
   * @param {number} height - The height of the cylinder.
   * @param {number} sides - The number of sides.
   * @param {number} loops - The number of loops.
   * @param {boolean} caps - A boolean indicating whether the ends of the cylinder are capped or open.
   * @param {boolean} baseZAtZero - The baseZAtZero value.
   */
  constructor(radius = 0.5, height = 1.0, sides = 32, loops = 2, caps = true, baseZAtZero = false) {
    super()

    if (isNaN(radius) || isNaN(height) || isNaN(sides) || isNaN(loops)) throw new Error('Invalid geom args')

    this.__radiusParam = this.addParameter(new NumberParameter('Radius', radius))
    this.__heightParam = this.addParameter(new NumberParameter('Height', height))
    this.__sidesParam = this.addParameter(new NumberParameter('Sides', sides >= 3 ? sides : 3, [3, 200], 1))
    this.__loopsParam = this.addParameter(new NumberParameter('Loops', loops >= 2 ? loops : 2, [1, 200], 1))
    this.__capsParam = this.addParameter(new BooleanParameter('Caps', caps))
    this.__baseZAtZeroParam = this.addParameter(new BooleanParameter('BaseZAtZero', baseZAtZero))

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
    this.__sidesParam.on('valueChanged', rebuild)
    this.__loopsParam.on('valueChanged', rebuild)
    this.__capsParam.on('valueChanged', rebuild)
    this.__baseZAtZeroParam.on('valueChanged', resize)
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    this.clear()

    const nbSides = this.__sidesParam.getValue()
    const nbLoops = this.__loopsParam.getValue()
    const caps = this.__capsParam.getValue()

    let numVertices = nbSides * nbLoops
    if (caps) {
      numVertices += 2
    }
    this.setNumVertices(numVertices)
    if (caps) this.setFaceCounts([nbSides * 2, nbSides])
    else this.setFaceCounts([0, nbSides])

    // ////////////////////////////
    // Build the topology
    let faceIndex = 0

    if (caps) {
      // Bottom caps topology
      for (let j = 0; j < nbSides; j++) {
        const v0 = numVertices - 1
        const v1 = j
        const v2 = (j + 1) % nbSides
        this.setFaceVertexIndices(faceIndex++, [v0, v1, v2])
      }
      // Top caps topology
      for (let j = 0; j < nbSides; j++) {
        const v0 = nbSides * (nbLoops - 1) + j
        const v1 = numVertices - 2
        const v2 = nbSides * (nbLoops - 1) + ((j + 1) % nbSides)
        this.setFaceVertexIndices(faceIndex++, [v0, v1, v2])
      }
    }

    // build the topology for the body of the cylinder
    for (let i = 0; i < nbLoops - 1; i++) {
      for (let j = 0; j < nbSides; j++) {
        const v0 = nbSides * i + ((j + 1) % nbSides)
        const v1 = nbSides * i + j
        const v2 = nbSides * (i + 1) + j
        const v3 = nbSides * (i + 1) + ((j + 1) % nbSides)
        this.setFaceVertexIndices(faceIndex++, [v0, v1, v2, v3])
      }
    }

    // ////////////////////////////
    // setNormals
    const normals = this.getVertexAttribute('normals')

    // Now set the attribute values
    faceIndex = 0
    if (caps) {
      const normal = new Vec3(0.0, 0.0, -1.0)
      for (let i = 0; i < nbSides; i++) {
        normals.setFaceVertexValue(faceIndex, 0, normal)
        normals.setFaceVertexValue(faceIndex, 1, normal)
        normals.setFaceVertexValue(faceIndex, 2, normal)
        faceIndex++
      }
      normal.set(0.0, 0.0, 1.0)
      for (let i = 0; i < nbSides; i++) {
        normals.setFaceVertexValue(faceIndex, 0, normal)
        normals.setFaceVertexValue(faceIndex, 1, normal)
        normals.setFaceVertexValue(faceIndex, 2, normal)
        faceIndex++
      }
    }
    for (let i = 0; i < nbLoops - 1; i++) {
      for (let j = 0; j < nbSides; j++) {
        let phi = (j / nbSides) * 2.0 * Math.PI
        const normal1 = new Vec3(Math.sin(phi), Math.cos(phi), 0.0)
        normals.setFaceVertexValue(faceIndex, 0, normal1)
        normals.setFaceVertexValue(faceIndex, 1, normal1)

        phi = ((j + 1) / nbSides) * 2.0 * Math.PI
        const normal2 = new Vec3(Math.sin(phi), Math.cos(phi), 0.0)
        normals.setFaceVertexValue(faceIndex, 2, normal2)
        normals.setFaceVertexValue(faceIndex, 3, normal2)
        faceIndex++
      }
    }

    // ////////////////////////////
    // setUVs
    const texCoords = this.getVertexAttribute('texCoords')

    // Now set the attrbute values
    faceIndex = 0
    if (caps) {
      for (let i = 0; i < nbSides; i++) {
        texCoords.setFaceVertexValue(faceIndex, 0, new Vec2(i / nbSides, 0.0))
        texCoords.setFaceVertexValue(faceIndex, 1, new Vec2((i + 1) / nbSides, 0.0))
        texCoords.setFaceVertexValue(faceIndex, 2, new Vec2((i + 0.5) / nbSides, 1.0))
        faceIndex++
      }
      for (let i = 0; i < nbSides; i++) {
        texCoords.setFaceVertexValue(faceIndex, 0, new Vec2(i / nbSides, 0.0))
        texCoords.setFaceVertexValue(faceIndex, 1, new Vec2((i + 1) / nbSides, 0.0))
        texCoords.setFaceVertexValue(faceIndex, 2, new Vec2((i + 0.5) / nbSides, 1.0))
        faceIndex++
      }
    }

    for (let i = 0; i < nbSides; i++) {
      texCoords.setFaceVertexValue(faceIndex, 0, new Vec2((i + 1) / nbSides, 0.0))
      texCoords.setFaceVertexValue(faceIndex, 2, new Vec2((i + 1) / nbSides, 1.0))
      texCoords.setFaceVertexValue(faceIndex, 1, new Vec2(i / nbSides, 0.0))
      texCoords.setFaceVertexValue(faceIndex, 3, new Vec2(i / nbSides, 1.0))
      faceIndex++
    }

    this.emit('geomDataTopologyChanged', {})
    this.__resize()
  }

  /**
   * The __resize method.
   * @private
   */
  __resize() {
    const nbSides = this.__sidesParam.getValue()
    const nbLoops = this.__loopsParam.getValue()
    const radius = this.__radiusParam.getValue()
    const height = this.__heightParam.getValue()
    const caps = this.__capsParam.getValue()
    const baseZAtZero = this.__baseZAtZeroParam.getValue()

    let numVertices = nbSides * nbLoops
    if (caps) {
      numVertices += 2
    }
    let vertex = 0
    let zoff = 0.5
    if (baseZAtZero) zoff = 0.0

    const positions = this.getVertexAttribute('positions')
    for (let i = 0; i < nbLoops; i++) {
      const z = (i / (nbLoops - 1)) * height - height * zoff
      for (let j = 0; j < nbSides; j++) {
        const phi = (j / nbSides) * 2.0 * Math.PI
        positions.getValueRef(vertex).set(Math.sin(phi) * radius, Math.cos(phi) * radius, z)
        vertex++
      }
    }
    if (caps) {
      positions.getValueRef(numVertices - 1).set(0.0, 0.0, height * (baseZAtZero ? 0.0 : -0.5))
      positions.getValueRef(numVertices - 2).set(0.0, 0.0, height * (baseZAtZero ? 1.0 : 0.5))
    }

    this.computeVertexNormals()

    this.setBoundingBoxDirty()
    this.emit('geomDataChanged', {})
  }
}

Registry.register('Cylinder', Cylinder)

export { Cylinder }
