import { Signal } from '../Utilities';
import { MaterialLibrary } from './MaterialLibrary.js';
import { resourceLoader } from './ResourceLoader.js';
import { loadTextfile } from './Utils.js';

class MaterialLibraryManager {
  constructor() {
    this.__materialLibraries = {};
    this.materialLibraryLoaded = new Signal();

    resourceLoader.registerResourceCallback('.matlib', file => {
      loadTextfile(file.url, data => {
        const stem = file.name.split('.')[0]; // trim off the extension
        const j = JSON.parse(data);
        const matlib = new MaterialLibrary(stem);
        matlib.fromJSON(j);
        this.__materialLibraries[stem] = matlib;
        this.materialLibraryLoaded.emit(matlib);
      });
    });
  }

  getMaterialLibraryNames() {
    const names = [];
    for (const name in this.__materialLibraries) {
      names.push(name);
    }
    return names;
  }

  hasMaterialLibrary(name) {
    return name in this.__materialLibraries;
  }

  getMaterialLibrary(name) {
    const res = this.__materialLibraries[name];
    if (!res) {
      console.warn(
        'MaterialLibrary:' +
          name +
          ' not found in MaterialLibraryManager. Found: [' +
          this.getMaterialLibraryNames() +
          ']'
      );
    }
    return res;
  }

  resolveMaterialFromPath(path) {
    const materialLibrary = this.getMaterialLibrary(path[0]);
    if (materialLibrary) return materialLibrary.getMaterial(path[1]);
  }
}

const materialLibraryManager = new MaterialLibraryManager();
export { materialLibraryManager };
