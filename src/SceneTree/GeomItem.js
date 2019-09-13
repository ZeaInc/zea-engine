import { Vec2, Xfo } from '../Math';
import {
  Parameter,
  BooleanParameter,
  NumberParameter,
  ColorParameter,
  Vec2Parameter,
  XfoParameter,
} from './Parameters';

import { MaterialParameter } from './Parameters/MaterialParameter';
import { GeometryParameter } from './Parameters/GeometryParameter';
import { Signal } from '../Utilities';
import { sgFactory } from './SGFactory.js';

import {
  LOADFLAGS_SKIP_MATERIALS,
  LOADFLAGS_SKIP_GEOMETRIES,
} from './TreeItem.js';

import { BaseGeomItem } from './BaseGeomItem.js';

class GeomItem extends BaseGeomItem {
  constructor(name, geom = undefined, material = undefined) {
    super(name);

    this.__geomParam = this.insertParameter(
      new GeometryParameter('geometry'),
      0
    );
    this.__geomParam.valueChanged.connect(this._setBoundingBoxDirty.bind(this));
    this.__geomParam.boundingBoxDirtied.connect(
      this._setBoundingBoxDirty.bind(this)
    );
    this.__materialParam = this.insertParameter(
      new MaterialParameter('material'),
      1
    );

    this.__lightmapCoordOffset = new Vec2();
    this.__geomOffsetXfoParam = this.addParameter(
      new XfoParameter('geomOffsetXfo')
    );
    this.__geomXfoParam = this.addParameter(new XfoParameter('geomXfo'));

    this.__cleanGeomXfo = this.__cleanGeomXfo.bind(this);
    this.__globalXfoParam.valueChanged.connect(mode => {
      this.__geomXfoParam.setDirty(this.__cleanGeomXfo);
    });
    this.__geomOffsetXfoParam.valueChanged.connect(mode => {
      this.__geomXfoParam.setDirty(this.__cleanGeomXfo);
    });

    this.geomXfoChanged = this.__geomXfoParam.valueChanged;
    this.materialAssigned = this.__materialParam.valueChanged;
    this.geomAssigned = this.__geomParam.valueChanged;

    if (geom) this.setGeometry(geom);
    if (material) this.setMaterial(material);
  }

  __cleanGeomXfo() {
    return this.__globalXfoParam
      .getValue()
      .multiply(this.__geomOffsetXfoParam.getValue());
  }

  destroy() {
    super.destroy();
  }

  clone(flags) {
    const cloned = new GeomItem();
    cloned.copyFrom(this, flags);
    return cloned;
  }

  copyFrom(src, flags) {
    super.copyFrom(src, flags);
    this.__lightmapCoordOffset = src.__lightmapCoordOffset;
    // Geom Xfo should be dirty after cloning.
    // Note: this might not be necessary. It should
    // always be dirty after cloning.
    this.__geomXfoParam.setDirty(this.__cleanGeomXfo);
  }

  // ////////////////////////////////////////
  // Geometry

  getGeometry() {
    return this.__geomParam.getValue();
  }

  setGeometry(geom, mode) {
    this.__geomParam.setValue(geom, mode);
  }

  getGeom() {
    console.warn("getGeom is deprectated. Please use 'getGeometry'");
    return this.getGeometry();
  }

  setGeom(geom) {
    console.warn("setGeom is deprectated. Please use 'setGeometry'");
    return this.setGeometry(geom);
  }

  getMaterial() {
    return this.__materialParam.getValue();
  }

  setMaterial(material, mode) {
    this.__materialParam.setValue(material, mode);
  }

  _cleanBoundingBox(bbox) {
    bbox = super._cleanBoundingBox(bbox);
    const geom = this.getGeometry();
    if (geom) {
      bbox.addBox3(geom.boundingBox, this.getGeomXfo());
    }
    return bbox;
  }

  // ////////////////////////////////////////
  // Xfos

  getGeomOffsetXfo() {
    return this.__geomOffsetXfoParam.getValue();
  }

  setGeomOffsetXfo(xfo) {
    this.__geomOffsetXfoParam.setValue(xfo);
  }

  getGeomXfo() {
    return this.__geomXfoParam.getValue();
  }

  // ///////////////////////////
  // Lightmaps

  getLightmapName() {
    return this.__lightmapName;
  }

  getLightmapCoordsOffset() {
    return this.__lightmapCoordOffset;
  }

  // The root asset item pushes its offset to the geom items in the
  // tree. This offsets the light cooords for each geom.
  applyAssetLightmapSettings(lightmapName, offset) {
    this.__lightmap = lightmapName;
    this.__lightmapCoordOffset.addInPlace(offset);
  }

  // ///////////////////////////
  // Debugging

  toJSON(context, flags) {
    const json = super.toJSON(context, flags);
    return json;
  }

  fromJSON(json, context) {
    super.fromJSON(json, context);
    context.numGeomItems++;
  }

  readBinary(reader, context) {
    super.readBinary(reader, context);

    context.numGeomItems++;

    this.__lightmapName = context.assetItem.getName();

    const itemflags = reader.loadUInt8();
    const geomIndex = reader.loadUInt32();
    const geomLibrary = context.assetItem.getGeometryLibrary();
    const geom = geomLibrary.getGeom(geomIndex);
    if (geom) {
      this.setGeometry(geom);
    } else {
      const onGeomLoaded = range => {
        if (geomIndex >= range[0] && geomIndex < range[1]) {
          const geom = geomLibrary.getGeom(geomIndex);
          if (geom) this.setGeometry(geom);
          else console.warn('Geom not loaded:', this.getName());
          geomLibrary.rangeLoaded.disconnectId(connid);
        }
      };
      const connid = geomLibrary.rangeLoaded.connect(onGeomLoaded);
    }

    // this.setVisibility(j.visibility);
    // Note: to save space, some values are skipped if they are identity values
    const geomOffsetXfoFlag = 1 << 2;
    if (itemflags & geomOffsetXfoFlag) {
      this.__geomOffsetXfoParam.setValue(
        new Xfo(
          reader.loadFloat32Vec3(),
          reader.loadFloat32Quat(),
          reader.loadFloat32Vec3()
        )
      );
    }

    // BaseGeomItem now handles loading materials.
    if (context.version < 4) {
      const materialFlag = 1 << 3;
      if (itemflags & materialFlag) {
        const materialLibrary = context.assetItem.getMaterialLibrary();
        const materialName = reader.loadStr();
        let material = materialLibrary.getMaterial(materialName);
        if (!material) {
          console.warn(
            "Geom :'" + this.name + "' Material not found:" + materialName
          );
          material = materialLibrary.getMaterial('Default');
        }
        this.setMaterial(material);
      } else {
        // Force nodes to have a material so we can see them.
        this.setMaterial(
          context.assetItem.getMaterialLibrary().getMaterial('Default')
        );
      }
    }

    this.__lightmapCoordOffset = reader.loadFloat32Vec2();
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}

sgFactory.registerClass('GeomItem', GeomItem);

export { GeomItem };
