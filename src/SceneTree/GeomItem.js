import { Vec2, Xfo } from '../Math/index'
import { XfoParameter, Mat4Parameter } from './Parameters/index'
import { MaterialParameter } from './Parameters/MaterialParameter'
import { GeometryParameter } from './Parameters/GeometryParameter'
import { sgFactory } from './SGFactory.js'
import { BaseGeomItem } from './BaseGeomItem.js'
import { Operator } from './Operators/Operator.js'
import { OperatorInput } from './Operators/OperatorInput.js'
import { OperatorOutput } from './Operators/OperatorOutput.js'


/** The operator the calculates the global Xfo of a TreeItem based on its parents GlobalXfo and its own LocalXfo
 * @extends Operator
 * @private
 */
class CalcGeomMatOperator extends Operator {
  /**
   * Create a gears operator.
   * @param {string} name - The name value.
   */
  constructor(globalXfoParam, geomOffsetXfoParam, geomMatParam) {
    super("CalcGeomMatOperator")
    this.addInput(new OperatorInput('GlobalXfo')).setParam(globalXfoParam)
    this.addInput(new OperatorInput('GeomOffsetXfo')).setParam(geomOffsetXfoParam)
    this.addOutput(new OperatorOutput('GeomMat')).setParam(geomMatParam)
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const globalXfo = this.getInput('GlobalXfo').getValue()
    const geomOffsetXfo = this.getInput('GeomOffsetXfo').getValue()
    const geomMatOutput = this.getOutput('GeomMat')

    const globalMat4 = globalXfo.toMat4()
    const geomOffsetMat4 = geomOffsetXfo.toMat4()
    geomMatOutput.setClean(globalMat4.multiply(geomOffsetMat4))
  }
}

/**
 * Class representing a geometry item in a scene tree.
 *
 * **Parameters**
 * * **Geometry(`GeometryParameter`):** _todo_
 * * **Material(`MaterialParameter`):** _todo_
 * * **GeomOffsetXfo(`XfoParameter`):** _todo_
 * * **GeomMat(`Mat4Parameter`):** _todo_
 *
 * **Events**
 * * **geomXfoChanged:** _todo_
 * * **materialAssigned:** _todo_
 * * **geomAssigned:** _todo_
 *
 * @extends BaseGeomItem
 */
class GeomItem extends BaseGeomItem {
  /**
   * Creates a geometry item.
   * @param {string} name - The name of the geom item.
   * @param {BaseGeom} geometry - The geometry value.
   * @param {Material} material - The material value.
   */
  constructor(name, geometry = undefined, material = undefined) {
    super(name)

    this.__geomParam = this.insertParameter(new GeometryParameter('Geometry'), 0)
    this._setBoundingBoxDirty = this._setBoundingBoxDirty.bind(this)
    this.__geomParam.on('valueChanged', this._setBoundingBoxDirty)
    this.__geomParam.on('boundingBoxChanged', this._setBoundingBoxDirty)
    this.__materialParam = this.insertParameter(new MaterialParameter('Material'), 1)
    this.__paramMapping['material'] = this.getParameterIndex(this.__materialParam)

    this.__lightmapCoordOffset = new Vec2()
    this.__geomOffsetXfoParam = this.addParameter(new XfoParameter('GeomOffsetXfo'))
    this.__geomMatParam = this.addParameter(new Mat4Parameter('GeomMat'))

    // this.__cleanGeomMat = this.__cleanGeomMat.bind(this)
    // this.__globalXfoParam.on('valueChanged', () => {
    //   this.__geomMatParam.setDirty(this.__cleanGeomMat)
    // })
    // this.__geomOffsetXfoParam.on('valueChanged', () => {
    //   this.__geomMatParam.setDirty(this.__cleanGeomMat)
    // })
    // this.__geomMatParam.on('valueChanged', (event) => {
    //   this.emit('geomXfoChanged', event)
    // })
    this.__materialParam.on('valueChanged', (event) => {
      this.emit('materialAssigned', event)
    })
    this.__geomParam.on('valueChanged', (event) => {
      this.emit('geomAssigned', event)
    })

    this.calcGeomMatOperator = new CalcGeomMatOperator(
      this.__globalXfoParam,
      this.__geomOffsetXfoParam,
      this.__geomMatParam
    )

    if (geometry) this.getParameter('Geometry').loadValue(geometry)
    if (material) this.getParameter('Material').loadValue(material)
  }

