import {
    SystemDesc
} from '../BrowserDetection.js';
import {
    Signal
} from '../Utilities';
import {
    Mesh
} from './Geometry/Mesh.js';
import {
    BinReader
} from './BinReader.js';
import {
    loadBinfile
} from './Utils.js';
import {
    PointsProxy,
    LinesProxy,
    MeshProxy,
} from './Geometry/GeomProxies.js';

let GeomParserWorker = require("worker-loader?inline!./Geometry/GeomParserWorker.js");
// import {
//     parseGeomsBinary
// } from './Geometry/parseGeomsBinary.js';

class GeomLibrary {
    constructor() {
        this.rangeLoaded = new Signal();
        this.streamFileParsed = new Signal();
        this.loaded = new Signal(true);

        this.__streamInfos = {};
        this.__genBuffersOpts = {};

        this.__workers = [];
        for (let i = 0; i < 3; i++)
            this.__workers.push(this.__constructWorker());
        this.__nextWorker = 0;

        this.clear()
    }
    
    clear(){
        this.__loaded = 0;
        this.__numGeoms = 0;
        this.geoms = [];
    }

    __constructWorker() {
        const worker = new GeomParserWorker();
        worker.onmessage = (event) => {
            this.__recieveGeomDatas(
                event.data.key,
                event.data.geomDatas,
                event.data.geomIndexOffset,
                event.data.geomsRange
            );
        };
        return worker;
    }

    __terminateWorkers() {
        for (let worker of this.__workers)
            worker.terminate();
        this.__workers = [];
    }


    setGenBufferOption(key, value) {
        this.__genBuffersOpts[key] = value;
    }

    setNumGeoms(expectedNumGeoms) {
        this.__numGeoms = expectedNumGeoms;
    }

    getGeom(index) {
        if (index >= this.geoms.length) {
            //console.warn("Geom index invalid:" + index);
            return null;
        }
        return this.geoms[index];
    }

    loadURL(fileUrl) {
        let onLoad = this.loadBin;
        loadBinfile(
            fileUrl,
            (data) => {
                this.loadBin(data);
            },
            (statusText) => {
                console.warn(statusText);
            }
        );
    }

    readBinaryBuffer(key, buffer) {
        const isMobile = SystemDesc.isMobileDevice;
        const reader = new BinReader(buffer, 0, isMobile);
        const numGeoms = reader.loadUInt32();
        const geomIndexOffset = reader.loadUInt32();
        this.__streamInfos[key] = {
            total: numGeoms,
            done: 0
        };

        if(numGeoms == 0) {
            this.streamFileParsed.emit(1);
            return numGeoms;
        }
        if (this.__numGeoms == 0) {
            throw("Loading cannot start will we know how many geomms.");
        }

        const toc = reader.loadUInt32Array(numGeoms);

        let numCores = window.navigator.hardwareConcurrency;
        if(!numCores) {
            if(isMobile)
                numCores = 2;
            else 
                numCores = 4;
        }
        const numGeomsPerWorkload = Math.max(1, Math.floor((numGeoms / numCores) + 1));

        // TODO: Use SharedArrayBuffer once available.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer 

        let offset = 0;
        while (offset < numGeoms) {
            const bufferSlice_start = toc[offset];
            let bufferSlice_end;
            let geomsRange;
            if (offset + numGeomsPerWorkload >= numGeoms) {
                geomsRange = [offset, numGeoms];
                bufferSlice_end = buffer.byteLength;
            } else {
                geomsRange = [offset, offset + numGeomsPerWorkload];
                bufferSlice_end = toc[geomsRange[1]];
            }
            const bufferSlice = buffer.slice(bufferSlice_start, bufferSlice_end);
            offset += numGeomsPerWorkload;

            //////////////////////////////////////////////
            // Multi Threaded Parsing
            this.__workers[this.__nextWorker].postMessage({
                key,
                toc,
                geomIndexOffset,
                geomsRange,
                isMobileDevice: reader.isMobileDevice,
                bufferSlice,
                genBuffersOpts: this.__genBuffersOpts,
            }, [bufferSlice]);
            this.__nextWorker = (this.__nextWorker + 1) % this.__workers.length;
            //////////////////////////////////////////////
            // Main Threaded Parsing
            // parseGeomsBinary(
            //     key,
            //     toc,
            //     geomIndexOffset,
            //     geomsRange,
            //     reader.isMobileDevice,
            //     bufferSlice,
            //     this.__genBuffersOpts,
            //     (data, transferables)=>{
            //         this.__recieveGeomDatas(
            //             data.key, 
            //             data.geomDatas, 
            //             data.geomIndexOffset, 
            //             data.geomsRange
            //             );
            //     });


        }
        return numGeoms;
    }

    __recieveGeomDatas(key, geomDatas, geomIndexOffset, geomsRange) {

        // We are storing a subset of the geoms from a binary file
        // which is a subset of the geoms in an asset.
        // geomIndexOffset: the offset of the file geoms in the asset.
        // geomsRange: the range of geoms in the bin file.
        const offset = geomIndexOffset + geomsRange[0];
        const storedRange = [offset, geomIndexOffset + geomsRange[1]];

        for (let i = 0; i < geomDatas.length; i++) {
            const geomData = geomDatas[i];
            if (!geomData.type)
                continue;
            let proxy;
            switch (geomData.type) {
                case 'Points':
                    proxy = new PointsProxy(geomData);
                    break;
                case 'Lines':
                    proxy = new LinesProxy(geomData);
                    break;
                case 'Mesh':
                case 'Plane': // TODO: Support procedural shape params
                case 'Sphere':
                case 'Cone':
                    proxy = new MeshProxy(geomData);
                    break;
                default:
                    throw ("Unsupported Geom type:" + className);
            }
            this.geoms[offset + i] = proxy;
        }
        this.rangeLoaded.emit(storedRange);

        const loaded = storedRange[1] - storedRange[0];
        // console.log("GeomLibrary Loaded:" + loaded);

        // Each file in the stream has its own counter for the number of 
        // geoms, and once each stream file finishes parsing, we fire a signal.
        const streamInfo = this.__streamInfos[key];
        streamInfo.done += loaded;
        // console.log(key + " Loaded:" + streamInfo.done + " of :" + streamInfo.total);
        if (streamInfo.done == streamInfo.total){
            this.streamFileParsed.emit(1);
        }

        // Once all the geoms from all the files are loaded and parsed
        // fire the loaded signal.
        this.__loaded += loaded;
        // console.log("this.__loaded:" + this.__loaded +" this.__numGeoms:" + this.__numGeoms);
        if (this.__loaded == this.__numGeoms) {
            // console.log("GeomLibrary Loaded:" + this.__name + " count:" + geomDatas.length + " loaded:" + this.__loaded);
            this.__terminateWorkers();
            this.loaded.emit();
        }
    }

    toJSON() {
        return {
            "numGeoms": this.geoms.length()
        }
    }

    toString() {
        return JSON.stringify(this.toJSON(), null, 2)
    }

};

export {
    GeomLibrary
};
