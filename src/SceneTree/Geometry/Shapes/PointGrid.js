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
    this.__rebuild()

    const resize = () => {
      this.__resize()
    }

    this.__x.on('valueChanged', resize)
    this.__y.on('valueChanged', resize)
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    this.setNumVertices(this.__xDivisions * this.__yDivisions)

    const texCoords = this.getVertexAttribute('texCoords')
    if (texCoords) {
      for (let i = 0; i < this.__yDivisions; i++) {
        const y = i / (this.__yDivisions - 1)
        for (let j = 0; j < this.__xDivisions; j++) {
          const x = j / (this.__xDivisions - 1)
          texCoords.getValueRef(i * this.__xDivisions + j).set(x, y)
        }
      }
    }
    this.__resize(false)
    this.emit('geomDataTopologyChanged', {})
  }

  /**
   * The __resize method.
   * @param {number} emit - emit a 'geomDataChanged' event.
   * @private
   */
  __resize(emit = true) {
    const positions = this.getVertexAttribute('positions')
    for (let i = 0; i < this.__yDivisions; i++) {
      const y = (i / (this.__yDivisions - 1) - 0.5) * this.__y
      for (let j = 0; j < this.__xDivisions; j++) {
        const x = (j / (this.__xDivisions - 1) - 0.5) * this.__x
        positions.getValueRef(i * this.__xDivisions + j).set(x, y, 0.0)
      }
    }
    this.setBoundingBoxDirty()
    if (emit) this.emit('geomDataChanged', {})
  }
}

Registry.register('PointGrid', PointGrid)
export { PointGrid }
