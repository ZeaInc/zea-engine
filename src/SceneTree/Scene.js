import { Color } from '../Math/index'
import { TreeItem } from './TreeItem.js'
import { resourceLoader } from './ResourceLoader.js'
import { DriveAdapter } from './ResourceLoader/DriveAdapter.js'
import { SceneSettings } from './SceneSettings.js'
import { VLAAsset } from './VLAAsset.js'
import GridTreeItem from './GridTreeItem'

const defaultGridColor = new Color('#DCDCDC')

/**
 * Class representing the environment where all the displayed assets live.
 */
class Scene {
  /**
   * Create a scene.
   * @param {object} resources - The resources value.
   */
  constructor(resources) {
    if (resources) {
      resourceLoader.setAdapter(new DriveAdapter(resources))
    }
    this.settings = new SceneSettings('Scene Settings')
    this.root = new TreeItem('root')
    this.root.addChild(this.settings)
  }

  /**
   * The getRoot method.
   * @return {BaseItem} - The return value.
   */
  getSettings() {
    return this.settings
  }

  /**
   * Returns the scene's root item(`TreeItem`) that owns every item in the scene.
   *
   * @return {TreeItem} - The return value.
   */
  getRoot() {
    return this.root
  }

  /**
   * Returns resourceLoader object set on class initialization.
   *
   * @return {ResourceLoader} - The return value.
   */
  getResourceLoader() {
    return resourceLoader
  }

  /**
   * Sets Environment Map with the BaseImage you'd like to display in your scene background.
   *
   * @deprecated
   * @param {EnvMap} envMap - The envMap value.
   */
  setEnvMap(envMap) {
    console.warn('Deprecated Function. Please access the Scene Settings object.')
    this.settings.getParameter('EnvMap').setValue(envMap)
  }

  /**
   * Adds a child item to the scene root item.
   *
   * @deprecated
   * @param {AssetItem} asset - The asset value.
   */
  addAsset(asset) {
    console.warn('Deprecated Function. Please access the Scene Root object.')
    this.root.addChild(asset, false)
  }

  /**
   * Sets up and displays the scene grid of a given size and resolution. The Grid is oriented on the XY plane
   * and highlights the X and Y axes with Red and Green lines. Grids are useful in displaying scene scale and coordinate system.
   * The Grid geometry does not return a bounding box and so does not effect the bounding of the scene.
   * The GridTreeItem display a grid of a given size and resolution. The Grid is oriented on the XY plane
   * and highlights the X and Y axes with Red and Green lines.
   *
   * @param {number} gridSize - The size of the grid.
   * @param {number} resolution - The resolution of the grid.
   * @param {Color} gridColor - The color of the grid.
   * @return {GridTreeItem} - The return value.
   */
  setupGrid(gridSize = 5, resolution = 50, gridColor = defaultGridColor) {
    const gridTreeItem = new GridTreeItem(gridSize, resolution, gridColor)
    this.root.addChild(gridTreeItem, false)
    return gridTreeItem
  }

  // /////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context = {}) {
    context.makeRelative = (path) => path
    const json = {
      root: this.root.toJSON(context),
    }
    return json
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
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
    context.addPLCB = (plcb) => plcbs.push(plcb)
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
