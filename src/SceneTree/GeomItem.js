import { Vec2, Xfo } from '../Math/index'
import { ValueSetMode, XfoParameter, Mat4Parameter } from './Parameters/index'
import { MaterialParameter } from './Parameters/MaterialParameter'
import { GeometryParameter } from './Parameters/GeometryParameter'
import { sgFactory } from './SGFactory.js'
import { BaseGeomItem } from './BaseGeomItem.js'

/** Class representing a geometry item in a scene tree.
 * @extends BaseGeomItem
 */
class GeomItem extends BaseGeomItem {
  /**
   * Create a geometry item.
   * @param {string} name - The name of the geom item.
   * @param {any} geom - The geom value.
   * @param {any} material - The material value.
   */
  constructor(name, geom = undefined, material = undefined) {
    super(name)

    this.__geomParam = this.insertParameter(
      new GeometryParameter('geometry'),
      0
    )
    this.__geomParam.valueChanged.connect(this._setBoundingBoxDirty.bind(this))
    this.__geomParam.boundingBoxDirtied.connect(
      this._setBoundingBoxDirty.bind(this)
    )
    this.__materialParam = this.insertParameter(
      new MaterialParameter('Material'),
      1
    )
    this.__paramMapping['material'] = this.getParameterIndex(this.__materialParam)

    this.__lightmapCoordOffset = new Vec2()
    this.__geomOffsetXfoParam = this.addParameter(
      new XfoParameter('GeomOffsetXfo')
    )
    this.__geomMatParam = this.addParameter(new Mat4Parameter('GeomMat'))

    this.__cleanGeomMat = this.__cleanGeomMat.bind(this)
    this.__globalXfoParam.valueChanged.connect(mode => {
      this.__geomMatParam.setDirty(this.__cleanGeomMat)
    })
    this.__geomOffsetXfoParam.valueChanged.connect(mode => {
      this.__geomMatParam.setDirty(this.__cleanGeomMat)
    })

    this.geomXfoChanged = this.__geomMatParam.valueChanged
    this.materialAssigned = this.__materialParam.valueChanged
    this.geomAssigned = this.__geomParam.valueChanged

    if (geom) this.setGeometry(geom, ValueSetMode.DATA_LOAD)
    if (material) this.setMaterial(material, ValueSetMode.DATA_LOAD)
  }

  /**
   * The __cleanGeomMat method.
   * @return {any} - The return value.
   * @private
   */
  __cleanGeomMat() {
    const globalMat4 = this.__globalXfoParam.getValue().toMat4()
    const geomOffsetMat4 = this.__geomOffsetXfoParam.getValue().toMat4()
    return globalMat4.multiply(geomOffsetMat4)
  }

  // ////////////////////////////////////////
  // Geometry

  /**
   * Getter for geometry.
   * @return {any} - The return value.
   */
  getGeometry() {
    return this.__geomParam.getValue()
  }

  /**
   * Setter for geometry.
   * @param {any} geom - The geom value.
   * @param {number} mode - The mode value.
   */
  setGeometry(geom, mode) {
    this.__geomParam.setValue(geom, mode)
  }

  /**
   * Getter for geometry (getGeom is deprectated. Please use getGeometry).
   * @return {any} - The return value.
   */
  getGeom() {
    console.warn("getGeom is deprectated. Please use 'getGeometry'")
    return this.getGeometry()
  }

  /**
   * Setter for geometry. (setGeom is deprectated. Please use setGeometry).
   * @param {any} geom - The geom value.
   * @return {any} - The return value.
   */
  setGeom(geom) {
    console.warn("setGeom is deprectated. Please use 'setGeometry'")
    return this.setGeometry(geom)
  }

  /**
   * Getter for material.
   * @return {Material} - The return value.
   */
  getMaterial() {
    return this.__materialParam.getValue()
  }

  /**
   * Setter for material.
   * @param {Material} material - The material value.
   * @param {number} mode - The mode value.
   */
  setMaterial(material, mode) {
    this.__materialParam.setValue(material, mode)
  }

