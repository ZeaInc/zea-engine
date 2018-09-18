import {
    Vec4,
    Color
} from '../../Math';
import {
    Async,
    Signal
} from '../../Utilities';
import {
    loadBinfile
} from '../Utils.js';
import {
    sgFactory
} from '../SGFactory.js';
import {
    BaseImage
} from '../BaseImage.js';

import {
    GIF
} from '../../external/gifuct-js.js';
import {
    resourceLoader
} from '../ResourceLoader.js';
import {
    SystemDesc
} from '../../BrowserDetection.js';

import {
    BooleanParameter,
    NumberParameter,
    Vec4Parameter,
    FilePathParameter,
    ParameterSet
} from '../Parameters';

const imageDataLibrary = {};

const imageLoaders = {};

const supportWebp = navigator.userAgent.indexOf("Chrome") !== -1; // || navigator.userAgent.indexOf("Samsung");

class FileImage extends BaseImage {
    constructor(name, filePath='', params = {}) {

        if(filePath.constructor == Object){
            params = filePath;
        }
        let filepath;
        if (name.lastIndexOf('.') != -1) {
            filepath = name;
            name = name.substring(name.lastIndexOf('/')+1, name.lastIndexOf('.'));
        }

        super(name, params);

        this.__loaded = false;

        const fileParam = this.addParameter(new FilePathParameter('FilePath'));
        fileParam.valueChanged.connect(() => {
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

            const fileDesc = fileParam.getFileDesc();
            if(fileDesc) {
                this.__loadData( fileDesc);
            }
        });
        
        if (filePath && filePath != '')
            fileParam.setFilepath(filePath);
    }


    __loadData(fileDesc) {

        const ext = this.getParameter('FilePath').getExt();
        if (ext == '.jpg' || ext == '.png' || ext == '.webp') {
            this.__loadLDRImage(fileDesc, ext);
        } else if (ext == '.mp4' || ext == '.ogg') {
            this.__loadLDRVideo(fileDesc, ext);
            // } else if (ext == '.ldralpha') {
            //     this.__loadLDRAlpha(fileDesc, ext);
        } else if (ext == '.vlh') {
            this.__loadVLH(fileDesc, ext);
        } else if (ext == '.gif') {
            this.__loadGIF(fileDesc, ext);
        } else {
            throw ("Unsupported file type. Check the ext:" + fileDesc);
        }
    }

    __loadLDRImage(fileDesc, ext) {
        if (ext == '.jpg') {
            this.format = 'RGB';
        } else if (ext == '.png') {
            this.format = 'RGBA';
        }
        this.type = 'UNSIGNED_BYTE';
        let imageElem;
        const loaded = () => {
            this.getDOMElement = ()=>{
                return imageElem;
            }
            this.width = imageElem.width;
            this.height = imageElem.height;
            this.__data = imageElem;
            this.__loaded = true;
            this.loaded.emit();
        };
        if (fileDesc.id in imageDataLibrary) {
            imageElem = imageDataLibrary[fileDesc.id];
            if (imageElem.complete) {
                loaded()
            } else {
                imageElem.addEventListener("load", loaded);
            }
        } else {
            resourceLoader.addWork(fileDesc.id, 1);

        const prefSizeParam = this.addParameter(new NumberParameter('PreferredSize', -1));

        let url = fileDesc.url;
        if (fileDesc.assets && Object.keys(fileDesc.assets).length > 0) {
                function chooseImage(params, filterAssets) {

                    // Note: this is a filter to remove any corrupt data
                    // generate by our broken server side processing system.
                    filterAssets = filterAssets.filter(
                        asset => asset !== null
                    );

                    if (supportWebp) {
                        const resultFilter = filterAssets.filter(
                            asset => asset.format === "webp"
                        );

                        if (resultFilter.length > 1) {
                            filterAssets = resultFilter;
                        }
                    } else {
                        filterAssets = filterAssets.filter(
                            asset => asset.format !== "webp"
                        );
                    }

                    if (params.maxSize) {
                        filterAssets = filterAssets.filter(
                            asset => asset.w <= params.maxSize
                        );
                    }
                    if (params.filter) {
                        const resultFilter = filterAssets.filter(
                            asset => asset.url.indexOf(params.filter) !== -1
                        );
                        if (resultFilter.length > 1) {
                            filterAssets = resultFilter;
                        }
                    }
                    if (params.prefSize) {
                        filterAssets = filterAssets.map(asset => Object.assign({
                            score: Math.abs(params.prefSize - asset.w)
                        }, asset));

                        // return low score, close to desire
                        // return _.sortBy(score, "score")[0].option.url;
                        filterAssets.sort((a, b) => (a.score > b.score) ? 1 : ((a.score < b.score) ? -1 : 0));
                    }
                    if (filterAssets.length > 0)
                        return filterAssets[0];
                }
                const params = {
                    maxSize: SystemDesc.gpuDesc.maxTextureSize
                };
                let prefSize = prefSizeParam.getValue();
                if (prefSize == -1) {
                    if (fileDesc.assets.reduce)
                        params.prefSize = fileDesc.assets.reduce.w;
                } else {
                    params.prefSize = prefSize;
                }
                const asset = chooseImage(params, Object.values(fileDesc.assets));
                if (asset) {
                    console.log("Selected image:" + fileDesc.name + " format:" + asset.format + " :" + asset.w + "x" + asset.h  + " url:" + asset.url);
                    url = asset.url;
                }
            }
            else {
                console.warn("Images not processed for this file:" + fileDesc.name);
            }

            imageElem = new Image();
            imageElem.crossOrigin = 'anonymous';
            imageElem.src = url;

            imageElem.addEventListener("load", loaded);
            imageElem.addEventListener("load", () => {
                resourceLoader.addWorkDone(fileDesc.id, 1);
            });
            imageDataLibrary[fileDesc.id] = imageElem;
        }
    }

