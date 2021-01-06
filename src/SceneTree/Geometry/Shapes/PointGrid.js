import { Vec2 } from '../../../Math/Vec2'
import { ProceduralPoints } from './ProceduralPoints'
import { NumberParameter } from '../../Parameters/NumberParameter'
import { Registry } from '../../../Registry'

/**
 * Represents an ordered grid of points along `X` and `Y` axes.
 *
 * ```
 * const pointGrid = new PointGrid(2.2, 1.5, 12, 12)
 * ```
 *
 * **Parameters**
 * * **X(`NumberParameter`):** Length of the grid along the `X` axis.
 * * **Y(`NumberParameter`):** Length of the grid along the `Y` axis.
 * * **XDivisions(`NumberParameter`):** Number of divisions along `X` axis
 * * **YDivisions(`NumberParameter`):** Number of divisions along `Y` axis
 * @extends {ProceduralPoints}
 */
class PointGrid extends ProceduralPoints {
  /**
   * Creates an instance of PointGrid.
   *
   * @param {number} [x=1.0] - The length of the point grid along the X axis.
   * @param {number} [y=1.0] - The length of the point grid along the Y axis.
   * @param {number} [xDivisions=1] - The number of divisions along the X axis.
   * @param {number} [yDivisions=1] - The number of divisions along the Y axis.
   * @param {boolean} [addTextureCoords=false] - The addTextureCoords value.
   */
  constructor(x = 1.0, y = 1.0, xDivisions = 1, yDivisions = 1, addTextureCoords = false) {
    super()

    if (isNaN(x) || isNaN(y) || isNaN(xDivisions) || isNaN(yDivisions)) throw new Error('Invalid geom args')
    this.__x = this.addParameter(new NumberParameter('X', x))
    this.__y = this.addParameter(new NumberParameter('Y', y))
    this.__xDivisions = this.addParameter(new NumberParameter('XDivisions', xDivisions))
    this.__yDivisions = this.addParameter(new NumberParameter('YDivisions', yDivisions))

    if (addTextureCoords) this.addVertexAttribute('texCoords', Vec2)

    this.topologyParams.push('XDivisions')
    this.topologyParams.push('YDivisions')
  }

  /**
   * The rebuild method.
   * @private
   */
  rebuild() {
    const xCount = this.__xDivisions.getValue()
    const yCount = this.__yDivisions.getValue()
    this.setNumVertices(xCount * yCount)

    const texCoords = this.getVertexAttribute('texCoords')
    if (texCoords) {
      for (let i = 0; i < yCount; i++) {
        const y = i / (yCount - 1)
        for (let j = 0; j < xCount; j++) {
          const x = j / (xCount - 1)
          texCoords.getValueRef(i * xCount + j).set(x, y)
        }
      }
    }
    this.resize()
  }

  /**
   * The resize method.
   * @private
   */
  resize() {
    const xSize = this.__x.getValue()
    const ySize = this.__y.getValue()
    const xCount = this.__xDivisions.getValue()
    const yCount = this.__yDivisions.getValue()
    const positions = this.getVertexAttribute('positions')
    for (let i = 0; i < yCount; i++) {
      const y = (i / (yCount - 1) - 0.5) * ySize
      for (let j = 0; j < xCount; j++) {
        const x = (j / (xCount - 1) - 0.5) * xSize
        positions.getValueRef(i * xCount + j).set(x, y, 0.0)
      }
    }
  }
}

Registry.register('PointGrid', PointGrid)
export { PointGrid }
