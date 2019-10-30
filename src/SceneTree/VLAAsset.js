import { Vec2, Color } from '../Math';
import { Signal } from '../Utilities';
import { SystemDesc } from '../BrowserDetection.js';
import { FilePathParameter, ColorParameter } from './Parameters';
import { AssetItem } from './AssetItem.js';
import { ValueSetMode } from './Parameters/Parameter.js';
import { GeomItem } from './GeomItem.js';
import { BinReader } from './BinReader.js';
import { resourceLoader } from './ResourceLoader.js';
import { sgFactory } from './SGFactory.js';

/** Class representing a VLA asset.
 * @extends AssetItem
 */
class VLAAsset extends AssetItem {
  /**
   * Create a VLA asset.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name);
    this.loaded.setToggled(false);

    this.__atlasSize = new Vec2();

    // A signal that is emitted once all the geoms are loaded.
    // Often the state machine will activate the first state
    // when this signal emits.
    this.geomsLoaded = new Signal(true);
    this.geomsLoaded.setToggled(false);
    this.loaded.setToggled(false);

    this.__datafileParam = this.addParameter(
      new FilePathParameter('DataFilePath')
    );
    this.__datafileParam.valueChanged.connect(mode => {
      const file = this.__datafileParam.getFileDesc();
      if (!file) return;
      console.log(file);
      if (this.getName() == sgFactory.getClassName(this)) {
        const stem = this.__datafileParam.getStem();
        this.setName(stem);
      }

      this.geomsLoaded.setToggled(false);
      this.loadDataFile(
        () => {
          if (mode == ValueSetMode.USER_SETVALUE && !this.loaded.isToggled())
            this.loaded.emit();
        },
        () => {
          // if(mode == ValueSetMode.USER_SETVALUE && !this.loaded.isToggled()){
          //   this.loaded.emit();
          // }
          this.geomsLoaded.emit();
        }
      );
    });

    this.addParameter(
      new ColorParameter('LightmapTint', new Color(1, 1, 1, 1))
    );
  }

  /**
   * The getLightmapSize method.
   * @return {any} - The return value.
   */
  getLightmapSize() {
    return this.__atlasSize;
  }

  /**
   * The getAtlasSize method.
   * Note: The atlas can be used for more than just lightmaps.
   * @return {any} - The return value.
   */
  getAtlasSize() {
    return this.__atlasSize;
  }