    __removeVideoParams() {
        if (this.getParameterIndex('spatializeAudio')) {
            this.removeParameter(this.getParameterIndex('Loop'));
            this.removeParameter(this.getParameterIndex('spatializeAudio'));
            this.removeParameter(this.getParameterIndex('Gain'));
            this.removeParameter(this.getParameterIndex('refDistance'));
            this.removeParameter(this.getParameterIndex('maxDistance'));
            this.removeParameter(this.getParameterIndex('rolloffFactor'));
            this.removeParameter(this.getParameterIndex('coneInnerAngle'));
            this.removeParameter(this.getParameterIndex('coneOuterAngle'));
            this.removeParameter(this.getParameterIndex('coneOuterGain'));
        }
    }

    __loadLDRVideo(fileDesc, ext) {
        this.format = 'RGB';
        this.type = 'UNSIGNED_BYTE';
        resourceLoader.addWork(fileDesc.id, 1);

        const muteParam = this.addParameter(new BooleanParameter('Mute', false));
        const loopParam = this.addParameter(new BooleanParameter('Loop', true));
        const GainParam = this.addParameter(new NumberParameter('Gain', 2.0)).setRange([0, 5]);
        const spatializeAudioParam = this.addParameter(new BooleanParameter('SpatializeAudio', true));
        const refDistanceParam = this.addParameter(new NumberParameter('refDistance', 2));
        const maxDistanceParam = this.addParameter(new NumberParameter('maxDistance', 10000));
        const rolloffFactorParam = this.addParameter(new NumberParameter('rolloffFactor', 1));
        const coneInnerAngleParam = this.addParameter(new NumberParameter('coneInnerAngle', 360));
        const coneOuterAngleParam = this.addParameter(new NumberParameter('coneOuterAngle', 0));
        const coneOuterGainParam = this.addParameter(new NumberParameter('coneOuterGain', 1))

        const videoElem = document.createElement('video');
        // TODO - confirm its necessary to add to DOM
        videoElem.style.display = 'none';
        videoElem.preload = 'auto';
        videoElem.crossOrigin = 'anonymous';
        // videoElem.crossorigin = true;

        this.getAudioSource = ()=>{
            return videoElem;
        }
            
        document.body.appendChild(videoElem);
        videoElem.addEventListener('loadedmetadata', () => {
            // videoElem.play();

            videoElem.muted = muteParam.getValue();
            muteParam.valueChanged.connect(() => {
                videoElem.muted = muteParam.getValue();
            });
            videoElem.loop = loopParam.getValue();
            loopParam.valueChanged.connect(() => {
                videoElem.loop = loopParam.getValue();
            });

            this.width = videoElem.videoHeight;
            this.height = videoElem.videoWidth;
            this.__data = videoElem;
            this.__loaded = true;
            resourceLoader.addWorkDone(fileDesc.id, 1);
            this.loaded.emit(videoElem);

            let prevFrame = 0;
            const frameRate = 29.97;
            const timerCallback = () => {
                if (videoElem.paused || videoElem.ended) {
                    return;
                }
                // Check to see if the video has progressed to the next frame. 
                // If so, then we emit and update, which will cause a redraw.
                const currentFrame = Math.floor(videoElem.currentTime * frameRate);
                if (prevFrame != currentFrame) {
                    this.updated.emit();
                    prevFrame = currentFrame;
                }
                setTimeout(timerCallback, 20); // Sample at 50fps.
            };
            timerCallback();

        }, false);
        videoElem.src = fileDesc.url;
        //videoElem.load();
        const promise = videoElem.play();
        if (promise !== undefined) {
            promise.then(_ => {
                console.log("Autoplay started!")
                // Autoplay started!
            }).catch(error => {
                console.log("Autoplay was prevented.")
                // Autoplay was prevented.
                // Show a "Play" button so that user can start playback.
            });
        }
    }

