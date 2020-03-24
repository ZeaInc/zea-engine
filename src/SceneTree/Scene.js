import { Vec3, Xfo, Color } from '../Math/index'
import { Material } from './Material.js'
import { TreeItem } from './TreeItem.js'
import { Lines } from './Geometry/Lines.js'
import { Grid } from './Geometry/Shapes/Grid.js'
import { ItemFlags } from './BaseItem.js'
import { GeomItem } from './GeomItem.js'
import { resourceLoader } from './ResourceLoader.js'
import { SceneSettings } from './SceneSettings.js'
import { VLAAsset } from './VLAAsset.js'

const defaultGridColor = new Color('#DCDCDC')

/** Class representing a scene in a scene tree. */
class Scene {
  /**
   * Create a scene.
   * @param {any} resources - The resources value.
   */
  constructor(resources) {
    if (resources) {
      resourceLoader.setResources(resources)
    }
    this.settings = new SceneSettings('Scene Settings')
    this.root = new TreeItem('root')
    this.root.addChild(this.settings)

    // Common resources are used by systems such at the renderer and VR controllers.
    // Any asset that will probably be used my multiple differeint independent objects
    // should be loaded here. (For now, it is being used to load VR Controller assets.)
    this.__commonResources = {}
  }

  /**
   * The getRoot method.
   * @return {any} - The return value.
   */
  getSettings() {
    return this.settings
  }

  /**
   * The getRoot method.
   * @return {any} - The return value.
   */
  getRoot() {
    return this.root
  }

  /**
   * The getResourceLoader method.
   * @return {any} - The return value.
   */
  getResourceLoader() {
    return resourceLoader
  }

  /**
   * The setEnvMap method.
   * @param {any} envMap - The envMap value.
   */
  setEnvMap(envMap) {
    console.warn(
      'Deprecated Function. Please access the Scene Settings object.'
    )
    this.settings.getParameter('EnvMap').setValue(envMap)
  }

  /**
   * The addAsset method.
   * @param {any} asset - The asset value.
   */
  addAsset(asset) {
    console.warn('Deprecated Function. Please access the Scene Root object.')
    this.root.addChild(asset, false)
  }
  /**
   * Set up the scene grid.
   * @param {number} gridSize - The size of the grid.
   * @param {number} resolution - The resolution of the grid.
   * @param {Color} gridColor - The color of the grid.
   * @return {any} - The return value.
   */
  setupGrid(gridSize = 5, resolution = 50, gridColor = defaultGridColor) {
    const gridTreeItem = new TreeItem('Grid')
    const gridMaterial = new Material('gridMaterial', 'LinesShader')
    gridMaterial.getParameter('Color').setValue(gridColor)
    const grid = new Grid(gridSize, gridSize, resolution, resolution, true)
    gridTreeItem.addChild(new GeomItem('GridItem', grid, gridMaterial), false)
    const axisLine = new Lines()
    axisLine.setNumVertices(2)
    axisLine.setNumSegments(1)
    axisLine.setSegment(0, 0, 1)
    axisLine.getVertex(0).set(gridSize * -0.5, 0.0, 0.0)
    axisLine.getVertex(1).set(gridSize * 0.5, 0.0, 0.0)
    const gridXAxisMaterial = new Material('gridXAxisMaterial', 'LinesShader')
    gridXAxisMaterial
      .getParameter('Color')
      .setValue(new Color(gridColor.luminance(), 0, 0))
    gridTreeItem.addChild(
      new GeomItem('xAxisLine', axisLine, gridXAxisMaterial),
      false
    )
    const gridZAxisMaterial = new Material('gridZAxisMaterial', 'LinesShader')
    gridZAxisMaterial
      .getParameter('Color')
      .setValue(new Color(0, gridColor.luminance(), 0))
    const geomOffset = new Xfo()
    geomOffset.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)
    const zAxisLineItem = new GeomItem('yAxisLine', axisLine, gridZAxisMaterial)
    zAxisLineItem.setGeomOffsetXfo(geomOffset)
    gridTreeItem.addChild(zAxisLineItem, false)
    gridTreeItem.setSelectable(false, true)
    gridTreeItem.setFlag(ItemFlags.IGNORE_BBOX)

    // Avoid persisting the grid and hide in the tree view.
    gridTreeItem.clearFlag(ItemFlags.USER_EDITED)
    gridTreeItem.setFlag(ItemFlags.INVISIBLE)
    this.root.addChild(gridTreeItem, false)

    return gridTreeItem
  }
  
  /**
   * The loadCommonAssetResource method.
   * @param {any} resourceId - The resourceId value.
   * @return {any} - The return value.
   */
  loadCommonAssetResource(resourceId) {
    if (resourceId in this.__commonResources) {
      return this.__commonResources[resourceId]
    }
    const asset = new VLAAsset()
    asset.getParameter('DataFilePath').setValue(resourceId)
    this.__commonResources[resourceId] = asset
    return asset
  }


  // /////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context = {}, flags = 0) {
    context.makeRelative = path => path
    const json = {
      root: this.root.toJSON(context, flags),
    }
    return json
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context = {}) {
    const plcbs = [] // Post load callbacks.
    context.resolvePath = (path, cb) => {
      // Note: Why not return a Promise here?
      // Promise evaluation is always async, so
      // all promisses will be resolved after the current call stack
      // has terminated. In our case, we want all paths
      // to be resolved before the end of the function, which
      // we can handle easily with callback functions.
      if (!path) throw new Error('Path not spcecified')
      const item = this.root.resolvePath(path)
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
    context.settings = this.settings

    if (json.root) {
      this.root.fromJSON(json.root, context)
    }

    // Invoke all the post-load callbacks to resolve any
    // remaning references.
    for (const cb of plcbs) cb()
  }
}

export { Scene }
