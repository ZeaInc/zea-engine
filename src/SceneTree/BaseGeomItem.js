import { Color } from '../Math/Color.js'
import { Signal } from '../Utilities/index'
import { TreeItem } from './TreeItem'
import { Material } from './Material'
import { ValueSetMode } from './Parameters/index'

/** Class representing a base geometry item in a scene tree.
 * @extends TreeItem
 */
class BaseGeomItem extends TreeItem {
  /**
   * Create a base geometry item.
   * @param {string} name - The name of the base geom item.
   */
  constructor(name) {
    super(name)
    this.overlay = false
    this.__cutAway = false
    this.__cutAwayVector = false
    this.__cutAwayDist = false
    this.cutAwayChanged = new Signal()

    this.__layers = []
  }

  /**
   * The setOverlay method.
   * @param {any} val - The val param.
   */
  setOverlay(val) {
    // TODO: need to find the layer and add this item to it.
    this.overlay = val
  }

  /**
   * The getLayers method.
   * @return {boolean} - The return value.
   */
  isOverlay() {
    return this.overlay
  }

  /**
   * Adds a layer.
   * @param {string} name - The name of the layer.
   */
  addLayer(name) {
    // TODO: need to find the layer and add this item to it.
    this.__layers.push(name)
  }

  /**
   * The getLayers method.
   * @return {any} - The return value.
   */
  getLayers() {
    return this.__layers
  }

  // ////////////////////////////////////////
  // Cutaways

  /**
   * Checks if cutways are enabled.
   * @return {boolean} - Returns true if enabled.
   */
  isCutawayEnabled() {
    return this.__cutAway
  }

  /**
   * Setter for enabling cutways.
   * @param {any} state - The state of the cutway.
   */
  setCutawayEnabled(state) {
    this.__cutAway = state
    this.cutAwayChanged.emit()
  }

  /**
   * Getter for cutway vectors.
   * @return {any} - The return value.
   */
  getCutVector() {
    return this.__cutAwayVector
  }

  /**
   * Setter for cutway vectors.
   * @param {any} cutAwayVector - The cutAwayVector value.
   */
  setCutVector(cutAwayVector) {
    this.__cutAwayVector = cutAwayVector
    this.cutAwayChanged.emit()
  }

  /**
   * Getter for the cutaway distance.
   * @return {any} - The return value.
   */
  getCutDist() {
    return this.__cutAwayDist
  }

  /**
   * Setter for the cutaway distance.
   * @param {any} cutAwayDist - The cutAwayDist value.
   */
  setCutDist(cutAwayDist) {
    this.__cutAwayDist = cutAwayDist
    this.cutAwayChanged.emit()
  }

  // ///////////////////////////
  // Persistence

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    super.readBinary(reader, context)

    // if (context.version >= 4) {
    if (context.versions['zea-engine'].greaterOrEqualThan([0, 0, 4])) {
      const materialName = reader.loadStr()
      // const materialName = 'Material' + this.__bodyDescId;

      const materialLibrary = context.assetItem.getMaterialLibrary()
      let material = materialLibrary.getMaterial(materialName, false)
      if (!material) {
        // console.warn("BaseGeomItem :'" + this.name + "' Material not found:" + materialName);
        // material = materialLibrary.getMaterial('DefaultMaterial');

        material = new Material(materialName, 'SimpleSurfaceShader')
        material
          .getParameter('BaseColor')
          .setValue(Color.random(0.25), ValueSetMode.DATA_LOAD)
        context.assetItem.getMaterialLibrary().addMaterial(material)
      }
      this.setMaterial(material, ValueSetMode.DATA_LOAD)

      this.__layers = reader.loadStrArray()
      if (this.__layers.length > 0) {
        // console.log("Layers:", this.__layers)
        for (const layer of this.__layers) context.addGeomToLayer(this, layer)
      }
    }
  }
}

export { BaseGeomItem }