    __loadVLH(fileDesc, ext) {
        this.type = 'FLOAT';

        let hdrexposure = 1.0;
        let hdrtint = new Color(1, 1, 1, 1);
        // let stream = 'stream' in params ? params['stream'] : false;

        this.setHDRTint = (value) => {
            hdrtint = value;
        }
        this.getHDRTint = () => {
            return hdrtint;
        }

        resourceLoader.loadURL(fileDesc.id, fileDesc.url, (entries) => {
            let ldr, cdm;
            for (let name in entries) {
                if (name.endsWith('.jpg'))
                    ldr = entries[name];
                else if (name.endsWith('.bin'))
                    cdm = entries[name];
            }

            /////////////////////////////////
            // Parse the data.
            const blob = new Blob([ldr.buffer]);
            const ldrPic = new Image();
            ldrPic.onload = () => {
                this.width = ldrPic.width;
                this.height = ldrPic.height;
                // console.log(fileDesc.name + ": [" + this.width + ", " + this.height + "]");
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
        });
    }


    __loadGIF(fileDesc, ext) {

        this.format = 'RGBA';
        this.type = 'UNSIGNED_BYTE';
        this.__streamAtlas = true;

        // this.__streamAtlasDesc = new Vec4();
        this.addParameter(new Vec4Parameter('StreamAtlasDesc', new Vec4()));
        this.addParameter(new NumberParameter('StreamAtlasIndex', 0));
        this.getParameter('StreamAtlasIndex').setRange([0, 1]);

        this.getFrameDelay = (index) => {
            return 20;
        }
        let playing;
        let incrementFrame;
        this.play = () => {
            playing = true;
            if (incrementFrame)
                incrementFrame();
        }
        this.stop = () => {
            playing = false;
        }
        let resourcePromise;
        if (fileDesc.id in imageDataLibrary) {
            resourcePromise = imageDataLibrary[fileDesc.id];
        } else {
            resourcePromise = new Promise((resolve, reject) => {
                resourceLoader.addWork(fileDesc.id, 1);

                if(fileDesc.assets && fileDesc.assets.atlas) {
                    const image = new Image();
                    image.crossOrigin = 'anonymous';
                    image.src = fileDesc.assets.atlas.url;
                    image.addEventListener("load", () => {
                        resolve({
                            width: fileDesc.assets.atlas.width,
                            height: fileDesc.assets.atlas.height,
                            atlasSize: fileDesc.assets.atlas.atlasSize,
                            frameDelays: fileDesc.assets.atlas.frameDelays,
                            frameRange: [0, fileDesc.assets.atlas.frameDelays.length],
                            imageData: image
                        });
                        resourceLoader.addWorkDone(fileDesc.id, 1);
                    });
                    return;
                }

                loadBinfile(fileDesc.url, (data) => {
                    console.warn("Unpacking Gif client side:" + fileDesc.name)

                    const start = performance.now();

                    // Decompressing using: https://github.com/matt-way/gifuct-js
                    const gif = new GIF(data);
                    const frames = gif.decompressFrames(true);

                    // do something with the frame data
                    const sideLength = Math.sqrt(frames.length);
                    const atlasSize = [sideLength, sideLength];
                    if (Math.fract(sideLength) > 0.0) {
                        atlasSize[0] = Math.floor(atlasSize[0] + 1);
                        if (Math.fract(sideLength) > 0.5) {
                            atlasSize[1] = Math.floor(atlasSize[1] + 1);
                        } else {
                            atlasSize[1] = Math.floor(atlasSize[1]);
                        }
                    }

                    const width = frames[0].dims.width;
                    const height = frames[0].dims.height;

                    // gif patch canvas
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    // full gif canvas
                    const gifCanvas = document.createElement('canvas');
                    const gifCtx = gifCanvas.getContext('2d');

                    gifCanvas.width = width;
                    gifCanvas.height = height;

                    // The atlas for all the frames.
                    const atlasCanvas = document.createElement('canvas');
                    const atlasCtx = atlasCanvas.getContext('2d');
                    atlasCanvas.width = atlasSize[0] * width;
                    atlasCanvas.height = atlasSize[1] * height;

                    let frameImageData;
                    const frameDelays = [];
                    const renderFrame = (frame, index) => {
                        const dims = frame.dims;

                        // Note: the server side library returns centisecs for 
                        // frame delays, so normalize here so that client and servers
                        // valueus are in the 
                        frameDelays.push(frame.delay / 10);

                        if (!frameImageData || dims.width != frameImageData.width || dims.height != frameImageData.height) {
                            tempCanvas.width = dims.width;
                            tempCanvas.height = dims.height;
                            frameImageData = tempCtx.createImageData(dims.width, dims.height);
                        }

                        // set the patch data as an override    
                        frameImageData.data.set(frame.patch);
                        tempCtx.putImageData(frameImageData, 0, 0);

                        // Note: undocumented disposal method.
                        // See Ids here: https://github.com/theturtle32/Flash-Animated-GIF-Library/blob/master/AS3GifPlayer/src/com/worlize/gif/constants/DisposalType.as
                        // From what I can gather, 2 means we should clear the background first. 
                        // this seems towork with Gifs featuring moving transparency.
                        // For fully opaque gifs, we should avoid this.
                        if (frame.disposalType == 2)
                            gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height);

                        gifCtx.drawImage(tempCanvas, dims.left, dims.top);

                        atlasCtx.drawImage(gifCanvas, (index % atlasSize[0]) * width, Math.floor(index / atlasSize[0]) * height);
                    }

                    for (let i = 0; i < frames.length; i++) {
                        // console.log(frame);
                        renderFrame(frames[i], i);
                    }
                    resourceLoader.addWorkDone(fileDesc.id, 1);

                    const imageData = atlasCtx.getImageData(0, 0, atlasCanvas.width, atlasCanvas.height);

                    const ms = performance.now() - start;
                    console.log(`Decode GIF '${fileDesc.name}' time:` + ms);

                    resolve({
                        width: atlasCanvas.width,
                        height: atlasCanvas.height,
                        atlasSize,
                        frameRange: [0, frames.length],
                        frameDelays,
                        imageData
                    });

                }, (statusText) => {
                    console.warn("Unable to Load URL:" + statusText + ":" + fileDesc.url);
                    reject();
                });
            });

            imageDataLibrary[fileDesc.id] = resourcePromise;
        }

        // Make the resolve asynchronous so that the function returns.
        // (Chrome started generating errors because the 'onload' callback took to long to return.)
        setTimeout(() => {
            resourcePromise.then((unpackedData) => {

                this.width = unpackedData.width;
                this.height = unpackedData.height;

                this.getParameter('StreamAtlasDesc').setValue(new Vec4(unpackedData.atlasSize[0], unpackedData.atlasSize[1], 0, 0));
                this.getParameter('StreamAtlasIndex').setRange(unpackedData.frameRange);

                this.__data = unpackedData.imageData;

                this.getFrameDelay = (index) => {
                    // Note: Frame delays are in centisecs (not millisecs which the timers will require.)
                    return unpackedData.frameDelays[index] * 10;
                }

                //////////////////////////
                // Playback
                const frameParam = this.getParameter('StreamAtlasIndex');
                const numFrames = frameParam.getRange()[1];
                let frame = 0;
                incrementFrame = () => {
                    frameParam.setValue(frame);
                    if (playing)
                        setTimeout(incrementFrame, this.getFrameDelay(frame));
                    frame = (frame + 1) % numFrames;
                }
                if (playing)
                    incrementFrame();
                this.__loaded = true;

                this.loaded.emit();
            });
        }, 1)
    }

