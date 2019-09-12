import { SystemDesc } from '../../BrowserDetection.js';
import { Async, Signal } from '../../Utilities';
import { BaseImage } from '../BaseImage.js';
import { FileImage } from './FileImage.js';

class HDRImageMixer extends BaseImage {
  constructor(name, stream = true) {
    super({
      type: 'FLOAT',
      format: 'RGB',
      filter: SystemDesc.isMobileDevice ? 'NEAREST' : 'LINEAR',
    });

    this.__name = name;
    this.__stream = stream;
    this.__loaded = false;
    this.__subImages = [];
    this.__weights = [];

    this.loaded = new Signal();
    this.updated = new Signal();
    this.weightsChanged = new Signal();
  }

  isLoaded() {
    return this.__loaded;
  }

  isStream() {
    return this.__stream;
  }

  setURLs(urls) {
    const async = new Async();
    async.incAsyncCount(urls.length);
    async.ready.connect(() => {
      if (!this.__loaded) {
        this.__loaded = true;
        this.loaded.emit();
      } else {
        this.updated.emit();
      }
    }, this);
    for (const fileUrl of urls) {
      const subImage = new FileImage(undefined, fileUrl);
      subImage.loaded.connect(async.decAsyncCount);
      subImage.updated.connect(this.updated.emit);
      this.__subImages.push(subImage);
      this.__weights.push(1.0);
    }
  }

  setURL(index, url) {
    this.__subImages[index].loadUrl(url);
  }

  setWeights(weights) {
    this.__weights = weights;
    if (this.__loaded) {
      this.weightsChanged.emit(this.__weights);
    }
  }

  setWeight(index, weight) {
    this.__weights[index] = weight;
    if (this.__loaded) {
      this.weightsChanged.emit(this.__weights);
    }
  }

  getParams() {
    const params = super.getParams();
    if (this.__loaded) {
      params.subImages = this.__subImages;
      params.weights = this.__weights;
    }
    return params;
  }

  fromJSON(json, context, flags) {}

  toJSON(context, flags) {}
}

export { HDRImageMixer };
// export default HDRImageMixer;
