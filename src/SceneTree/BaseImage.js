import { Vec4 } from '../Math';
import { Signal } from '../Utilities';
import { BaseItem } from './BaseItem.js';

import {
  Parameter,
  BooleanParameter,
  NumberParameter,
  ParameterSet,
} from './Parameters';

class BaseImage extends BaseItem {
  constructor(name, params = {}) {
    super(name);
    this.width = 0;
    this.height = 0;
    this.format = 'RGB';
    this.type = 'UNSIGNED_BYTE';

    this.addParameter(new BooleanParameter('AlphaFromLuminance', false));
    this.addParameter(new BooleanParameter('Invert', false));
    this.addParameter(new BooleanParameter('FlipY', false));

    this.updated = this.parameterValueChanged;

    // Note: many parts of the code assume a 'loaded' signal.
    // We should probably deprecate and use only 'updated'.
    // Instead we should start using a loaded Promise.
    this.loaded = new Signal(true);
  }

  isLoaded() {
    return true;
  }

  getMapping() {
    return this.__mapping;
  }

  setMapping(mapping) {
    this.__mapping = mapping;
  }

  isStream() {
    return false;
  }

  isStreamAtlas() {
    return this.__streamAtlas;
  }

  getParams() {
    return {
      type: this.type,
      format: this.format,
      width: this.width,
      height: this.height,
      flipY: this.getParameter('FlipY').getValue(),
      invert: this.getParameter('Invert').getValue(),
      alphaFromLuminance: this.getParameter('AlphaFromLuminance').getValue(),
    };
  }
}

export { BaseImage };
