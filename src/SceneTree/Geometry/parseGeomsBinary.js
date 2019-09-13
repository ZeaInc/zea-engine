import { Points } from './Points.js';
import { Lines } from './Lines.js';
import { Mesh } from './Mesh.js';
import { BinReader } from '../BinReader.js';

// key, toc, geomIndexOffset, geomsRange, isMobileDevice, bufferSlice, genBuffersOpts, context
const parseGeomsBinary = (data, callback) => {
  const geomDatas = [];
  const offset = data.toc[data.geomsRange[0]];
  // console.log("offset:" +  offset);
  const transferables = [];
  for (let i = data.geomsRange[0]; i < data.geomsRange[1]; i++) {
    const reader = new BinReader(
      data.bufferSlice,
      data.toc[i] - offset,
      data.isMobileDevice
    );
    const className = reader.loadStr();
    const pos = reader.pos();
    // let name = reader.loadStr();
    // console.log(i + ":" + offset + " className:" +  className  + " name:" +  name + " pos:" + (data.toc[i] - offset) + " bufferSlice.byteLength:" +  bufferSlice.byteLength);
    let geom;
    switch (className) {
      case 'Points':
        geom = new Points();
        break;
      case 'Lines':
        geom = new Lines();
        break;
      case 'Mesh':
        geom = new Mesh();
        break;
      default:
        throw 'Unsupported Geom type:' + className;
    }
    try {
      reader.seek(pos); // Reset the pointer to the start of the item data.
      geom.readBinary(reader, data.context);
    } catch (e) {
      console.warn('Error loading:' + geom.name + '\n:' + e);
      geomDatas.push({});
      continue;
    }

    const geomBuffers = geom.genBuffers(data.genBuffersOpts);
    if (geomBuffers.indices) transferables.push(geomBuffers.indices.buffer);
    for (const name in geomBuffers.attrBuffers)
      transferables.push(geomBuffers.attrBuffers[name].values.buffer);

    if (geomBuffers.vertexNeighbors) {
      transferables.push(geomBuffers.vertexNeighbors.buffer);
    }

    geomDatas.push({
      name: geom.name,
      type: className,
      geomBuffers,
      bbox: geom.boundingBox,
    });
  }
  callback(
    {
      key: data.key,
      geomIndexOffset: data.geomIndexOffset,
      geomsRange: data.geomsRange,
      geomDatas,
    },
    transferables
  );
};

export { parseGeomsBinary };
