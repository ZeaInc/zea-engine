import { NumberParameter } from '../../Parameters/index'
import Registry from '../../../Registry'
import ProceduralLines from './ProceduralLines'

/**
 * A class for generating a circle shape using line segments.
 *
 * ```
 * const circle = new Circle(2.2, 12)
 * ```
 *
 * **Parameters**
 * * **Radius(`NumberParameter`):** Radius of the circle.
 * * **Angle(`NumberParameter`):** Number of segments used to build the circle.
 * * **NumSegments(`NumberParameter`):** Segments angle in radiants.
 *
 * @extends {ProceduralLines}
 */
class Circle extends ProceduralLines {
  /**
   * Creates an instance of Circle.
   * @param {number} radius - The radius of the circle.
   * @param {number} numSegments - The number of segments.
   * @param {number} angle - Arc segments angle(radians)
   */
  constructor(radius = 1.0, numSegments = 32, angle = Math.PI * 2) {
    super()

    if (isNaN(radius) || isNaN(numSegments)) throw new Error('Invalid geom args')

    this.__radius = this.addParameter(new NumberParameter('Radius', radius))
    this.__angle = this.addParameter(new NumberParameter('Angle', angle))
    this.__numSegments = this.addParameter(
      new NumberParameter('NumSegments', numSegments >= 3 ? numSegments : 3, [3, 200], 1)
    )

    const resize = () => {
      this.__resize()
    }
    const rebuild = () => {
      this.__rebuild()
    }
    this.__radius.on('valueChanged', resize)
    this.__angle.on('valueChanged', rebuild)
    this.__numSegments.on('valueChanged', rebuild)
    this.__rebuild()
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const segs = this.__numSegments.getValue()
    this.setNumVertices(segs)
    const arc = this.__angle.getValue() < Math.PI * 2
    if (arc) this.setNumSegments(segs - 1)
    else this.setNumSegments(segs)
    for (let i = 0; i < (arc ? segs - 1 : segs); i++) this.setSegmentVertexIndices(i, i, (i + 1) % segs)
    this.__resize(false)
    this.emit('geomDataTopologyChanged', {})
  }

  /**
   * The __resize method.
   * @param {boolean} emit - The emit value.
   * @private
   */
  __resize(emit) {
    const radius = this.__radius.getValue()
    const segs = this.__numSegments.getValue()
    const step = this.__angle.getValue() / segs
    const positions = this.getVertexAttribute('positions')
    for (let i = 0; i < segs; i++) {
      positions.getValueRef(i).set(Math.cos(step * i) * radius, Math.sin(step * i) * radius, 0.0)
    }
    this.setBoundingBoxDirty()
    if (emit) this.emit('geomDataChanged', {})
  }
}

Registry.register('Circle', Circle)
export { Circle }
