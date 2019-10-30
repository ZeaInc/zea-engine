import { SystemDesc } from '../BrowserDetection.js';
import { Vec3, Xfo, Color, JSON_stringify_fixedPrecision } from '../Math';
import { Signal } from '../Utilities';
import { Material } from './Material.js';
import { TreeItem } from './TreeItem.js';
import { Lines } from './Geometry/Lines.js';
import { Grid } from './Geometry/Shapes/Grid.js';
import { VLAAsset } from './VLAAsset.js';
import { ItemFlags } from './BaseItem.js';
import { GeomItem } from './GeomItem.js';
import { resourceLoader } from './ResourceLoader.js';
import { EnvMap, Lightmap, LightmapMixer } from './Images';
import { RendererParams } from './RendererParams.js';

const defaultGridColor = new Color('#DCDCDC');

/** Class representing a scene in a scene tree. */
class Scene {
  /**
   * Create a scene.
   * @param {any} resources - The resources value.
   */
  constructor(resources) {
    if (resources) {
      resourceLoader.setResources(resources);
    }

    this.cameras = [];
    this.__root = new TreeItem('root');
    this.__root.addRef(this);
    this.__root.addChild(new RendererParams('Renderer Params'));

    this.__assets = [];

    // Env map used for background and reflections.
    this.__envMap = undefined;
    // Background map used only for backgrounds. Overrides env map.
    this.__backgroundMap = undefined;
    this.__lightmaps = {};

    if (SystemDesc.isMobileDevice || SystemDesc.browserName != 'Chrome')
      this.__lightmapLOD = 2;
    else this.__lightmapLOD = 0;
    this.__envmapLOD = this.__lightmapLOD;

    // Common resources are used by systems such at the renderer and VR controllers.
    // Any asset that will probably be used my multiple differeint independent objects
    // should be loaded here. (For now, it is being used to load VR Controller assets.)
    this.__commonResources = {};

    // ///////////////////////////

    this.backgroundMapChanged = new Signal();
    this.envMapChanged = new Signal();
    this.lightmapAdded = new Signal();
    this.assetAdded = new Signal();
    this.assetRemoved = new Signal();
  }

  /**
   * The getRoot method.
   * @return {any} - The return value.
   */
  getRoot() {
    return this.__root;
  }

  /**
   * The getResourceLoader method.
   * @return {any} - The return value.
   */
  getResourceLoader() {
    return resourceLoader;
  }

  /**
   * The loadCommonAssetResource method.
   * @param {any} resourceId - The resourceId value.
   * @return {any} - The return value.
   */
  loadCommonAssetResource(resourceId) {
    if (resourceId in this.__commonResources) {
      return this.__commonResources[resourceId];
    }
    const asset = new VLAAsset();
    asset.getParameter('DataFilePath').setValue(resourceId);
    this.__commonResources[resourceId] = asset;
    return asset;
  }

  /**
   * The getEnvMapLOD method.
   * @return {any} - The return value.
   */
  getEnvMapLOD() {
    return this.__envmapLOD;
  }

  /**
   * The setEnvMapLOD method.
   * @param {any} lod - The lod value.
   */
  setEnvMapLOD(lod) {
    this.__envmapLOD = lod;
  }

  /**
   * The getEnvMapLOD method.
   * @return {any} - The return value.
   */
  getEnvMap() {
    return this.__envMap;
  }

  /**
   * Setter for the environment map name.
   * @param {string} envMapName - The enironment map name.
   */
  setEnvMapName(envMapName) {
    if (envMapName.endsWith('.vlh'))
      envMapName = envMapName.splice(0, (envMapName.length = 4));
    const envMap = new EnvMap(
      envMapName + this.__envmapLOD + '.vlh',
      resourceLoader
    );
    this.setEnvMap(envMap);
  }

  /**
   * Setter for the environment map.
   * @param {EnvMap} envMap - The environment map.
   */
  setEnvMap(envMap) {
    this.__envMap = envMap;
    this.envMapChanged.emit(this.__envMap);
  }

  /**
   * The getBackgroundMap method.
   * @return {any} - The return value.
   */
  getBackgroundMap() {
    return this.__backgroundMap;
  }

  /**
   * The setBackgroundMap method.
   * @param {any} backgroundMap - The backgroundMap value.
   */
  setBackgroundMap(backgroundMap) {
    this.__backgroundMap = backgroundMap;
    this.backgroundMapChanged.emit(this.__backgroundMap);
  }

  /**
   * The getCamera method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getCamera(index = 0) {
    return this.cameras[index];
  }

  // ////////////////////////////////
  // Paths

  /**
   * The resolvePath method.
   * @param {any} path - The path value.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  resolvePath(path, index = 0) {
    if (typeof path == 'string') path = path.split('/');

    if (path[index] == '.') index++;

    if (path[index] == 'root') {
      return this.__root.resolvePath(path, index + 1);
    } else if (path[index] == 'selectionSets') {
      return this.__root.resolvePath(path, index + 1);
    }
  }

  // ////////////////////////////////
  // Lightmaps

  /**
   * The getLightMapLOD method.
   * @return {any} - The return value.
   */
  getLightMapLOD() {
    return this.__lightmapLOD;
  }

