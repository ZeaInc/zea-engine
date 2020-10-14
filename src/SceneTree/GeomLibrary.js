import { SystemDesc } from '../SystemDesc.js'
import { BinReader } from './BinReader.js'
import { loadBinfile } from './Utils.js'
import { PointsProxy, LinesProxy, MeshProxy } from './Geometry/GeomProxies.js'
import { EventEmitter } from '../Utilities/index'

// The GeomLibrary parses geometry data using workers.
// This can be difficult to debug, so you can disable this
// by setting the following boolena to false, and uncommenting
// the import of parseGeomsBinary
const multiThreadParsing = true

import GeomParserWorker from 'web-worker:./Geometry/GeomParserWorker.js'

// import {
//     parseGeomsBinary
// } from './Geometry/parseGeomsBinary.js';

/** Class representing a geometry library.
 * @private
 */
class GeomLibrary extends EventEmitter {
  /**
   * Create a geom library.
   */
  constructor() {
    super()
    this.__streamInfos = {}
    this.__genBuffersOpts = {}

    this.__workers = []
    this.__nextWorker = 0

    if (multiThreadParsing) {
      for (let i = 0; i < 3; i++) {
        this.__workers.push(this.__constructWorker())
      }
    }

    this.clear()
  }

  /**
   * The clear method.
   */
  clear() {
    this.__loaded = 0
    this.__numGeoms = 0
    this.geoms = []
  }

  /**
   * The __constructWorker method.
   * @return {GeomParserWorker} - Returns a GeomParserWorker.
   * @private
   */
  __constructWorker() {
    const worker = new GeomParserWorker()
    worker.onmessage = (event) => {
      this.__recieveGeomDatas(event.data.key, event.data.geomDatas, event.data.geomIndexOffset, event.data.geomsRange)
    }
    return worker
  }

  /**
   * The __terminateWorkers method.
   * @private
   */
  __terminateWorkers() {
    for (const worker of this.__workers) worker.terminate()
    this.__workers = []
  }

  /**
   * The setGenBufferOption method.
   * @param {any} key - The key value.
   * @param {any} value - The value param.
   */
  setGenBufferOption(key, value) {
    this.__genBuffersOpts[key] = value
  }

  /**
   * The setNumGeoms method.
   * @param {any} expectedNumGeoms - The expectedNumGeoms value.
   */
  setNumGeoms(expectedNumGeoms) {
    this.__numGeoms = expectedNumGeoms
  }

  /**
   * Returns the number of geometries the GeomLibrary has, or will have at the end of loading.
   * @return {number} - The number of geometries.
   */
  getNumGeoms() {
    return this.__numGeoms
  }

  /**
   * The getGeom method.
   * @param {number} index - The index value.
   * @return {BaseGeom} - The stored geometry
   */
  getGeom(index) {
    if (index >= this.geoms.length) {
      // console.warn("Geom index invalid:" + index);
      return null
    }
    return this.geoms[index]
  }

  /**
   * The loadArchive method.
   * @param {any} fileUrl - The fileUrl value.
   */
  loadArchive(fileUrl) {
    resourceLoader.loadArchive(fileUrl).then((entries) => {
      this.loadBin(entries)
    })
  }

