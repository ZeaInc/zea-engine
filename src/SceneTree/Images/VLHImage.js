import {
    Color
} from '../../Math';
import {
    Signal,
    decodeText
} from '../../Utilities';
import {
    sgFactory
} from '../SGFactory.js';
import {
    BaseImage
} from '../BaseImage.js';
import {
    resourceLoader
} from '../ResourceLoader.js';

import {
    Parameter,
    NumberParameter,
    Vec4Parameter,
    FilePathParameter,
    ParameterSet
} from '../Parameters';


class VLHImage extends BaseImage {
    constructor(name, params = {}) {
        super(name, params);
        
        this.__loaded = false;
        this.__exposure = 1.0;
        this.__ambientLightFactor = 0.0;
        this.__hdrtint = new Color(1, 1, 1, 1);
        this.__stream = 'stream' in params ? params['stream'] : false;
        this.type = 'FLOAT';

        const fileParam = this.addParameter(new FilePathParameter('FilePath', 'vlh'));
        fileParam.valueChanged.connect(()=>{
            this.loaded.untoggle();

            if (this.getName() == this.constructor.name) {
                // Generate a name from the file path.
                const stem = fileParam.getStem();
                const decorator = stem.substring(stem.length - 1);
                if (!isNaN(decorator)) {
                    // Note: ALL image names have an LOD specifier at the end.
                    // remove that off when retrieving the name.
                    this.setName(stem.substring(0, stem.length - 1));
                } else {
                    this.setName(stem);
                }
            }

            const fileId = fileParam.getValue()
            const file = fileParam.getFile();
            this.__loadVLH(fileId, file);
        });
    }

    getDOMElement(){
        return this.__domElement;
    }

    getResourcePath() {
        return this.getParameter('FilePath').getValue();
    }

    __decodeData(entries) {
        const ldr = entries.ldr;
        const cdm = entries.cdm;
        const samples = entries.samples;

        
        /////////////////////////////////
        // Parse the data.
        const blob = new Blob([ldr.buffer]);
        const ldrPic = new Image();
        ldrPic.onload = () => {
            this.width = ldrPic.width;
            this.height = ldrPic.height;
            // console.log(resourcePath + ": [" + this.width + ", " + this.height + "]");
            this.__data = {
                ldr: ldrPic,
                cdm: cdm
            }
            if (!this.__loaded) {
                this.__loaded = true;
                this.loaded.emit();
            } else {
                this.updated.emit();
            }
        }
        ldrPic.src = URL.createObjectURL(blob);
    }


    __loadVLH(fileId, file) {
        this.type = 'FLOAT';

        resourceLoader.loadResource(fileId, (entries) => {
            if(!entries.ldr || !entries.cdm) {
                for (let name in entries) {
                    if (name.endsWith('.jpg')){
                        entries.ldr = entries[name];
                        delete entries[name];
                    }
                    else if (name.endsWith('.bin')) {
                        entries.cdm = entries[name];
                        delete entries[name];
                    }
                }
            }
            this.__decodeData(entries);

        });
    }


    isStream() {
        return false;
    }

    isLoaded() {
        return this.__loaded;
    }

    getParams() {
        const params = super.getParams();
        if (this.__loaded) {
            params['data'] = this.__data;
            params['exposure'] = this.__exposure;
        }
        return params;
    }

    setHDRTint(hdrtint) {
        this.__hdrtint = hdrtint;
    }

    getHDRTint() {
        return this.__hdrtint;
    }
    
    
    //////////////////////////////////////////
    // Persistence

    fromJSON(json) {

    }

    toJSON(json) {

    }

    readBinary(reader, context) {
        // super.readBinary(reader, context);
        this.setName(reader.loadStr());
        const resourcePath = reader.loadStr();
        if (typeof resourcePath === 'string' && resourcePath != "") {
            if (context.lod >= 0) {
                const suffixSt = resourcePath.lastIndexOf('.')
                if (suffixSt != -1) {
                    const lodPath = resourcePath.substring(0, suffixSt) + context.lod + resourcePath.substring(suffixSt);
                    if (resourceLoader.resourceAvailable(lodPath)) {
                        resourcePath = lodPath;
                    }
                }
            }
            this.getParameter('FilePath').setValue(resourcePath);

        }
    }
};

sgFactory.registerClass('VLHImage', VLHImage);


export {
    VLHImage
};