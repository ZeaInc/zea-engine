import { SystemDesc } from '../SystemDesc.js'
import { FilePathParameter } from './Parameters/FilePathParameter'
import { AssetItem } from './AssetItem.js'
import { BinReader } from './BinReader.js'
import { resourceLoader } from './resourceLoader.js'
import { Registry } from '../Registry'
import { Version } from './Version.js'

/**
 * Class designed to load and handle `.vla` files.
 * Which facilitates the migration of geometries from third party applications to the Digistar planetarium dome projection.
 *
 * **Parameters**
 * * **DataFilePath(`FilePathParameter`):** Used to specify the path to the file.
 *
 * **Events**
 * * **loaded:** Triggered once the tree is loaded. Note: the tree bounding box is valid once the tree is loaded.
 * * **geomsLoaded:** Triggered once all geometries are loaded.
 *
 * @extends AssetItem
 */
class VLAAsset extends AssetItem {
  /**
   * Create a VLA asset.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.loaded = false

    // A signal that is emitted once all the geometries are loaded.
    // Often the state machine will activate the
    // first state when this signal emits.
    this.geomsLoaded = false
    this.loaded = false
    this.__geomLibrary.on('loaded', () => {
      this.emit('geomsLoaded', {})
    })

    this.__fileParam = this.addParameter(new FilePathParameter('FilePath'))

    this.addParameterDeprecationMapping('DataFilePath', 'FilePath') // Note: migrating from 'DataFilePath' to 'FilePath'

    this.__fileParam.on('valueChanged', () => {
      this.geomsLoaded = false
      this.loadDataFile(
        () => {
          if (!this.loaded) this.emit('loaded', {})
        },
        () => {
          // if(!this.loaded){
          //   this.emit('loaded', {});
          // }
          // this.emit('geomsLoaded', {})
        }
      )
    })
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Sets state of current asset using a binary reader object.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   * @return {number} - The return value.
   */
  readBinary(reader, context) {
    if (context.versions['zea-engine']) {
      // Necessary for the smart lok
    } else {
      // Now we split the mesh out from the engine version.
      context.versions['zea-mesh'] = new Version(reader.loadStr())
    }
    console.log('Loading Mesh File version:', context.versions['zea-mesh'])

    const numGeomsFiles = reader.loadUInt32()

    super.readBinary(reader, context)

    if (context.versions['zea-engine'].compare([2, 1, 0]) < 0) {
      // Some data is no longer being read at the end of the buffer
      // so we skip to the end here.
      // The data was the atlas size of the lightmap that we no longer support.
      const atlasSize = reader.loadFloat32Vec2()
    }
    this.__geomLibrary.setNumGeoms(reader.loadUInt32())

    return numGeomsFiles
  }

  /**
   * Loads all the geometries and metadata from the `.vla` file.
   *
   * @private
   * @param {function} onDone - The onDone value.
   * @param {function} onGeomsDone - The onGeomsDone value.
   */
  loadDataFile(onDone, onGeomsDone) {
    const fileId = this.__fileParam.getValue()
    const url = this.__fileParam.getUrl()
    const folder = url.lastIndexOf('/') > -1 ? url.substring(0, url.lastIndexOf('/')) + '/' : ''
    const filename = url.lastIndexOf('/') > -1 ? url.substring(url.lastIndexOf('/') + 1) : ''
    const stem = filename.substring(0, filename.lastIndexOf('.'))
    let numGeomsFiles = 0

    const context = {
      assetItem: this,
      versions: {},
    }

    resourceLoader.loadFile('archive', url).then((entries) => {
      // Load the tree file. This file contains
      // the scene tree of the asset, and also
      // tells us how many geom files will need to be loaded.

      let treeReader
      if (entries.tree2) {
        treeReader = new BinReader(entries.tree2.buffer, 0, SystemDesc.isMobileDevice)
      } else {
        const entry = entries.tree ? entries.tree : entries[Object.keys(entries)[0]]
        treeReader = new BinReader(entry.buffer, 0, SystemDesc.isMobileDevice)
        context.versions['zea-engine'] = new Version()
      }

      // Necessary for the smart lok
      numGeomsFiles = this.readBinary(treeReader, context)

      onDone()

      if (numGeomsFiles == 0 && entries.geoms) {
        resourceLoader.addWork(fileId, 1) // (load + parse + extra)
        this.__geomLibrary.readBinaryBuffer(fileId, entries.geoms.buffer, context)
        onGeomsDone()
      } else {
        // Note: Lets just load all the goem files in parallel.
        loadAllGeomFiles()
      }
    })

    const loadAllGeomFiles = () => {
      const promises = []
      for (let geomFileID = 0; geomFileID < numGeomsFiles; geomFileID++) {
        // console.log('LoadingGeom File:', geomFileID)
        const geomFileUrl = folder + stem + geomFileID + '.vlageoms'
        promises.push(loadGeomsfile(geomFileUrl, context))
      }
      Promise.all(promises).then(() => {
        if (onGeomsDone) onGeomsDone()
      })
    }

    const loadGeomsfile = (geomFileUrl) => {
      return new Promise((resolve) => {
        resourceLoader.loadFile('archive', geomFileUrl).then((entries) => {
          const geomsData = entries[Object.keys(entries)[0]]
          this.__geomLibrary.readBinaryBuffer(fileId, geomsData.buffer, context)
          resolve()
        })
      })
    }

    // To ensure that the resource loader knows when
    // parsing is done, we listen to the GeomLibrary streamFileLoaded
    // signal. This is fired every time a file in the stream is finshed parsing.
    this.__geomLibrary.on('streamFileParsed', (event) => {
      // A chunk of geoms are now parsed, so update the resource loader.
      resourceLoader.addWorkDone(fileId, event.fraction)
    })
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {function} onDone - The onDone value.
   */
  fromJSON(j, context, onDone) {
    if (!context) context = {}
    context.assetItem = this

    const loadAssetJSON = () => {
      super.fromJSON(j, context, onDone)
      if (onDone) onDone()
    }

    if (j.params && j.params.DataFilePath) {
      // Save the callback function for later.
      this.__datafileLoaded = loadAssetJSON
      const filePathJSON = j.params.DataFilePath
      delete j.params.DataFilePath
      this.__fileParam.fromJSON(filePathJSON, context)
    } else {
      loadAssetJSON()
    }
  }
}

Registry.register('VLAAsset', VLAAsset)

export { VLAAsset }