  /**
   * The _cleanBoundingBox method.
   * @param {Box3} bbox - The bounding box value.
   * @return {any} - The return value.
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
   * Getter for the geom offset Xfo translation.
   * @return {Xfo} - Returns the geom offset Xfo.
   */
  getGeomOffsetXfo() {
    return this.__geomOffsetXfoParam.getValue()
  }

  /**
   * Setter for the geom offset Xfo translation.
   * @param {Xfo} xfo - The Xfo value.
   */
  setGeomOffsetXfo(xfo) {
    this.__geomOffsetXfoParam.setValue(xfo)
  }

  /**
   * Getter for the geom Xfo translation.
   * @return {Xfo} - Returns the geom Xfo.
   */
  getGeomMat4() {
    return this.__geomMatParam.getValue()
  }

  // ///////////////////////////
  // Lightmaps

  /**
   * Getter for a lightmap name.
   * @return {string} - Returns the lightmap name.
   */
  getLightmapName() {
    return this.__lightmapName
  }

  /**
   * Getter for a lightmap coordinate offset.
   * @return {any} - Returns the lightmap coord offset.
   */
  getLightmapCoordsOffset() {
    return this.__lightmapCoordOffset
  }

  /**
   * The root asset item pushes its offset to the geom items in the
   * tree. This offsets the light coords for each geom.
   * @param {string} lightmapName - The lightmap name.
   * @param {any} offset - The offset value.
   */
  applyAssetLightmapSettings(lightmapName, offset) {
    this.__lightmap = lightmapName
    this.__lightmapCoordOffset.addInPlace(offset)
  }

  // ///////////////////////////
  // Debugging

  /**
   * The toJSON method encodes this type as a json object for persistences.
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
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context) {
    super.fromJSON(json, context)
    context.numGeomItems++
  }

  /**
   * The readBinary method.
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
      this.setGeometry(geom, ValueSetMode.DATA_LOAD)
    } else {
      const onGeomLoaded = range => {
        if (geomIndex >= range[0] && geomIndex < range[1]) {
          const geom = geomLibrary.getGeom(geomIndex)
          if (geom) this.setGeometry(geom, ValueSetMode.DATA_LOAD)
          else console.warn('Geom not loaded:', this.getName())
          geomLibrary.rangeLoaded.disconnectId(connid)
        }
      }
      const connid = geomLibrary.rangeLoaded.connect(onGeomLoaded)
    }

    // this.setVisibility(j.visibility);
    // Note: to save space, some values are skipped if they are identity values
    const geomOffsetXfoFlag = 1 << 2
    if (itemflags & geomOffsetXfoFlag) {
      this.__geomOffsetXfoParam.setValue(
        new Xfo(
          reader.loadFloat32Vec3(),
          reader.loadFloat32Quat(),
          reader.loadFloat32Vec3()
        )
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
          console.warn(
            "Geom :'" + this.name + "' Material not found:" + materialName
          )
          material = materialLibrary.getMaterial('Default')
        }
        this.setMaterial(material, ValueSetMode.DATA_LOAD)
      } else {
        // Force nodes to have a material so we can see them.
        this.setMaterial(
          context.assetItem.getMaterialLibrary().getMaterial('Default'),
          ValueSetMode.DATA_LOAD
        )
      }
    }

    this.__lightmapCoordOffset = reader.loadFloat32Vec2()
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new geom item, copies its values
   * from this item and returns it.
   * @param {number} flags - The flags value.
   * @return {GeomItem} - Returns a new cloned geom item.
   */
  clone(flags) {
    const cloned = new GeomItem()
    cloned.copyFrom(this, flags)
    return cloned
  }

  /**
   * The copyFrom method.
   * @param {GeomItem} src - The geom item to copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    super.copyFrom(src, flags)
    this.__lightmapCoordOffset = src.__lightmapCoordOffset
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