  // ////////////////////////////////////////
  // Geometry

  /**
   * Returns `Geometry` parameter value.
   *
   * @return {BaseGeom} - The return value.
   */
  getGeometry() {
    return this.__geomParam.getValue()
  }

  /**
   * Sets geometry object to `Geometry` parameter.
   *
   * @param {BaseGeom} geom - The geom value.
   */
  setGeometry(geom) {
    this.__geomParam.setValue(geom)
  }

  /**
   * Getter for geometry (getGeom is deprecated. Please use getGeometry).
   *
   * @deprecated
   * @return {BaseGeom} - The return value.
   */
  getGeom() {
    console.warn("getGeom is deprecated. Please use 'getGeometry'")
    return this.getGeometry()
  }

  /**
   * Setter for geometry. (setGeom is deprecated. Please use setGeometry).
   *
   * @deprecated
   * @param {BaseGeom} geom - The geom value.
   * @return {number} - The return value.
   */
  setGeom(geom) {
    console.warn("setGeom is deprecated. Please use 'setGeometry'")
    return this.setGeometry(geom)
  }

  /**
   * Returns the specified value of `Material`parameter.
   *
   * @return {Material} - The return value.
   */
  getMaterial() {
    return this.__materialParam.getValue()
  }

  /**
   * Sets material object to `Material` parameter.
   *
   * @param {Material} material - The material value.
   */
  setMaterial(material) {
    this.__materialParam.setValue(material)
  }

  /**
   * The _cleanBoundingBox method.
   * @param {Box3} bbox - The bounding box value.
   * @return {Box3} - The return value.
   * @private
   */
  _cleanBoundingBox(bbox) {
    bbox = super._cleanBoundingBox(bbox)
    const geom = this.getGeometry()
    if (geom) {
      bbox.addBox3(geom.boundingBox, this.getGeomMat4())
    }
    return bbox
  }

  // ////////////////////////////////////////
  // Xfos

  /**
   * Returns the offset `Xfo` object specified in `GeomOffsetXfo` parameter.
   *
   * @return {Xfo} - Returns the geom offset Xfo.
   */
  getGeomOffsetXfo() {
    return this.__geomOffsetXfoParam.getValue()
  }

  /**
   * Sets `Xfo` object to `GeomOffsetXfo` parameter.
   *
   * @param {Xfo} xfo - The Xfo value.
   */
  setGeomOffsetXfo(xfo) {
    this.__geomOffsetXfoParam.setValue(xfo)
  }

  /**
   * Returns `Mat4` object value of `GeomMat` parameter.
   *
   * @return {Mat4} - Returns the geom Xfo.
   */
  getGeomMat4() {
    return this.__geomMatParam.getValue()
  }

  // ///////////////////////////
  // Lightmaps

  /**
   * Returns lightmap name of the asset item.
   *
   * @return {string} - Returns the lightmap name.
   */
  getLightmapName() {
    return this.__lightmapName
  }

  /**
   * Returns lightmap coordinates offset object.
   *
   * @return {Vec2} - Returns the lightmap coord offset.
   */
  getLightmapCoordsOffset() {
    return this.__lightmapCoordOffset
  }

  /**
   * The root asset item pushes its offset to the geom items in the
   * tree. This offsets the light coords for each geom.
   *
   * @param {string} lightmapName - The lightmap name.
   * @param {Vec2} offset - The offset value.
   */
  applyAssetLightmapSettings(lightmapName, offset) {
    this.__lightmap = lightmapName
    this.__lightmapCoordOffset.addInPlace(offset)
  }

  // ///////////////////////////
  // Debugging