  /**
   * The readBinaryBuffer method.
   * @param {any} key - The key value.
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {object} context - The context value.
   * @return {any} - The return value.
   */
  readBinaryBuffer(key, buffer, context) {
    const isMobile = SystemDesc.isMobileDevice
    const reader = new BinReader(buffer, 0, isMobile)
    const numGeoms = reader.loadUInt32()
    const geomIndexOffset = reader.loadUInt32()
    this.__streamInfos[key] = {
      total: numGeoms,
      done: 0,
    }

    if (numGeoms == 0) {
      this.emit('streamFileParsed', {})
      return numGeoms
    }
    if (this.__numGeoms == 0) {
      // Note: for loading geom streams, we need to know the total number
      // ahead of time to be able to generate accurate progress reports.
      this.__numGeoms = numGeoms
      // throw("Loading cannot start will we know how many geomms.");
    }

    const toc = reader.loadUInt32Array(numGeoms)

    if (multiThreadParsing) {
      let numCores = window.navigator.hardwareConcurrency
      if (!numCores) {
        if (isMobile) numCores = 2
        else numCores = 4
      }
      const numGeomsPerWorkload = Math.max(1, Math.floor(numGeoms / numCores + 1))

      // TODO: Use SharedArrayBuffer once available.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer

      let offset = 0
      while (offset < numGeoms) {
        const bufferSlice_start = toc[offset]
        let bufferSlice_end
        let geomsRange
        if (offset + numGeomsPerWorkload >= numGeoms) {
          geomsRange = [offset, numGeoms]
          bufferSlice_end = buffer.byteLength
        } else {
          geomsRange = [offset, offset + numGeomsPerWorkload]
          bufferSlice_end = toc[geomsRange[1]]
        }
        const bufferSlice = buffer.slice(bufferSlice_start, bufferSlice_end)
        offset += numGeomsPerWorkload

        // ////////////////////////////////////////////
        // Multi Threaded Parsing
          this.__workers[this.__nextWorker].postMessage(
            {
              key,
              toc,
              geomIndexOffset,
              geomsRange,
              isMobileDevice: reader.isMobileDevice,
              bufferSlice,
              genBuffersOpts: this.__genBuffersOpts,
              context: {
                versions: context.versions,
              },
            },
            [bufferSlice]
          )
          this.__nextWorker = (this.__nextWorker + 1) % this.__workers.length
      }
    } else {
      // ////////////////////////////////////////////
      // Main Threaded Parsing
      const bufferSlice = buffer.slice(toc[0], buffer.byteLength)
      const geomsRange = [0, numGeoms]
      // const geomsRange = [3, 4]
      // const bufferSlice = buffer.slice(toc[3], toc[4])
      parseGeomsBinary(
        {
          key,
          toc,
          geomIndexOffset,
          geomsRange,
          isMobileDevice: reader.isMobileDevice,
          bufferSlice,
          genBuffersOpts: this.__genBuffersOpts,
          context,
        },
        (data, transferables) => {
          this.__recieveGeomDatas(data.key, data.geomDatas, data.geomIndexOffset, data.geomsRange)
        }
      )
    }
    return numGeoms
  }

  /**
   * The __recieveGeomDatas method.
   * @param {any} key - The key value.
   * @param {any} geomDatas - The geomDatas value.
   * @param {any} geomIndexOffset - The offset of the file geoms in the asset.
   * @param {any} geomsRange - The range of geoms in the bin file.
   * @private
   */
  __recieveGeomDatas(key, geomDatas, geomIndexOffset, geomsRange) {
    // We are storing a subset of the geoms from a binary file
    // which is a subset of the geoms in an asset.
    // geomIndexOffset: the offset of the file geoms in the asset.
    // geomsRange: the range of geoms in the bin file.
    const offset = geomIndexOffset + geomsRange[0]
    const storedRange = [offset, geomIndexOffset + geomsRange[1]]

    for (let i = 0; i < geomDatas.length; i++) {
      const geomData = geomDatas[i]
      if (!geomData.type) continue
      let proxy
      switch (geomData.type) {
        case 'Points':
          proxy = new PointsProxy(geomData)
          break
        case 'Lines':
          proxy = new LinesProxy(geomData)
          break
        case 'Mesh':
        case 'Plane': // TODO: Support procedural shape params
        case 'Sphere':
        case 'Cone':
          proxy = new MeshProxy(geomData)
          break
        default:
          throw new Error('Unsupported Geom type:' + className)
      }
      this.geoms[offset + i] = proxy
    }
    this.emit('rangeLoaded', { range: storedRange })

    const loaded = storedRange[1] - storedRange[0]
    // console.log("GeomLibrary Loaded:" + loaded);

    // Each file in the stream has its own counter for the number of
    // geoms, and once each stream file finishes parsing, we fire a signal.
    const streamInfo = this.__streamInfos[key]
    streamInfo.done += loaded
    // console.log(key + " Loaded:" + streamInfo.done + " of :" + streamInfo.total);
    if (streamInfo.done == streamInfo.total) {
      this.emit('streamFileParsed', { count: 1 })
    }

    // Once all the geoms from all the files are loaded and parsed
    // fire the loaded signal.
    this.__loaded += loaded
    // console.log("this.__loaded:" + this.__loaded +" this.__numGeoms:" + this.__numGeoms);
    if (this.__loaded == this.__numGeoms) {
      // console.log("GeomLibrary Loaded:" + this.__name + " count:" + geomDatas.length + " loaded:" + this.__loaded);
      this.__terminateWorkers()
      this.emit('loaded')
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @return {object} - Returns the json object.
   */
  toJSON() {
    return {
      numGeoms: this.geoms.length(),
    }
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }
}

export { GeomLibrary }
