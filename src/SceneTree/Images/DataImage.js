import { Async, Signal } from '../../Utilities';
import { sgFactory } from '../SGFactory.js';
import { BaseImage } from '../BaseImage.js';

// let ResourceLoaderWorker = require("worker-loader?inline!./ResourceLoaderWorker.js");

class DataImage extends BaseImage {
  constructor(name) {
    super();

    if (name == undefined) name = this.constructor.name;
    this.__name = name;
    this.format = 'RGBA';
    this.type = 'UNSIGNED_BYTE';
    this.__loaded = false;

    // this.__data = new Uint8Array(4);
    this.width = 1;
    this.height = 1;
  }

  isLoaded() {
    return this.__loaded;
  }

  getName() {
    return this.__name;
  }

  isStream() {
    return false;
  }

  setData(width, height, data) {
    this.width = width;
    this.height = height;
    this.__data = data;
    if (!this.__loaded) {
      this.__loaded = true;
      this.loaded.emit();
    } else this.updated.emit();
  }

  getParams() {
    const params = super.getParams();
    params['data'] = this.__data;
    return params;
  }
}

sgFactory.registerClass('DataImage2D', DataImage);
sgFactory.registerClass('DataImage', DataImage);

export { DataImage };
