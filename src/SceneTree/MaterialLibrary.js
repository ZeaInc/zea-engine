import { SystemDesc } from '../BrowserDetection.js';
import { Signal } from '../Utilities';
import { sgFactory } from './SGFactory.js';
import { Material } from './Material.js';
import { FileImage } from './Images';

class MaterialLibrary {
  constructor(name = 'MaterialLibrary') {
    this.__name = name;

    this.lod = 0;
    if (SystemDesc.isMobileDevice) this.lod = 1;
    this.loaded = new Signal();

    this.clear();
  }

  clear() {
    this.__images = {};
    this.__materials = {
      Default: new Material('Default', 'SimpleSurfaceShader'),
    };
  }

  getPath() {
    return [this.__name];
  }

  getNumMaterials() {
    return Object.keys(this.__materials).length;
  }

  getMaterials() {
    return Object.values(this.__materials);
  }

  getMaterialNames() {
    const names = [];
    for (const name in this.__materials) {
      names.push(name);
    }
    return names;
  }

  hasMaterial(name) {
    return name in this.__materials;
  }

  addMaterial(material) {
    material.setOwner(this);
    this.__materials[material.getName()] = material;
  }

  getMaterial(name, assert = true) {
    const res = this.__materials[name];
    if (!res && assert) {
      throw 'Material:' +
        name +
        ' not found in library:' +
        this.getMaterialNames();
    }
    return res;
  }

  hasImage(name) {
    return name in this.__images;
  }

  addImage(image) {
    image.setOwner(this);
    this.__images[image.getName()] = image;
  }

  getImage(name, assert = true) {
    const res = this.__images[name];
    if (!res && assert) {
      throw 'Image:' + name + ' not found in library:' + this.getImageNames();
    }
    return res;
  }

  getImageNames() {
    const names = [];
    for (const name in this.__images) {
      names.push(name);
    }
    return names;
  }

  // ////////////////////////////////////////
  // Persistence

  load(filePath) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, true);
    xhr.ontimeout = () => {
      throw 'The request for ' + filePath + ' timed out.';
    };
    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.fromJSON(JSON.parse(xhr.responseText));
        } else {
          console.warn(xhr.statusText);
        }
      }
    };
    xhr.send(null);
  }

  fromJSON(j, context = {}, flags = 0) {
    context.lod = this.lod;
    for (const name in j.textures) {
      const image = new FileImage(name);
      image.fromJSON(j.textures[name]);
      this.__images[name] = texture;
    }
    for (const name in j.materials) {
      const material = new Material(name);
      material.fromJSON(j.materials[name]);
      this.addMaterial(material);
    }
  }

  toJSON(context = {}, flags = 0) {
    return {
      numMaterials: this.geoms.length(),
    };
  }

  readBinary(reader, context = {}) {
    if (context.version == undefined) context.version = 0;

    this.name = reader.loadStr();

    // Specify the Lod to load the images in this library.
    context.lod = this.lod;
    context.materialLibrary = this;

    const numTextures = reader.loadUInt32();
    for (let i = 0; i < numTextures; i++) {
      const type = reader.loadStr();
      const texture = sgFactory.constructClass(type, undefined);
      texture.readBinary(reader, context);
      this.__images[texture.getName()] = texture;
    }
    const numMaterials = reader.loadUInt32();
    if (numMaterials > 0) {
      const toc = reader.loadUInt32Array(numMaterials);
      for (let i = 0; i < numMaterials; i++) {
        const material = new Material('');
        reader.seek(toc[i]); // Reset the pointer to the start of the item data.
        material.readBinary(reader, context, this.__images);
        this.addMaterial(material);
      }
    }

    this.loaded.emit();
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}
export { MaterialLibrary };