    getFilepath() {
        return this.getParameter('FilePath').getValue();
    }

    isStream() {
        return false;
    }

    isLoaded() {
        return this.__loaded;
    }

    getParams() {
        let params = super.getParams();
        if (this.__loaded) {
            params['data'] = this.__data;
        }
        return params;
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

        let filePath = reader.loadStr();
        if (typeof filePath === 'string' && filePath != "") {
            if (context.lod >= 0) {
                const suffixSt = filePath.lastIndexOf('.')
                if (suffixSt != -1) {
                    const lodPath = filePath.substring(0, suffixSt) + context.lod + filePath.substring(suffixSt);
                    if (resourceLoader.resolveFilepath(lodPath)) {
                        filePath = lodPath;
                    }
                }
            }
            this.getParameter('FilePath').setFilepath(filePath);

        }
    }

    //////////////////////////////////////////
    // Static Methods

    static __imageDataLibrary() {
        return imageDataLibrary
    }

    static registerLoader(exts, loaderClass) {
        imageLoaders[exts] = loaderClass;
    }

    static constructLoader(file, loaderName) {
        for(let exts of imageLoaders) {
            if((new RegExp('\\.('+exts+')$', "i")).test(file.name)){
                const loader = new imageLoaders[exts](loaderName);
                if(loader) {
                    loader.getParameter('FilePath').setValue(file.id);
                    return loader;
                }
            }
        }
    }
};


class FileImage2D extends FileImage {
    constructor(filePath, params = {}) {
        console.warn("FileImage2D is becoming deprecated in favor of simple FileImage")
        super(filePath, params);

    }
}

sgFactory.registerClass('FileImage2D', FileImage);
sgFactory.registerClass('FileImage', FileImage);


export {
    FileImage,
    FileImage2D
};