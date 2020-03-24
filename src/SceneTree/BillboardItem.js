import { Color, Vec3 } from '../Math/index'
import {
  ValueSetMode,
  BooleanParameter,
  NumberParameter,
  ColorParameter,
  Vec3Parameter,
  ListParameter,
  ImageParameter,
} from './Parameters/index'
import { TreeItem } from './TreeItem.js'
import { GeomItem } from './GeomItem.js'
import { Material } from './Material.js'
import { Lines } from './Geometry/Lines.js'

/** Class representing a billboard item in a scene tree.
 * @extends TreeItem
 */
class BillboardItem extends TreeItem {
  /**
   * Create a billboard item.
   * @param {string} name - The name of the billboard item.
   * @param {any} image - The image value.
   */
  constructor(name, image) {
    super(name)
    const imageParam = this.addParameter(new ImageParameter('image'))
    if (image) imageParam.setValue(image) // Note: this dirties the param and will ensure it is saved to JSON
    this.addParameter(new NumberParameter('scale', 0.01))
    this.addParameter(new NumberParameter('alpha', 1.0))
    this.addParameter(new ColorParameter('color', new Color(1.0, 1.0, 1.0)))
    this.addParameter(new BooleanParameter('alignedToCamera', false))

    const startParam = this.addParameter(new Vec3Parameter('lineStartOffset'))
    const endParam = this.addParameter(new ListParameter('lineEnd', Vec3))
    const lines = []
    const linesMaterial = new Material('LabelLinesMaterial', 'LinesShader')
    linesMaterial
      .getParameter('Color')
      .setValue(new Color(0.0, 0.0, 0.0), ValueSetMode.OPERATOR_SETVALUE)
    linesMaterial
      .getParameter('Opacity')
      .setValue(1.0, ValueSetMode.OPERATOR_SETVALUE)
    endParam.elementAdded.connect((elem, index) => {
      const lineGeom = new Lines()
      lineGeom.setNumVertices(2)
      lineGeom.setNumSegments(1)
      lineGeom.setSegment(0, 0, 1)

      const line = new GeomItem('line' + index)
      // Note: because the lines are generated geoms.
      // we do not want them being persisted in the JSON structure.
      line.setGeometry(lineGeom, ValueSetMode.OPERATOR_SETVALUE)
      line.setMaterial(linesMaterial, ValueSetMode.OPERATOR_SETVALUE)
      lines[index] = line
      updateLinePoints(index)
      this.addChild(line, false)
    })
    endParam.elementRemoved.connect(() => {
      // this.removeChildByHandle(lines[index]);
      // lines.splice(9, 1)
    })
    const updateLinePoints = index => {
      const invGlobalXfo = this.__globalXfoParam.getValue().inverse()
      const start = startParam.getValue()
      const endPoints = endParam.getValue()
      const end = endPoints[index]
      const lineGeom = lines[index].getGeometry()
      lineGeom.setVertex(0, start)
      lineGeom.setVertex(1, invGlobalXfo.transformVec3(end))
    }
    const updateAllLinePoints = () => {
      for (let i = 0; i < lines.length; i++) {
        updateLinePoints(i)
      }
    }

    startParam.valueChanged.connect(updateAllLinePoints)
    endParam.valueChanged.connect(updateAllLinePoints)
    this.__globalXfoParam.valueChanged.connect(updateAllLinePoints)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return super.toJSON(context, flags)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  fromJSON(j, context, flags) {
    return super.fromJSON(j, context, flags)
  }
}

import { sgFactory } from './SGFactory.js'
sgFactory.registerClass('BillboardItem', BillboardItem)

export { BillboardItem }
