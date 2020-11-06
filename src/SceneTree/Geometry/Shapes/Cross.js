import { ProceduralLines } from './ProceduralLines'
import { NumberParameter } from '../../Parameters/NumberParameter.js'
import { Registry } from '../../../Registry'

/**
 * A class for generating a cross shape, drawing a line on the `X,Y,Z` axes.
 * The axis line length is the `size` you specify, but the middle of the line is positioned in the coordinate `(0, 0, 0)` .
 * Meaning that half of the line goes negative and half goes positive.
 *
 * ```
 * const cross = new Cross(1.5)
 * ```
 *
 * **Parameters**
 * * **Size(`NumberParameter`):** Specifies the size of the cross.
 *
 * @extends {ProceduralLines}
 */
class Cross extends ProceduralLines {
  /**
   * Create a cross.
   * @param {number} size - The size of the cross.
   */
  constructor(size = 1.0) {
    super()

    if (isNaN(size)) throw new Error('Invalid geom args')

    this.__sizeParam = this.addParameter(new NumberParameter('Size', size))
  }

  /**
   * The rebuild method.
   * @private
   */
  rebuild() {
    this.setNumVertices(6)
    this.setNumSegments(3)
    this.setSegmentVertexIndices(0, 0, 1)
    this.setSegmentVertexIndices(1, 2, 3)
    this.setSegmentVertexIndices(2, 4, 5)
    this.resize()
  }

  /**
   * The resize method.
   * @private
   */
  resize() {
    const size = this.__sizeParam.getValue()
    const positions = this.getVertexAttribute('positions')
    positions.getValueRef(0).set(-0.5 * size, 0, 0)
    positions.getValueRef(1).set(0.5 * size, 0, 0)
    positions.getValueRef(2).set(0, 0.5 * size, 0)
    positions.getValueRef(3).set(0, -0.5 * size, 0)
    positions.getValueRef(4).set(0, 0, 0.5 * size)
    positions.getValueRef(5).set(0, 0, -0.5 * size)
  }
}

Registry.register('Cross', Cross)

export { Cross }