  /**
   * The toJSON method encodes this type as a json object for persistences.
   *
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const json = super.toJSON(context, flags)
    return json
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context) {
    super.fromJSON(json, context)
    context.numGeomItems++
  }

  /**
   * Sets state of current Item(Including lightmap offset & material) using a binary reader object.
   *
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.readBinary(reader, context)

    context.numGeomItems++

    this.__lightmapName = context.assetItem.getName()

    const itemflags = reader.loadUInt8()
    const geomIndex = reader.loadUInt32()
    const geomLibrary = context.assetItem.getGeometryLibrary()
    const geom = geomLibrary.getGeom(geomIndex)
    if (geom) {
      this.getParameter('Geometry').loadValue(geom)
    } else {
      this.geomIndex = geomIndex
      const onGeomLoaded = (event) => {
        const { range } = event
        if (geomIndex >= range[0] && geomIndex < range[1]) {
          const geom = geomLibrary.getGeom(geomIndex)
          if (geom) this.getParameter('Geometry').loadValue(geom)
          else console.warn('Geom not loaded:', this.getName())
          geomLibrary.off('rangeLoaded', onGeomLoaded)
        }
      }
      geomLibrary.on('rangeLoaded', onGeomLoaded)
    }

    // this.setVisibility(j.visibility);
    // Note: to save space, some values are skipped if they are identity values
    const geomOffsetXfoFlag = 1 << 2
    if (itemflags & geomOffsetXfoFlag) {
      this.__geomOffsetXfoParam.setValue(
        new Xfo(reader.loadFloat32Vec3(), reader.loadFloat32Quat(), reader.loadFloat32Vec3())
      )
    }

    // BaseGeomItem now handles loading materials.
    // if (context.version < 4) {
    if (context.versions['zea-engine'].lessThan([0, 0, 4])) {
      const materialFlag = 1 << 3
      if (itemflags & materialFlag) {
        const materialLibrary = context.assetItem.getMaterialLibrary()
        const materialName = reader.loadStr()
        let material = materialLibrary.getMaterial(materialName)
        if (!material) {
          console.warn("Geom :'" + this.name + "' Material not found:" + materialName)
          material = materialLibrary.getMaterial('Default')
        }
        this.getParameter('Material').loadValue(material)
      } else {
        // Force nodes to have a material so we can see them.
        this.getParameter('Material').loadValue(context.assetItem.getMaterialLibrary().getMaterial('Default'))
      }
    }

    this.__lightmapCoordOffset = reader.loadFloat32Vec2()
  }

  /**
   * Returns string representation of current object's state.
   *
   * @return {string} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new geom item, copies its values
   * from this item and returns it.
   *
   * @param {number} context - The flags value.
   * @return {GeomItem} - Returns a new cloned geom item.
   */
  clone(context) {
    const cloned = new GeomItem()
    cloned.copyFrom(this, context)
    return cloned
  }

  /**
   * Copies current GeomItem with all its children.
   *
   * @param {GeomItem} src - The geom item to copy from.
   * @param {number} context - The flags value.
   */
  copyFrom(src, context) {
    super.copyFrom(src, context)
    this.__lightmapCoordOffset = src.__lightmapCoordOffset

    if (!src.getGeometry() && src.geomIndex != -1) {
      const geomLibrary = context.assetItem.getGeometryLibrary()
      const geomIndex = src.geomIndex
      const onGeomLoaded = (event) => {
        const { range } = event
        if (geomIndex >= range[0] && geomIndex < range[1]) {
          const geom = geomLibrary.getGeom(geomIndex)
          if (geom) this.getParameter('Geometry').loadValue(geom)
          else console.warn('Geom not loaded:', this.getName())
          geomLibrary.off('rangeLoaded', onGeomLoaded)
        }
      }
      geomLibrary.on('rangeLoaded', onGeomLoaded)
    }

    // Geom Xfo should be dirty after cloning.
    // Note: this might not be necessary. It should
    // always be dirty after cloning.
    this.__geomMatParam.setDirty(this.__cleanGeomMat)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
  }
}

sgFactory.registerClass('GeomItem', GeomItem)

export { GeomItem }
