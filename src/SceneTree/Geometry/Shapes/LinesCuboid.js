import { NumberParameter } from '../../Parameters/NumberParameter.js'
import { Registry } from '../../../Registry'
import { ProceduralLines } from './ProceduralLines'

/**
 * A class for generating a lines cuboid shape(Without faces).
 *
 * **Parameters**
 * * **X(`NumberParameter`):** Length of the line cuboid along the `X` axis
 * * **Y(`NumberParameter`):** Length of the line cuboid along the `Y` axis
 * * **Z(`NumberParameter`):** Length of the line cuboid along the `Z` axis
 * * **BaseZAtZero(`NumberParameter`):** Property to start or not `Z` axis from position `0.
 *
 * @extends {ProceduralLines}
 */
class LinesCuboid extends ProceduralLines {
  /**
   * Create a lines cuboid.
   * @param {number} x - The length of the line cuboid along the X axis.
   * @param {number} y - The length of the line cuboid along the Y axis.
   * @param {number} z - The length of the line cuboid along the Z axis.
   * @param {boolean} baseZAtZero - The baseZAtZero value.
   */
  constructor(x = 1.0, y = 1.0, z = 1.0, baseZAtZero = false) {
    super()

    this.__x = this.addParameter(new NumberParameter('X', x))
    this.__y = this.addParameter(new NumberParameter('Y', y))
    this.__z = this.addParameter(new NumberParameter('Z', z))

    this.__baseZAtZero = this.addParameter(new NumberParameter('BaseZAtZero', baseZAtZero))
  }

  /**
   * The rebuild method.
   * @private
   */
  rebuild() {
    this.setNumVertices(8)
    this.setNumSegments(12)
    this.setSegmentVertexIndices(0, 0, 1)
    this.setSegmentVertexIndices(1, 1, 2)
    this.setSegmentVertexIndices(2, 2, 3)
    this.setSegmentVertexIndices(3, 3, 0)

    this.setSegmentVertexIndices(4, 4, 5)
    this.setSegmentVertexIndices(5, 5, 6)
    this.setSegmentVertexIndices(6, 6, 7)
    this.setSegmentVertexIndices(7, 7, 4)

    this.setSegmentVertexIndices(8, 0, 4)
    this.setSegmentVertexIndices(9, 1, 5)
    this.setSegmentVertexIndices(10, 2, 6)
    this.setSegmentVertexIndices(11, 3, 7)
    this.resize()
  }

  /**
   * The resize method.
   *
   * @private
   */
  resize() {
    const x = this.__x.getValue()
    const y = this.__y.getValue()
    const z = this.__z.getValue()
    const baseZAtZero = this.__baseZAtZero.getValue()

    const positions = this.getVertexAttribute('positions')
    let zoff = 0.5
    if (baseZAtZero) zoff = 1.0
    positions.getValueRef(0).set(0.5 * x, -0.5 * y, zoff * z)
    positions.getValueRef(1).set(0.5 * x, 0.5 * y, zoff * z)
    positions.getValueRef(2).set(-0.5 * x, 0.5 * y, zoff * z)
    positions.getValueRef(3).set(-0.5 * x, -0.5 * y, zoff * z)

    zoff = -0.5
    if (baseZAtZero) zoff = 0.0
    positions.getValueRef(4).set(0.5 * x, -0.5 * y, zoff * z)
    positions.getValueRef(5).set(0.5 * x, 0.5 * y, zoff * z)
    positions.getValueRef(6).set(-0.5 * x, 0.5 * y, zoff * z)
    positions.getValueRef(7).set(-0.5 * x, -0.5 * y, zoff * z)
  }
}

Registry.register('LinesCuboid', LinesCuboid)
export { LinesCuboid }
