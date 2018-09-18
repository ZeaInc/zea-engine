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
    VLHImage
} from './VLHImage.js';
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


class EnvMap extends VLHImage {
    constructor(name, params = {}) {
        super(name, params);
    }

    __decodeData(entries) {
        super.__decodeData(entries);

        const samples = entries.samples;

        if(samples) {
            if(window.TextDecoder)
                this.__sampleSets = JSON.parse((new TextDecoder("utf-8")).decode(samples));
            else
                this.__sampleSets = JSON.parse(decodeText(samples));
        }
    }
    
    getSampleSets() {
        return this.__sampleSets;
    }
};

sgFactory.registerClass('EnvMap', EnvMap);


export {
    EnvMap
};