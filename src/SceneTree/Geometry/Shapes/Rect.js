import { ProceduralLines } from './ProceduralLines'
import { NumberParameter } from '../../Parameters/NumberParameter.js'
import { Registry } from '../../../Registry'

/**
 * A class for generating a rectangle shape.
 *
 * ```
 * const rect = new Rect(1.5, 2.0)
 * ```
 *
 * **Parameters**
 * * **X(`NumberParameter`):** Length of the rectangle along the `X` axis.
 * * **Y(`NumberParameter`):** Length of the rectangle along the `Y` axis.
 *
 *
 * @extends {ProceduralLines}
 */
class Rect extends ProceduralLines {
  /**
   * Create a rect.
   * @param {number} x - The length of the rect along the `X` axis.
   * @param {number} y - The length of the rect along the `Y` axis.
   */
  constructor(x = 1.0, y = 1.0) {
    super()

    if (isNaN(x) || isNaN(y)) throw new Error('Invalid geom args')

    this.__x = this.addParameter(new NumberParameter('X', x))
    this.__x.on('valueChanged', this.resize.bind(this))
    this.__y = this.addParameter(new NumberParameter('Y', y))
    this.__y.on('valueChanged', this.resize.bind(this))
    this.rebuild()
  }

  /**
   * The rebuild method.
   * @private
   */
  rebuild() {
    this.setNumVertices(4)
    this.setNumSegments(4)
    this.setSegmentVertexIndices(0, 0, 1)
    this.setSegmentVertexIndices(1, 1, 2)
    this.setSegmentVertexIndices(2, 2, 3)
    this.setSegmentVertexIndices(3, 3, 0)
    this.resize(false)
  }

  /**
   * The resize method.
   * @private
   */
  resize() {
    const x = this.__x.getValue()
    const y = this.__y.getValue()

    const positions = this.getVertexAttribute('positions')
    positions.getValueRef(0).set(-0.5 * x, -0.5 * y, 0.0)
    positions.getValueRef(1).set(0.5 * x, -0.5 * y, 0.0)
    positions.getValueRef(2).set(0.5 * x, 0.5 * y, 0.0)
    positions.getValueRef(3).set(-0.5 * x, 0.5 * y, 0.0)
  }
}

Registry.register('Rect', Rect)

export { Rect }
