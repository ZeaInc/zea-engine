
import {
  Vec2,
  Color
} from '../Math';
import {
  Signal
} from '../Utilities';
import {
  SystemDesc
} from '../BrowserDetection.js';
import {
    FilePathParameter,
    ColorParameter
} from './Parameters';
import {
  AssetItem
} from './AssetItem.js';
import {
  ValueSetMode
} from './Parameters/Parameter.js';
import {
  GeomItem
} from './GeomItem.js';
import {
  BinReader
} from './BinReader.js';
import {
  resourceLoader
} from './ResourceLoader.js';
import {
  GeomLibrary
} from './GeomLibrary.js';
import {
  MaterialLibrary
} from './MaterialLibrary.js';



class VLAAsset extends AssetItem {
  constructor(name) {
    super(name);
    this.loaded.setToggled(false);


    this.__geomLibrary = new GeomLibrary();
    this.__materials = new MaterialLibrary();
    this.__atlasSize = new Vec2();

    // A signal that is emitted once all the geoms are loaded.
    // Often the state machine will activate the first state
    // when this signal emits. 
    this.geomsLoaded = new Signal(true);
    this.geomsLoaded.setToggled(false);
    this.loaded.setToggled(false);

    this.__datafileParam = this.addParameter(new FilePathParameter('DataFilePath'));
    this.__datafileParam.valueChanged.connect((mode) => {
      this.geomsLoaded.setToggled(false);
      this.loadDataFile(()=>{
        if(mode == ValueSetMode.USER_SETVALUE && !this.loaded.isToggled())
          this.loaded.emit();
      }, ()=>{
        if(mode == ValueSetMode.USER_SETVALUE && !this.loaded.isToggled())
          this.loaded.emit();
      });
    });


    this.addParameter(new ColorParameter('LightmapTint', new Color(1,1,1,1)));
  }

  getGeometryLibrary() {
    return this.__geomLibrary;
  }

  getMaterialLibrary() {
    return this.__materials;
  }

  getLightmapSize() {
    return this.__atlasSize;
  }

  // Note: the atlas can be used for more than just lightmaps.
  getAtlasSize() {
    return this.__atlasSize;
  }

  getLightmapPath(lightmapName, lightmapLOD) {
    const stem = this.__datafileParam.getStem();
    const lightmapPath = this.__datafileParam.getFileFolderPath() + stem + "_" + lightmapName + "_Lightmap" + lightmapLOD + ".vlh";
        
    return lightmapPath;
  }

  //////////////////////////////////////////
  // Persistence

  readBinary(reader, context) {
    context.assetItem = this;

    let numGeomsFiles = reader.loadUInt32();

    this.__materials.readBinary(reader, context);

    super.readBinary(reader, context);

    this.__atlasSize = reader.loadFloat32Vec2();
    if(reader.remainingByteLength != 4){
      throw("File needs to be re-exported:" + this.getParameter('FilePath').getValue());
    }
    // Perpare the geom library for loading
    // This helps with progress bars, so we know how many geoms are coming in total.
    this.__geomLibrary.setNumGeoms(reader.loadUInt32());
    
    // this.loaded.emit();
    // onDone(); 
    return numGeomsFiles;
  }


  loadDataFile(onDone, onGeomsDone) {

    const file = this.__datafileParam.getFileDesc();
    if(!file)
      return;

    const folder = this.__datafileParam.getFileFolderPath()
    const fileId = this.__datafileParam.getValue();
    const stem = this.__datafileParam.getStem();
    let numGeomsFiles = 0;

    // TODO: one day the resourcecs tree could include meta data to indicate how
    // manhy files make up the geom stream. 

    // Load the tree file. This file contains
    // the scene tree of the asset, and also
    // tells us how many geom files will need to be loaded.
    resourceLoader.loadResource(fileId,
      (entries) => {
        const treeData = entries[Object.keys(entries)[0]];
        numGeomsFiles = this.readBinary(new BinReader(treeData.buffer, 0, SystemDesc.isMobileDevice), {
          dataversion: 1
        });
        resourceLoader.freeData(treeData.buffer);

        onDone();
        if(numGeomsFiles == 0 && Object.keys(entries)[1].endsWith('geoms')) {
          resourceLoader.addWork(fileId+'geoms', 1); // (load + parse + extra)
          let geomsData = entries[Object.keys(entries)[1]];
          this.__geomLibrary.readBinaryBuffer(fileId, geomsData.buffer);
          resourceLoader.freeData(geomsData.buffer);
        }
        else {
          // add the work for the the geom files....
          resourceLoader.addWork(fileId+'geoms', 4*numGeomsFiles); // (load + parse + extra)
          loadNextGeomFile();
        }
      });

    // Now load the geom files in sequence, parsing and loading
    // the next..
    let geomFileID = 0;
    const loadNextGeomFile = () => {
      if (geomFileID < numGeomsFiles) {
        const nextGeomFileName = folder + stem + geomFileID + '.vlageoms';
        const fileId = resourceLoader.resolveFilePathToId(nextGeomFileName);
        // console.log("loadNextGeomFile:" + nextGeomFileName);
        if (resourceLoader.resourceAvailable(fileId))
          loadGeomsfile(fileId);
        else {
          throw("VLA Geoms file not found:" + nextGeomFileName)
        }
      }
      else {
        this.geomsLoaded.emit();
      }
    }
    const loadGeomsfile = (fileId) => {
      geomFileID++;
      resourceLoader.loadResource(fileId,
        (entries) => {
          let geomsData = entries[Object.keys(entries)[0]];
          this.__geomLibrary.readBinaryBuffer(fileId, geomsData.buffer);
          resourceLoader.freeData(geomsData.buffer);
          loadNextGeomFile();
        },
        false); // <----
      // Note: Don't add load work as we already pre-added it at the begining
      // and after the Tree file was loaded...
    }

    // To ensure that the resource loader knows when 
    // parsing is done, we listen to the GeomLibrary streamFileLoaded
    // signal. This is fired every time a file in the stream is finshed parsing.
    this.__geomLibrary.streamFileParsed.connect((fraction) => {
      // A chunk of geoms are now parsed, so update the resource loader.
      resourceLoader.addWorkDone(fileId+'geoms', fraction);
    });
  }



  fromJSON(j, context, onDone) {
    if(!context) 
      context = {};
    context.assetItem = this;

    const loadAssetJSON = ()=>{
      super.fromJSON(j, context, onDone);
      if(onDone)
        onDone();
    }

    if(j.params && j.params.DataFilePath) {
      // Save the callback function for later.
      this.__datafileLoaded = loadAssetJSON;
      const filePathJSON = j.params.DataFilePath;
      delete j.params.DataFilePath;
      this.__datafileParam.fromJSON(filePathJSON, context);
    }
    else {
      loadAssetJSON();
    }
  }
  
};

export {
  VLAAsset
};