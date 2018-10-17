import {
    Points
} from './Points.js';
import {
    Lines
} from './Lines.js';
import {
    Mesh
} from './Mesh.js';
import {
    BinReader
} from '../BinReader.js';

let parseGeomsBinary = (key, toc, geomIndexOffset, geomsRange, isMobileDevice, bufferSlice, genBuffersOpts, callback) => {
    let geomDatas = [];
    let offset = toc[geomsRange[0]];
    // console.log("offset:" +  offset);
    let transferables = [];
    for (let i = geomsRange[0]; i < geomsRange[1]; i++) {
        let reader = new BinReader(bufferSlice, toc[i] - offset, isMobileDevice);
        let className = reader.loadStr();
        let pos = reader.pos();
        // let name = reader.loadStr();
        // console.log(i + ":" + offset + " className:" +  className  + " name:" +  name + " pos:" + (toc[i] - offset) + " bufferSlice.byteLength:" +  bufferSlice.byteLength);
        let geom;
        switch (className) {
            case 'Points':
                geom = new Points();
                break;
            case 'Lines':
                geom = new Lines();
                break;
            case 'Mesh':
            case 'Plane': // TODO: Support procedural shape params
            case 'Sphere':
            case 'Cone':
                geom = new Mesh();
                break;
            default:
                throw ("Unsupported Geom type:" + className);
        }
        try {
            reader.seek(pos); // Reset the pointer to the start of the item data.
            geom.readBinary(reader);
        } catch(e) {
            console.warn("Error loading:" + geom.name + "\n:" + e);
            geomDatas.push({});
            continue;
        }

        let geomBuffers = geom.genBuffers(genBuffersOpts);
        if (geomBuffers.indices)
            transferables.push(geomBuffers.indices.buffer);
        for (let name in geomBuffers.attrBuffers)
            transferables.push(geomBuffers.attrBuffers[name].values.buffer);

        if(geomBuffers.vertexNeighbors){
            transferables.push(geomBuffers.vertexNeighbors.buffer);
        }

        geomDatas.push({
            name: geom.name,
            type: className,
            geomBuffers,
            bbox: geom.boundingBox
        });
    }
    callback({
            key,
            geomIndexOffset,
            geomsRange,
            geomDatas
        }, transferables);

}

export {
    parseGeomsBinary
};
