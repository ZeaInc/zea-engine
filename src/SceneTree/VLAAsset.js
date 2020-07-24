import { Color } from '../Math/index'
import { SystemDesc } from '../BrowserDetection.js'
import { ColorParameter } from './Parameters/index'
import { FilePathParameter } from './Parameters/FilePathParameter'
import { AssetItem } from './AssetItem.js'
import { BinReader } from './BinReader.js'
import { resourceLoader } from './ResourceLoader.js'
import { sgFactory } from './SGFactory.js'
import { Version } from './Version.js'

/**
 * Class designed to load and handle `.vla` files.
 * Which facilitates the migration of geometries from third party applications to the Digistar planetarium dome projection.
 *
 * **Parameters**
 * * **DataFilePath(`FilePathParameter`):** Used to specify the path to the file.
 * * **LightmapTint(`ColorParameter`):** _todo_
 *
 * **Events**
 * * **loaded:** Triggered once everything is loaded.
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
    this.lightmap = null

    // A signal that is emitted once all the geoms are loaded.
    // Often the state machine will activate the first state
    // when this signal emits.
    this.geomsLoaded = false
    this.loaded = false
    this.__geomLibrary.on('loaded', () => {
      this.emit('geomsLoaded', {})
    })

    this.__datafileParam = this.addParameter(new FilePathParameter('DataFilePath'))
    this.__datafileParam.on('valueChanged', () => {
      const file = this.__datafileParam.getFileDesc()
      if (!file) return
      console.log(file)
      if (this.getName() == '') {
        const stem = this.__datafileParam.getStem()
        this.setName(stem)
      }

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

    this.addParameter(new ColorParameter('LightmapTint', new Color(1, 1, 1, 1)))
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
    if (context.version != -1) {
      // Necessary for the smart lok
      const version = new Version()
      version.patch = context.version
      context.versions = { 'zea-mesh': version, 'zea-engine': version }
      context.meshSdk = 'FBX'
    } else {
      const v = reader.loadUInt8()
      reader.seek(0)
      // 10 == ascii code for newline. Note: previous non-semver only reached 7
      if (v != 10) {
        const version = new Version()
        version.patch = reader.loadUInt32()
        context.versions = { 'zea-mesh': version, 'zea-engine': version }
        context.meshSdk = 'FBX'
      } else {
        // Now we split the mesh out from the engine version.
        const version = new Version(reader.loadStr())
        context.versions = { 'zea-mesh': version }
        context.meshSdk = 'FBX'
      }
    }
    this.meshfileversion = context.versions['zea-mesh']
    this.meshSdk = context.meshSdk
    console.log('Loading CAD File version:', context.versions['zea-mesh'], ' exported using SDK:', context.meshSdk)

    const numGeomsFiles = reader.loadUInt32()

    super.readBinary(reader, context)

    // Strangely, reading the latest HMD files gives us 12 bytes
    // at the end and the next 4 == 0. Not sure why.
    // setNumGeoms sets 0, but this doesn't bother the loading
    // so simply leaving for now.
    // if (reader.remainingByteLength != 4) {
    //   throw new Error(
    //     'File needs to be re-exported:' +
    //       this.getParameter('FilePath').getValue()
    //   )
    // }

    // Perpare the geom library for loading
    // This helps with progress bars, so we know how many geoms are coming in total.
    // Note: the geom library encodes in its binary buffer the number of geoms.
    // No need to set it here. (and the number is now incorrect for a reason I do not understand.)

    // if (context.version < 5) {
    if (context.versions['zea-engine'].lessThan([0, 0, 5])) {
      // Some data is no longer being read at the end of the buffer
      // so we skip to the end here.
      reader.seek(reader.byteLength - 4)
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
    const file = this.__datafileParam.getFileDesc()
    if (!file) {
      console.warn('VLAAsset data file not found.')
      return
    }

    const folder = this.__datafileParam.getFileFolderPath()
    const fileId = this.__datafileParam.getValue()
    const stem = this.__datafileParam.getStem()
    let numGeomsFiles = 0

    const isVLFile = new RegExp('\\.(vla)$', 'i').test(file.name)
    const vlgeomFiles = []

    const loadBinary = (entries) => {
      // Load the tree file. This file contains
      // the scene tree of the asset, and also
      // tells us how many geom files will need to be loaded.

      let version = -1
      let treeReader
      if (entries.tree2) {
        treeReader = new BinReader(entries.tree2.buffer, 0, SystemDesc.isMobileDevice)
      } else {
        const entry = entries.tree ? entries.tree : entries[Object.keys(entries)[0]]
        treeReader = new BinReader(entry.buffer, 0, SystemDesc.isMobileDevice)
        version = 0
      }

      numGeomsFiles = this.readBinary(treeReader, {
        assetItem: this,
        version,
      })

      if (!isVLFile) {
        // Check that the number of geom files we have
        // match the cound given by the file.
        if (numGeomsFiles != vlgeomFiles.length)
          console.error('The number of GeomFiles does not match the count given by the VLA file.')
      }

      onDone()

      if (numGeomsFiles == 0 && entries.geoms0) {
        resourceLoader.addWork(fileId + 'geoms', 1) // (load + parse + extra)
        this.__geomLibrary.readBinaryBuffer(fileId, entries.geoms0.buffer, {
          version,
        })
        onGeomsDone()
      } else {
        // add the work for the the geom files....
        resourceLoader.addWork(fileId + 'geoms', 4 * numGeomsFiles) // (load + parse + extra)

        // Note: Lets just load all the goem files in parallel.
        loadAllGeomFiles()
      }
    }

    const loadAllGeomFiles = () => {
      const promises = []
      for (let geomFileID = 0; geomFileID < numGeomsFiles; geomFileID++) {
        // console.log('LoadingGeom File:', geomFileID)
        if (isVLFile) {
          const nextGeomFileName = folder + stem + geomFileID + '.vlageoms'
          const geomFile = resourceLoader.resolveFilepath(nextGeomFileName)
          if (geomFile) promises.push(loadGeomsfile(geomFileID, geomFile.url))
          else {
            throw new Error('VLA Geoms file not found:' + nextGeomFileName)
          }
        } else {
          promises.push(loadGeomsfile(geomFileID, vlgeomFiles[geomFileID].url))
        }
      }
      Promise.all(promises).then(() => {
        if (onGeomsDone) onGeomsDone()
      })
    }

    const loadGeomsfile = (index, geomFileUrl) => {
      return new Promise((resolve) => {
        resourceLoader.loadUrl(
          fileId + index,
          geomFileUrl,
          (entries) => {
            const geomsData = entries[Object.keys(entries)[0]]
            this.__geomLibrary.readBinaryBuffer(fileId, geomsData.buffer)
            resolve()
          },
          false
        ) // <----
        // Note: Don't add load work as we already pre-added it at the begining
        // and after the Tree file was loaded...
      })
    }

    if (isVLFile) {
      resourceLoader.loadResource(fileId, loadBinary)
    } else if (file.metadata.ConvertFile) {
      let vlaFile
      file.metadata.ConvertFile.map((metadataFile) => {
        if (metadataFile.filename.endsWith('.vla')) vlaFile = metadataFile
        else if (metadataFile.filename.endsWith('.vlageoms')) vlgeomFiles.push(metadataFile)
      })
      if (vlaFile) {
        resourceLoader.loadUrl(fileId, vlaFile.url, loadBinary)
      } else {
        console.warn('ConvertFile metadata contains no vla file.')
      }
    }

    // To ensure that the resource loader knows when
    // parsing is done, we listen to the GeomLibrary streamFileLoaded
    // signal. This is fired every time a file in the stream is finshed parsing.
    this.__geomLibrary.on('streamFileParsed', (event) => {
      // A chunk of geoms are now parsed, so update the resource loader.
      resourceLoader.addWorkDone(fileId + 'geoms', event.fraction)
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
      this.__datafileParam.fromJSON(filePathJSON, context)
    } else {
      loadAssetJSON()
    }
  }
}

sgFactory.registerClass('VLAAsset', VLAAsset)

export { VLAAsset }
