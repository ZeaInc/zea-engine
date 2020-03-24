import { Lines } from '../Lines.js'

import { NumberParameter } from '../../Parameters/index'
import { sgFactory } from '../../SGFactory.js'

/** A class for generating a circle shape.
 * @extends Lines
 */
class Circle extends Lines {
  /**
   * Create a circle.
   * @param {number} radius - The radius of the circle.
   * @param {number} numSegments - The number of segments.
   */
  constructor(radius = 1.0, angle = Math.PI * 2, numSegments = 32) {
    super()

    if (isNaN(radius) || isNaN(numSegments))
      throw new Error('Invalid geom args')

    this.__radius = this.addParameter(new NumberParameter('Radius', radius))
    this.__angle = this.addParameter(new NumberParameter('Angle', angle))
    this.__numSegments = this.addParameter(
      new NumberParameter(
        'NumSegments',
        numSegments >= 3 ? numSegments : 3,
        [3, 200],
        1
      )
    )
    this.__radius.valueChanged.connect(this.__resize.bind(this))
    this.__angle.valueChanged.connect(this.__rebuild.bind(this))
    this.__numSegments.valueChanged.connect(this.__rebuild.bind(this))
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
    for (let i = 0; i < (arc ? segs-1 : segs); i++) this.setSegment(i, i, (i + 1) % segs)
    this.__resize(-1)
    this.geomDataTopologyChanged.emit()
  }

  /**
   * The __resize method.
   * @param {number} mode - The mode value.
   * @private
   */
  __resize(mode) {
    const radius = this.__radius.getValue()
    const segs = this.__numSegments.getValue()
    const step = this.__angle.getValue() / segs
    for (let i = 0; i < segs; i++)
      this.getVertex(i).set(
        Math.cos(step * i) * radius,
        Math.sin(step * i) * radius,
        0.0
      )
    this.setBoundingBoxDirty()
    if (mode != -1) this.geomDataChanged.emit()
  }
}
sgFactory.registerClass('Circle', Circle)
export { Circle }
