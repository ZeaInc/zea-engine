import { Color } from '../Math/Color.js';
import { Signal } from '../Utilities';
import { TreeItem } from './TreeItem';
import { Material } from './Material';
import { ValueSetMode } from './Parameters';

class BaseGeomItem extends TreeItem {
  constructor(name) {
    super(name);
    this.__cutAway = false;
    this.__cutAwayVector = false;
    this.__cutAwayDist = false;
    this.cutAwayChanged = new Signal();

    this.__layers = [];
  }

  addLayer(name) {
    // TODO: need to find the layer and add this item to it.
    this.__layers.push(name);
  }

  getLayers() {
    return this.__layers;
  }

  // ////////////////////////////////////////
  // Cutaways

  isCutawayEnabled() {
    return this.__cutAway;
  }

  setCutawayEnabled(state) {
    this.__cutAway = state;
    this.cutAwayChanged.emit();
  }

  getCutVector(cutAwayVector) {
    return this.__cutAwayVector;
  }

  setCutVector(cutAwayVector) {
    this.__cutAwayVector = cutAwayVector;
    this.cutAwayChanged.emit();
  }

  getCutDist(cutAwayDist) {
    return this.__cutAwayDist;
  }

  setCutDist(cutAwayDist) {
    this.__cutAwayDist = cutAwayDist;
    this.cutAwayChanged.emit();
  }

  // ///////////////////////////
  // Persistence

  readBinary(reader, context) {
    super.readBinary(reader, context);

    if (context.version >= 4) {
      const materialName = reader.loadStr();
      // const materialName = 'Material' + this.__bodyDescId;

      const materialLibrary = context.assetItem.getMaterialLibrary();
      let material = materialLibrary.getMaterial(materialName, false);
      if (!material) {
        // console.warn("BaseGeomItem :'" + this.name + "' Material not found:" + materialName);
        // material = materialLibrary.getMaterial('DefaultMaterial');

        material = new Material(materialName, 'SimpleSurfaceShader');
        material
          .getParameter('BaseColor')
          .setValue(Color.random(0.25), ValueSetMode.DATA_LOAD);
        context.assetItem.getMaterialLibrary().addMaterial(material);
      }
      this.setMaterial(material, ValueSetMode.DATA_LOAD);

      this.__layers = reader.loadStrArray();
      if (this.__layers.length > 0) {
        // console.log("Layers:", this.__layers)
        for (const layer of this.__layers) context.addGeomToLayer(this, layer);
      }
    }
  }
}

export { BaseGeomItem };