  /**
   * The getLightmapPath method.
   * @param {string} lightmapName - The lighmap name.
   * @param {any} lightmapLOD - The lightmapLOD value.
   * @return {any} - The return value.
   */
  getLightmapPath(lightmapName, lightmapLOD) {
    const stem = this.__datafileParam.getStem();
    const lightmapPath =
      this.__datafileParam.getFileFolderPath() +
      stem +
      '_' +
      lightmapName +
      '_Lightmap' +
      lightmapLOD +
      '.vlh';

    return lightmapPath;
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   * @return {any} - The return value.
   */
  readBinary(reader, context) {
    const numGeomsFiles = reader.loadUInt32();

    super.readBinary(reader, context);

    this.__atlasSize = reader.loadFloat32Vec2();
    if (reader.remainingByteLength != 4) {
      throw new Error(
        'File needs to be re-exported:' +
          this.getParameter('FilePath').getValue()
      );
    }
    // Perpare the geom library for loading
    // This helps with progress bars, so we know how many geoms are coming in total.
    this.__geomLibrary.setNumGeoms(reader.loadUInt32());

    return numGeomsFiles;
  }

  /**
   * The loadDataFile method.
   * @param {any} onDone - The onDone value.
   * @param {any} onGeomsDone - The onGeomsDone value.
   */
  loadDataFile(onDone, onGeomsDone) {
    const file = this.__datafileParam.getFileDesc();
    if (!file) {
      console.warn('VLAAsset data file not found.');
      return;
    }

    const folder = this.__datafileParam.getFileFolderPath();
    const fileId = this.__datafileParam.getValue();
    const stem = this.__datafileParam.getStem();
    let numGeomsFiles = 0;

    const isVLFile = new RegExp('\\.(vla)$', 'i').test(file.name);
    const vlgeomFiles = [];

    const loadBinary = entries => {
      // Load the tree file. This file contains
      // the scene tree of the asset, and also
      // tells us how many geom files will need to be loaded.

      let version = 0;
      let treeReader;
      if (entries.tree2) {
        treeReader = new BinReader(
          entries.tree2.buffer,
          0,
          SystemDesc.isMobileDevice
        );
        version = treeReader.loadUInt32();
      } else {
        const entry = entries.tree
          ? entries.tree
          : entries[Object.keys(entries)[0]];
        treeReader = new BinReader(entry.buffer, 0, SystemDesc.isMobileDevice);
        version = 0;
      }

      numGeomsFiles = this.readBinary(treeReader, {
        assetItem: this,
        version,
      });

      if (!isVLFile) {
        // Check that the number of geom files we have
        // match the cound given by the file.
        if (numGeomsFiles != vlgeomFiles.length)
          console.error(
            'The number of GeomFiles does not match the count given by the VLA file.'
          );
      }

      onDone();

      if (numGeomsFiles == 0 && entries.geoms0) {
        resourceLoader.addWork(fileId + 'geoms', 1); // (load + parse + extra)
        this.__geomLibrary.readBinaryBuffer(fileId, entries.geoms0.buffer, {
          version,
        });
        const id = this.__geomLibrary.loaded.connect(() => {
          if (onGeomsDone) onGeomsDone();
        });
      } else {
        // add the work for the the geom files....
        resourceLoader.addWork(fileId + 'geoms', 4 * numGeomsFiles); // (load + parse + extra)

        // Note: Lets just load all the goem files in parallel.
        loadAllGeomFiles();
      }
    };

    const loadAllGeomFiles = () => {
      const promises = [];
      for (let geomFileID = 0; geomFileID < numGeomsFiles; geomFileID++) {
        console.log('LoadingGeom File:', geomFileID);
        if (isVLFile) {
          const nextGeomFileName = folder + stem + geomFileID + '.vlageoms';
          const geomFile = resourceLoader.resolveFilepath(nextGeomFileName);
          if (geomFile) promises.push(loadGeomsfile(geomFileID, geomFile.url));
          else {
            throw new Error('VLA Geoms file not found:' + nextGeomFileName);
          }
        } else {
          promises.push(loadGeomsfile(geomFileID, vlgeomFiles[geomFileID].url));
        }
      }
      Promise.all(promises).then(() => {
        if (onGeomsDone) onGeomsDone();
      });
    };

    const loadGeomsfile = (index, geomFileUrl) => {
      return new Promise((resolve, reject) => {
        resourceLoader.loadUrl(
          fileId + index,
          geomFileUrl,
          entries => {
            const geomsData = entries[Object.keys(entries)[0]];
            this.__geomLibrary.readBinaryBuffer(fileId, geomsData.buffer);
            resolve();
          },
          false
        ); // <----
        // Note: Don't add load work as we already pre-added it at the begining
        // and after the Tree file was loaded...
      });
    };

    if (isVLFile) {
      resourceLoader.loadResource(fileId, loadBinary);
    } else if (file.metadata.ConvertFile) {
      let vlaFile;
      file.metadata.ConvertFile.map(metadataFile => {
        if (metadataFile.filename.endsWith('.vla')) vlaFile = metadataFile;
        else if (metadataFile.filename.endsWith('.vlageoms'))
          vlgeomFiles.push(metadataFile);
      });
      if (vlaFile) {
        resourceLoader.loadUrl(fileId, vlaFile.url, loadBinary);
      } else {
        console.warn('ConvertFile metadata contains no vla file.');
      }
    }

    // To ensure that the resource loader knows when
    // parsing is done, we listen to the GeomLibrary streamFileLoaded
    // signal. This is fired every time a file in the stream is finshed parsing.
    this.__geomLibrary.streamFileParsed.connect(fraction => {
      // A chunk of geoms are now parsed, so update the resource loader.
      resourceLoader.addWorkDone(fileId + 'geoms', fraction);
    });
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {any} onDone - The onDone value.
   */
  fromJSON(j, context, onDone) {
    if (!context) context = {};
    context.assetItem = this;

    const loadAssetJSON = () => {
      super.fromJSON(j, context, onDone);
      if (onDone) onDone();
    };

    if (j.params && j.params.DataFilePath) {
      // Save the callback function for later.
      this.__datafileLoaded = loadAssetJSON;
      const filePathJSON = j.params.DataFilePath;
      delete j.params.DataFilePath;
      this.__datafileParam.fromJSON(filePathJSON, context);
    } else {
      loadAssetJSON();
    }
  }
}

sgFactory.registerClass('VLAAsset', VLAAsset);

export { VLAAsset };
