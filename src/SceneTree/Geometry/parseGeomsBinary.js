/* eslint-disable guard-for-in */
import { Points } from './Points.js'
import { Lines } from './Lines.js'
import { Mesh } from './Mesh.js'
import { BinReader } from '../BinReader.js'
import { Version } from '../Version.js'
import { Registry } from '../../Registry'

// key, toc, geomIndexOffset, geomsRange, isMobileDevice, bufferSlice, genBuffersOpts, context
const parseGeomsBinary = (data, callback) => {
  // eslint-disable-next-line guard-for-in
  for (const key in data.context.versions) {
    const v = data.context.versions[key]
    const version = new Version()
    version.major = v.major
    version.minor = v.minor
    version.patch = v.patch
    version.branch = v.branch
    data.context.versions[key] = version
  }
  const geomDatas = []
  const offset = data.toc[data.geomsRange[0]]
  // console.log("offset:" +  offset);
  const transferables = []
  for (let i = data.geomsRange[0]; i < data.geomsRange[1]; i++) {
    const reader = new BinReader(data.bufferSlice, data.toc[i] - offset, data.isMobileDevice)
    const className = reader.loadStr()
    const pos = reader.pos()
    // const name = reader.loadStr()
    // console.log(i + ":" + offset + " className:" +  className  + " name:" +  name/* + " pos:" + (data.toc[i] - offset) + " bufferSlice.byteLength:" +  bufferSlice.byteLength*/);
    let geom
    switch (className) {
      case 'Points':
        geom = new Points()
        break
      case 'Lines':
        geom = new Lines()
        break
      case 'Mesh':
        geom = new Mesh()
        break
      default:
        throw new Error('Unsupported Geom type:' + className)
    }
    try {
      reader.seek(pos) // Reset the pointer to the start of the item data.
      geom.readBinary(reader, data.context)
    } catch (e) {
      console.warn('Error loading:' + geom.name + '\n:' + e)
      geomDatas.push({})
      continue
    }

    const geomBuffers = geom.genBuffers(data.genBuffersOpts)
    if (geomBuffers.indices) transferables.push(geomBuffers.indices.buffer)
    for (const attrName in geomBuffers.attrBuffers) {
      // Note: The type value assigned to the attribute can
      // not be transfered back to the main thread. Convert to
      // the type name here and send back as a string.
      const attrData = geomBuffers.attrBuffers[attrName]
      const typeName = Registry.getBlueprintName(attrData.dataType)
      attrData.dataType = typeName

      transferables.push(attrData.values.buffer)
    }

    if (geomBuffers.vertexNeighbors) {
      transferables.push(geomBuffers.vertexNeighbors.buffer)
    }

    // Transfer the bbox point buffers.
    const bbox = geom.getBoundingBox()
    transferables.push(bbox.p0.__data.buffer)
    transferables.push(bbox.p1.__data.buffer)

    geomDatas.push({
      name: geom.name,
      type: className,
      geomBuffers,
      bbox,
    })
  }
  callback(
    {
      key: data.key,
      geomIndexOffset: data.geomIndexOffset,
      geomsRange: data.geomsRange,
      geomDatas,
    },
    transferables
  )
}

export { parseGeomsBinary }
