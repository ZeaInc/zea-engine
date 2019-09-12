import { SystemDesc } from '../BrowserDetection.js';
import { Vec3, Xfo, Color, JSON_stringify_fixedPrecision } from '../Math';
import { Signal } from '../Utilities';
import { Material } from './Material.js';
import { TreeItem } from './TreeItem.js';
import { Camera } from './Camera.js';
import { Lines } from './Geometry/Lines.js';
import { Grid } from './Geometry/Shapes/Grid.js';
import { VLAAsset } from './VLAAsset.js';
import { ItemFlags } from './BaseItem.js';
import { GeomItem } from './GeomItem.js';
import { resourceLoader } from './ResourceLoader.js';
import { EnvMap, Lightmap, LightmapMixer } from './Images';

const defaultGridColor = new Color('#DCDCDC');

class Scene {
  constructor(resources) {
    if (resources) {
      resourceLoader.setResources(resources);
    }

    this.cameras = [];
    this.__root = new TreeItem('root');
    this.__root.addRef(this);
    this.__root.addChild(new Camera('Camera'));

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
    // should be loaded here. (For now, it is being used to laod VR Controller assets.)
    this.__commonResources = {};

    // ///////////////////////////

    this.backgroundMapChanged = new Signal();
    this.envMapChanged = new Signal();
    this.lightmapAdded = new Signal();
    this.assetAdded = new Signal();
    this.assetRemoved = new Signal();
  }

  getRoot() {
    return this.__root;
  }

  getResourceLoader() {
    return resourceLoader;
  }

  loadCommonAssetResource(resourceId) {
    if (resourceId in this.__commonResources) {
      return this.__commonResources[resourceId];
    }
    const asset = new VLAAsset();
    asset.getParameter('DataFilePath').setValue(resourceId);
    this.__commonResources[resourceId] = asset;
    return asset;
  }

  getEnvMapLOD() {
    return this.__envmapLOD;
  }

  setEnvMapLOD(lod) {
    this.__envmapLOD = lod;
  }

  getEnvMap() {
    return this.__envMap;
  }

  setEnvMapName(envMapName) {
    if (envMapName.endsWith('.vlh'))
      envMapName = envMapName.splice(0, (envMapName.length = 4));
    const envMap = new EnvMap(
      envMapName + this.__envmapLOD + '.vlh',
      resourceLoader
    );
    this.setEnvMap(envMap);
  }

  setEnvMap(envMap) {
    this.__envMap = envMap;
    this.envMapChanged.emit(this.__envMap);
  }

  getBackgroundMap() {
    return this.__backgroundMap;
  }

  setBackgroundMap(backgroundMap) {
    this.__backgroundMap = backgroundMap;
    this.backgroundMapChanged.emit(this.__backgroundMap);
  }

  getCamera(index = 0) {
    return this.cameras[index];
  }

  // ////////////////////////////////
  // Paths
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

  getLightMapLOD() {
    return this.__lightmapLOD;
  }

  setLightMapLOD(lod) {
    this.__lightmapLOD = lod;
  }

  getLightMap(name) {
    return this.__lightmaps[name];
  }

  setLightMap(name, lightmap) {
    if (!(lightmap instanceof Lightmap || lightmap instanceof LightmapMixer)) {
      throw 'Object passed is not a Lightmap:' + lightmap.constructor.name;
    }
    this.__lightmaps[name] = lightmap;
    this.lightmapAdded.emit(name, lightmap);
  }

  getLightMaps() {
    return this.__lightmaps;
  }

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

  getAssets() {
    return this.__assets;
  }

  // /////////////////////////////////////
  // Default Scene Items

  getCamera() {
    return this.__root.getChildByName('Camera');
  }

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

  fromJSON(json, context) {
    if (j.envMap) {
      const envMap = new EnvMap('envMap', resourceLoader);
      envMap.fromJSON(j.envMap);
      this.setEnvMap(envMap);
    }
  }

  toJSON(context, flags) {
    return {
      root: this.__root.toJSON(context, flags),
      boundingBox: this.boundingBox.toJSON(context, flags),
    };
  }

  toString() {
    return JSON_stringify_fixedPrecision(this.toJSON(), 2);
  }
}

export { Scene };
