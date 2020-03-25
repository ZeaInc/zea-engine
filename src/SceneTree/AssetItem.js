import { Signal } from '../Utilities/index'
import { Version } from './Version.js'
import { TreeItem } from './TreeItem.js'
import { Group } from './Group.js'
import { GeomLibrary } from './GeomLibrary.js'
import { MaterialLibrary } from './MaterialLibrary.js'
import { sgFactory } from './SGFactory.js'

/** Class representing an asset item in a scene tree.
 * @extends TreeItem
 */
class AssetItem extends TreeItem {
  /**
   * Create an asset item.
   * @param {string} name - The name of the asset item.
   */
  constructor(name) {
    super(name)

    this.__geomLibrary = new GeomLibrary()
    this.__materials = new MaterialLibrary()

    this.loaded = new Signal(true)
    // Assets that are generated inline can be considered loaded
    // (e.g. the ground plane). So we set loaded to true, unless a file is specified.
    this.loaded.setToggled(true)
  }

  /**
   * The isLoaded method.
   * @return {boolean} - Returns true if the asset has already loaded its data.
   */
  isLoaded() {
    return this.loaded.isToggled()
  }

  /**
   * The getGeometryLibrary method.
   * @return {any} - The return value.
   */
  getGeometryLibrary() {
    return this.__geomLibrary
  }

  /**
   * The getMaterialLibrary method.
   * @return {any} - The return value.
   */
  getMaterialLibrary() {
    return this.__materials
  }

  /**
   * The getUnitsConversion method.
   * @return {any} - The return value.
   */
  getUnitsConversion() {
    return this.__unitsScale
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context = {}) {
    context.assetItem = this
    context.numTreeItems = 0
    context.numGeomItems = 0

    if (!context.versions['zea-engine']) {
      context.versions['zea-engine'] = new Version(reader.loadStr())
    }
    console.log("Loading Engine File version:", context.versions['zea-engine'])

    let layerRoot
    const layers = {}
    context.addGeomToLayer = (geomItem, layer) => {
      if (!layers[layer]) {
        if (!layerRoot) {
          layerRoot = new TreeItem('Layers')
          this.addChild(layerRoot, false)
        }
        const group = new Group(layer)
        group.propagateXfoToItems = false
        layerRoot.addChild(group, false)
        layers[layer] = group
      }
      layers[layer].addItem(geomItem)
    }
    const loadUnits = () => {
      this.__units = reader.loadStr()
      // Calculate a scale factor to convert
      // the asset units to meters(the scene units)
      let scaleFactor = 1.0
      switch (this.__units) {
        case 'Millimeters':
          scaleFactor = 0.001
          break
        case 'Centimeters':
          scaleFactor = 0.01
          break
        case 'Meters':
          scaleFactor = 1.0
          break
        case 'Kilometers':
          scaleFactor = 1000.0
          break
        case 'Inches':
          scaleFactor = 0.0254
          break
        case 'Feet':
          scaleFactor = 0.3048
          break
        case 'Miles':
          scaleFactor = 1609.34
          break
      }
      this.__unitsScale = scaleFactor

      // Apply units change to existing Xfo (avoid changing tr).
      const xfo = this.getLocalXfo().clone()
      xfo.sc.scaleInPlace(scaleFactor)
      this.setLocalXfo(xfo)
    }

    if (context.versions['zea-engine'].greaterThan([0, 0, 6])) {
      // Loading units modifies our Xfo, which then propagates up
      // the tree forcing a re-computation. Better just do it at
      // the start.
      loadUnits()
    }

    this.__materials.readBinary(reader, context)

    super.readBinary(reader, context)

    if (
      context.versions['zea-engine'].greaterOrEqualThan([0, 0, 5]) &&
      context.versions['zea-engine'].lessThan([0, 0, 7])
    ) {
      loadUnits()
    }

    // console.log("numTreeItems:", context.numTreeItems, " numGeomItems:", context.numGeomItems)
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context = {}, flags = 0) {
    context.makeRelative = path => {
      const assetPath = this.getPath()
      const start = path.slice(0, assetPath.length)
      for (let i = 0; i < start.length - 1; i++) {
        if (start[i] != assetPath[i]) {
          console.warn(
            'Param Path is not relative to the asset. May not be able to be resolved at load time:' +
              path
          )
          return path
        }
      }
      // Relative paths start with a symbol for the root element.
      const relativePath = path.slice(assetPath.length - 1)
      relativePath[0] = '.'
      return relativePath
    }
    context.assetItem = this
    const j = super.toJSON(context, flags)
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @param {any} onDone - The onDone value.
   */
  fromJSON(j, context = {}, flags = 0, onDone) {
    if (!context) context = {}

    context.assetItem = this
    context.numTreeItems = 0
    context.numGeomItems = 0
    if (context.version == undefined) context.version = 0

    context.assetItem = this

    const plcbs = [] // Post load callbacks.
    context.resolvePath = (path, cb) => {
      // Note: Why not return a Promise here?
      // Promise evaluation is always async, so
      // all promisses will be resolved after the current call stack
      // has terminated. In our case, we want all paths
      // to be resolved before the end of the function, which
      // we can handle easily with callback functions.
      if (!path) throw new Error('Path not spcecified')
      const item = this.resolvePath(path)
      if (item) {
        cb(item)
      } else {
        // Some paths resolve to items generated during load,
        // so push a callback to re-try after the load is complete.
        plcbs.push(() => {
          const param = this.resolvePath(path)
          if (param) cb(param)
          else {
            console.warn('Path unable to be resolved:' + path)
          }
        })
      }
    }
    context.addPLCB = plcb => plcbs.push(plcb)

    // Avoid loading the FilePath as we are already loading json data.
    // if (j.params && j.params.FilePath) {
    //   delete j.params.FilePath
    // }

    super.fromJSON(j, context, flags)

    // Invoke all the post-load callbacks to resolve any
    // remaning references.
    for (const cb of plcbs) cb()

    if (onDone) onDone()
  }
}

sgFactory.registerClass('AssetItem', AssetItem)

export { AssetItem }
