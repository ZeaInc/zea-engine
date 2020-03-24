import { Lines } from '../Lines.js'

import { BooleanParameter, NumberParameter } from '../../Parameters/index'
import { sgFactory } from '../../SGFactory.js'

/** A class for generating a grid.
 * @extends Lines
 */
class Grid extends Lines {
  /**
   * Create a grid.
   * @param {number} x - The length of the grid along the X axis.
   * @param {number} y - The length of the grid along the Y axis.
   * @param {number} xDivisions - The number of divisions along the X axis.
   * @param {number} yDivisions - The number of divisions along the X axis.
   * @param {boolean} skipCenterLines - A boolean indicating whether to display the center grid lines or not.
   */
  constructor(
    x = 1.0,
    y = 1.0,
    xDivisions = 10,
    yDivisions = 10,
    skipCenterLines = false
  ) {
    super()

    if (isNaN(x) || isNaN(y) || isNaN(xDivisions) || isNaN(yDivisions))
      throw new Error('Invalid geom args')

    this.__xParam = this.addParameter(new NumberParameter('x', x))
    this.__yParam = this.addParameter(new NumberParameter('y', y))
    this.__xDivisionsParam = this.addParameter(
      new NumberParameter('xDivisions', xDivisions)
    )
    this.__yDivisionsParam = this.addParameter(
      new NumberParameter('yDivisions', yDivisions)
    )
    this.__skipCenterLinesParam = this.addParameter(
      new BooleanParameter('skipCenterLines', skipCenterLines)
    )

    this.__rebuild()
  }

  /**
   * Getter for the length of the grid along the X axis.
   * @return {number} - Returns the length.
   */
  get sizeX() {
    return this.__x
  }

  /**
   * Setter for the length of the grid along the X axis.
   * @param {number} val - The length along the X axis.
   */
  set sizeX(val) {
    this.__x = val
    this.__resize()
  }

  /**
   * Getter for the length of the grid along the Y axis.
   * @return {number} - Returns the length.
   */
  get sizeY() {
    return this.__y
  }

  /**
   * Setter for the length of the grid along the U axis.
   * @param {number} val - The length along the Y axis.
   */
  set sizeY(val) {
    this.__y = val
    this.__resize()
  }

  /**
   * Getter for the number of divisions along the X axis.
   * @return {number} - Returns the number of divisions.
   */
  get divisionsX() {
    return this.__xDivisions
  }

  /**
   * Setter for the number of divisions along the X axis.
   * @param {number} val - The number of divisions.
   */
  set divisionsX(val) {
    this.__xDivisions = val
    this.__rebuild()
  }

  /**
   * Getter for the number of divisions along the Y axis.
   * @return {number} - Returns the number of divisions.
   */
  get divisionsY() {
    return this.__yDivisions
  }

  /**
   * Setter for the number of divisions along the Y axis.
   * @param {number} val - The number of divisions.
   */
  set divisionsY(val) {
    this.__yDivisions = val
    this.__rebuild()
  }

  /**
   * Setter for the size of the grid.
   * @param {number} x - The length along the X axis.
   * @param {number} y - The length along the Y axis.
   */
  setSize(x, y) {
    this.__x = x
    this.__y = y
    this.__resize()
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    const xDivisions = this.__xDivisionsParam.getValue()
    const yDivisions = this.__yDivisionsParam.getValue()

    const skipCenterLines =
      this.__skipCenterLinesParam.getValue() &&
      xDivisions % 2 == 0 &&
      yDivisions % 2 == 0
    this.setNumVertices(
      (xDivisions + yDivisions + 2 - (skipCenterLines ? 1 : 0)) * 2
    )
    this.setNumSegments(xDivisions + yDivisions + 2 - (skipCenterLines ? 1 : 0))
    let idx = 0
    for (let i = 0; i <= xDivisions; i++) {
      if (skipCenterLines && i == xDivisions / 2) continue
      const v0 = idx * 2
      const v1 = idx * 2 + 1
      this.setSegment(idx, v0, v1)
      idx++
    }
    for (let i = 0; i <= yDivisions; i++) {
      if (skipCenterLines && i == xDivisions / 2) continue
      const v0 = idx * 2
      const v1 = idx * 2 + 1
      this.setSegment(idx, v0, v1)
      idx++
    }
    this.__resize()
  }

  /**
   * The __resize method.
   * @private
   */
  __resize() {
    const xDivisions = this.__xDivisionsParam.getValue()
    const yDivisions = this.__yDivisionsParam.getValue()
    const xSize = this.__xParam.getValue()
    const ySize = this.__yParam.getValue()

    const skipCenterLines =
      this.__skipCenterLinesParam.getValue() &&
      xDivisions % 2 == 0 &&
      yDivisions % 2 == 0
    let idx = 0
    for (let i = 0; i <= xDivisions; i++) {
      if (skipCenterLines && i == xDivisions / 2) continue
      const v0 = idx * 2
      const v1 = idx * 2 + 1
      const x = (i / xDivisions - 0.5) * xSize
      this.getVertex(v0).set(x, -0.5 * ySize, 0.0)
      this.getVertex(v1).set(x, 0.5 * ySize, 0.0)
      idx++
    }
    for (let i = 0; i <= yDivisions; i++) {
      if (skipCenterLines && i == xDivisions / 2) continue
      const v0 = idx * 2
      const v1 = idx * 2 + 1
      const y = (i / yDivisions - 0.5) * ySize
      this.getVertex(v0).set(-0.5 * xSize, y, 0.0)
      this.getVertex(v1).set(0.5 * xSize, y, 0.0)
      idx++
    }

    this.setBoundingBoxDirty()
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @return {object} - Returns the json object.
   */
  toJSON() {
    const json = super.toJSON()
    json['x'] = this.__x
    json['z'] = this.__y
    json['xDivisions'] = this.__xDivisions
    json['yDivisions'] = this.__yDivisions
    return json
  }
}

sgFactory.registerClass('Grid', Grid)

export { Grid }