  /**
   * The setLightMapLOD method.
   * @param {any} lod - The lod value.
   */
  setLightMapLOD(lod) {
    this.__lightmapLOD = lod;
  }

  /**
   * The getLightMap method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  getLightMap(name) {
    return this.__lightmaps[name];
  }

  /**
   * The setLightMap method.
   * @param {string} name - The name value.
   * @param {any} lightmap - The lightmap value.
   */
  setLightMap(name, lightmap) {
    if (!(lightmap instanceof Lightmap || lightmap instanceof LightmapMixer)) {
      throw new Error(
        'Object passed is not a Lightmap:' + lightmap.constructor.name
      );
    }
    this.__lightmaps[name] = lightmap;
    this.lightmapAdded.emit(name, lightmap);
  }

  /**
   * The getLightMaps method.
   * @return {any} - The return value.
   */
  getLightMaps() {
    return this.__lightmaps;
  }

  /**
   * The addAsset method.
   * @param {any} asset - The asset value.
   */
  addAsset(asset) {
    asset.loaded.connect(() => {
      if (this.__envMap && asset.getLightmapPath) {
        const lightmapPath = asset.getLightmapPath(
          this.__envMap.getName(),
          this.__lightmapLOD
        );
        console.log('lightmapPath:' + lightmapPath);
        const lightmapName = asset.getName();
        if (
          !this.getLightMap(lightmapName) &&
          resourceLoader.resolveFilepath(lightmapPath)
        ) {
          const lightmap = new Lightmap(lightmapPath, asset);
          this.setLightMap(lightmapName, lightmap);
        }
      }
    });
    this.__assets.push(asset);
    this.__root.addChild(asset);
    this.assetAdded.emit(asset);
  }

  /**
   * The getAssets method.
   * @return {any} - The return value.
   */
  getAssets() {
    return this.__assets;
  }

  // /////////////////////////////////////
  // Default Scene Items

  /**
   * The getCamera method.
   * @return {any} - The return value.
   */
  getCamera() {
    return this.__root.getChildByName('Camera');
  }

  /**
   * Set up the scene grid.
   * @param {number} gridSize - The size of the grid.
   * @param {number} resolution - The resolution of the grid.
   * @param {Color} gridColor - The color of the grid.
   * @return {any} - The return value.
   */
  setupGrid(gridSize = 5, resolution = 50, gridColor = defaultGridColor) {
    const gridTreeItem = new TreeItem('Grid');
    const gridMaterial = new Material('gridMaterial', 'LinesShader');
    gridMaterial.getParameter('Color').setValue(gridColor);
    const grid = new Grid(gridSize, gridSize, resolution, resolution, true);
    gridTreeItem.addChild(new GeomItem('GridItem', grid, gridMaterial));
    const axisLine = new Lines();
    axisLine.setNumVertices(2);
    axisLine.setNumSegments(1);
    axisLine.setSegment(0, 0, 1);
    axisLine.getVertex(0).set(gridSize * -0.5, 0.0, 0.0);
    axisLine.getVertex(1).set(gridSize * 0.5, 0.0, 0.0);
    const gridXAxisMaterial = new Material('gridXAxisMaterial', 'LinesShader');
    gridXAxisMaterial
      .getParameter('Color')
      .setValue(new Color(gridColor.luminance(), 0, 0));
    gridTreeItem.addChild(
      new GeomItem('xAxisLine', axisLine, gridXAxisMaterial)
    );
    const gridZAxisMaterial = new Material('gridZAxisMaterial', 'LinesShader');
    gridZAxisMaterial
      .getParameter('Color')
      .setValue(new Color(0, gridColor.luminance(), 0));
    const geomOffset = new Xfo();
    geomOffset.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5);
    const zAxisLineItem = new GeomItem(
      'yAxisLine',
      axisLine,
      gridZAxisMaterial
    );
    zAxisLineItem.setGeomOffsetXfo(geomOffset);
    gridTreeItem.addChild(zAxisLineItem);
    gridTreeItem.setSelectable(false, true);
    gridTreeItem.setFlag(ItemFlags.IGNORE_BBOX);
    this.__root.addChild(gridTreeItem);

    return gridTreeItem;
  }

  // /////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return {
      root: this.__root.toJSON(context, flags),
      boundingBox: this.boundingBox.toJSON(context, flags),
    };
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context) {
    if (j.envMap) {
      const envMap = new EnvMap('envMap', resourceLoader);
      envMap.fromJSON(j.envMap);
      this.setEnvMap(envMap);
    }
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON_stringify_fixedPrecision(this.toJSON(), 2);
  }
}

export { Scene };
