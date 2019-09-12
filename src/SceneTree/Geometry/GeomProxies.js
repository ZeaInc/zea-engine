import { Signal } from '../../Utilities';
import { Box3 } from '../../Math';
import { RefCounted } from '../RefCounted.js';

class BaseProxy extends RefCounted {
  constructor(data) {
    super();
    this.name = data.name;
    this.__buffers = data.geomBuffers;
    this.boundingBox = new Box3();
    this.boundingBox.p0.__data = data.bbox.p0.__data;
    this.boundingBox.p1.__data = data.bbox.p1.__data;

    this.__metaData = new Map();

    this.boundingBoxDirtied = new Signal();
    this.geomDataChanged = new Signal();
    this.geomDataTopologyChanged = new Signal();
  }

  genBuffers() {
    return this.__buffers;
  }

  freeBuffers() {
    // Note: Explicitly transfer data to a web worker and then
    // terminate the worker. (hacky way to free TypedArray memory explicitly)
    const freeData = { attrBuffers: {} };
    const transferables = [];
    if (this.__buffers.indices) {
      transferables.push(this.__buffers.indices.buffer);
      freeData.indices = this.__buffers.indices;
      delete this.__buffers.indices;
    }
    if (this.__buffers.attrBuffers) {
      for (const attrName in this.__buffers.attrBuffers) {
        const attrData = this.__buffers.attrBuffers[attrName];
        freeData.attrBuffers[attrName] = this.__buffers.attrBuffers[attrName];
        transferables.push(attrData.values.buffer);
        delete this.__buffers.attrBuffers[attrName];
      }
      delete this.__buffers.attrBuffers;
    }
  }

  // ////////////////////////////////////////
  // Metadata

  getMetadata(key) {
    return this.__metaData.get(key);
  }

  hasMetadata(key) {
    return this.__metaData.has(key);
  }

  setMetadata(key, metaData) {
    this.__metaData.set(key, metaData);
  }
}

class PointsProxy extends BaseProxy {
  constructor(data) {
    super(data);
  }
}

class LinesProxy extends BaseProxy {
  constructor(data) {
    super(data);
  }
}

class MeshProxy extends BaseProxy {
  constructor(data) {
    super(data);
  }
}

export { PointsProxy, LinesProxy, MeshProxy };
