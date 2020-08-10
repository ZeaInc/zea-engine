import { Vec4, Color } from '../../Math/index'
import { loadBinfile } from '../Utils.js'
import Registry from '../../Registry'
import { BaseImage } from '../BaseImage.js'

import { GIF } from '../../external/gifuct-js.js'
import { resourceLoader } from '../ResourceLoader.js'
import { SystemDesc } from '../../SystemDesc.js'

import { BooleanParameter, NumberParameter, Vec4Parameter } from '../Parameters/index'
import { FilePathParameter } from '../Parameters/FilePathParameter'
import MathFunctions from '../../Utilities/MathFunctions'

const imageDataLibrary = {}

const imageLoaders = {}

const supportWebp = globalThis.navigator && navigator.userAgent.indexOf('Chrome') !== -1

/** Class representing a file image.
 * @extends BaseImage
 */
class FileImage extends BaseImage {
  /**
   * Create a file image.
   * @param {string} name - The name value.
   * @param {string} filePath - The filePath value.
   * @param {object} params - The params value.
   */
  constructor(name, filePath = '', params = {}) {
    if (filePath.constructor == Object) {
      params = filePath
    }
    if (name != undefined && name.lastIndexOf('.') != -1) {
      console.warn('Deprecated signature. Please provide a name and filepath to the image constructor')
      name = name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('.'))
    }

    super(name, params)

    this.__loaded = false

    const fileParam = this.addParameter(new FilePathParameter('FilePath'))
    fileParam.on('valueChanged', () => {
      this.loaded = false
      if (this.getName() == '') {
        // Generate a name from the file path.
        const stem = fileParam.getStem()
        const decorator = stem.substring(stem.length - 1)
        if (!isNaN(decorator)) {
          // Note: ALL image names have an LOD specifier at the end.
          // remove that off when retrieving the name.
          this.setName(stem.substring(0, stem.length - 1))
        } else {
          this.setName(stem)
        }
      }

      if (fileParam.getValue()) {
        this.__loadData()
      }
    })

    if (filePath && filePath != '') fileParam.setFilepath(filePath)
  }

  /**
   * The __imageDataLibrary method.
   * @return {any} - The return value.
   * @private
   */
  static __imageDataLibrary() {
    return imageDataLibrary
  }

  /**
   * The registerLoader method.
   * @param {any} exts - The exts param.
   * @param {any} loaderClass - The loaderClass param.
   */
  static registerLoader(exts, loaderClass) {
    imageLoaders[exts] = loaderClass
  }

  /**
   * The constructLoader method.
   * @param {any} file - The file value.
   * @param {any} loaderName - The loaderName value.
   * @return {any} - The return value.
   */
  static constructLoader(file, loaderName) {
    for (const exts of imageLoaders) {
      if (new RegExp('\\.(' + exts + ')$', 'i').test(file.name)) {
        const loader = new imageLoaders[exts](loaderName)
        if (loader) {
          loader.getParameter('FilePath').setValue(file.id)
          return loader
        }
      }
    }
  }

  /**
   * The __loadData method.
   * @private
   */
  __loadData() {
    const ext = this.getParameter('FilePath').get()
    if (ext == '.jpg' || ext == '.png' || ext == '.webp') {
      this.__loadLDRImage(ext)
    } else if (ext == '.mp4' || ext == '.ogg') {
      this.__loadLDRVideo()
      // } else if (ext == '.ldralpha') {
      //     this.__loadLDRAlpha(file, ext);
    } else if (ext == '.vlh') {
      this.__loadVLH()
    } else if (ext == '.gif') {
      this.__loadGIF()
    } else if (ext == '.svg') {
      console.warn('SVG Image not yet supported')
    } else {
      throw new Error('Unsupported file type. Check the ext:' + file)
    }
  }

  /**
   * The __loadLDRImage method.
   * @param {string} ext - The file extension.
   * @private
   */
  __loadLDRImage(ext) {
    const file = this.getParameter('FilePath').getFile()
    if (ext == '.jpg') {
      this.format = 'RGB'
    } else if (ext == '.png') {
      this.format = 'RGBA'
    }
    this.type = 'UNSIGNED_BYTE'
    let imageElem
    const loaded = () => {
      this.getDOMElement = () => {
        return imageElem
      }
      this.width = imageElem.width
      this.height = imageElem.height
      this.__data = imageElem
      this.__loaded = true
      this.emit('loaded', {})
    }
    if (file.id in imageDataLibrary) {
      imageElem = imageDataLibrary[file.id]
      if (imageElem.complete) {
        loaded()
      } else {
        imageElem.addEventListener('load', loaded)
      }
    } else {
      resourceLoader.addWork(file.id, 1)

      const prefSizeParam = this.addParameter(new NumberParameter('PreferredSize', -1))

      let url = file.url
      if (file.assets && Object.keys(file.assets).length > 0) {
        function chooseImage(params, filterAssets) {
          // Note: this is a filter to remove any corrupt data
          // generate by our broken server side processing system.
          filterAssets = filterAssets.filter((asset) => asset !== null)

          if (supportWebp) {
            const resultFilter = filterAssets.filter((asset) => asset.format === 'webp')

            if (resultFilter.length > 1) {
              filterAssets = resultFilter
            }
          } else {
            filterAssets = filterAssets.filter((asset) => asset.format !== 'webp')
          }

          if (params.maxSize) {
            filterAssets = filterAssets.filter((asset) => asset.w <= params.maxSize)
          }
          if (params.filter) {
            const resultFilter = filterAssets.filter((asset) => asset.url.indexOf(params.filter) !== -1)
            if (resultFilter.length > 1) {
              filterAssets = resultFilter
            }
          }
          if (params.prefSize) {
            filterAssets = filterAssets.map((asset) =>
              Object.assign(
                {
                  score: Math.abs(params.prefSize - asset.w),
                },
                asset
              )
            )

            // return low score, close to desire
            // return _.sortBy(score, "score")[0].option.url;
            filterAssets.sort((a, b) => (a.score > b.score ? 1 : a.score < b.score ? -1 : 0))
          }
          if (filterAssets.length > 0) return filterAssets[0]
        }
        const params = {
          maxSize: SystemDesc.gpuDesc.maxTextureSize,
        }
        const prefSize = prefSizeParam.getValue()
        if (prefSize == -1) {
          if (file.assets.reduce) params.prefSize = file.assets.reduce.w
        } else {
          params.prefSize = prefSize
        }
        const asset = chooseImage(params, Object.values(file.assets))
        if (asset) {
          console.log(
            'Selected image:' +
              file.name +
              ' format:' +
              asset.format +
              ' :' +
              asset.w +
              'x' +
              asset.h +
              ' url:' +
              asset.url
          )
          url = asset.url
        }
      } else {
        console.warn('Images not processed for this file:' + file.name)
      }

      imageElem = new Image()
      imageElem.crossOrigin = 'anonymous'
      imageElem.src = url

      imageElem.addEventListener('load', loaded)
      imageElem.addEventListener('load', () => {
        resourceLoader.addWorkDone(file.id, 1)
      })
      imageDataLibrary[file.id] = imageElem
    }
  }

  /**
   * The __removeVideoParams method.
   * @private
   */
  __removeVideoParams() {
    if (this.getParameterIndex('spatializeAudio')) {
      this.removeParameter(this.getParameterIndex('Loop'))
      this.removeParameter(this.getParameterIndex('spatializeAudio'))
      this.removeParameter(this.getParameterIndex('Gain'))
      this.removeParameter(this.getParameterIndex('refDistance'))
      this.removeParameter(this.getParameterIndex('maxDistance'))
      this.removeParameter(this.getParameterIndex('rolloffFactor'))
      this.removeParameter(this.getParameterIndex('coneInnerAngle'))
      this.removeParameter(this.getParameterIndex('coneOuterAngle'))
      this.removeParameter(this.getParameterIndex('coneOuterGain'))
    }
  }

  /**
   * The __loadLDRVideo method.
   * @param {string} ext - The file extension.
   * @private
   */
  __loadLDRVideo() {
    const file = this.getParameter('FilePath').getFile()
    this.format = 'RGB'
    this.type = 'UNSIGNED_BYTE'
    resourceLoader.addWork(file.id, 1)

    // Note: mute needs to be turned off by an action from the user.
    // Audio is disabled by default now in chrome.
    const muteParam = this.addParameter(new BooleanParameter('Mute', true))
    const loopParam = this.addParameter(new BooleanParameter('Loop', true))

    const videoElem = document.createElement('video')
    // TODO - confirm its necessary to add to DOM
    videoElem.style.display = 'none'
    videoElem.preload = 'auto'
    videoElem.crossOrigin = 'anonymous'
    // videoElem.crossorigin = true;

    this.getAudioSource = () => {
      return videoElem
    }

    document.body.appendChild(videoElem)
    videoElem.on(
      'loadedmetadata',
      () => {
        // videoElem.play();

        videoElem.muted = muteParam.getValue()
        muteParam.on('valueChanged', () => {
          videoElem.muted = muteParam.getValue()
        })
        videoElem.loop = loopParam.getValue()
        loopParam.on('valueChanged', () => {
          videoElem.loop = loopParam.getValue()
        })

        this.width = videoElem.videoHeight
        this.height = videoElem.videoWidth
        this.__data = videoElem
        this.__loaded = true
        resourceLoader.addWorkDone(file.id, 1)
        this.emit('loaded', {})

        videoElem.play().then(
          () => {
            let prevFrame = 0
            const frameRate = 29.97
            const timerCallback = () => {
              if (videoElem.paused || videoElem.ended) {
                return
              }
              // Check to see if the video has progressed to the next frame.
              // If so, then we emit and update, which will cause a redraw.
              const currentFrame = Math.floor(videoElem.currentTime * frameRate)
              if (prevFrame != currentFrame) {
                this.emit('updated', {})
                prevFrame = currentFrame
              }
              setTimeout(timerCallback, 20) // Sample at 50fps.
            }
            timerCallback()
          },
          (e) => {
            console.log('Autoplay was prevented.', e, e.message)
          }
        )
        // const promise = videoElem.play();
        // if (promise !== undefined) {
        //     promise.then(_ => {
        //         console.log("Autoplay started!")
        //         // Autoplay started!
        //     }).catch(error => {
        //         console.log("Autoplay was prevented.")
        //         // Autoplay was prevented.
        //         // Show a "Play" button so that user can start playback.
        //     });
        // }
      },
      false
    )
    videoElem.src = file.url
    // videoElem.load();
  }

  /**
   * The __loadVLH method.
   * @param {string} ext - The file extension.
   * @private
   */
  __loadVLH() {
    const file = this.getParameter('FilePath').getFile()
    this.type = 'FLOAT'

    let hdrtint = new Color(1, 1, 1, 1)
    // let stream = 'stream' in params ? params['stream'] : false;

    this.setHDRTint = (value) => {
      hdrtint = value
    }
    this.getHDRTint = () => {
      return hdrtint
    }

    resourceLoader.loadUrl(file.id, file.url, (entries) => {
      let ldr
      let cdm
      for (const name in entries) {
        if (name.endsWith('.jpg')) ldr = entries[name]
        else if (name.endsWith('.bin')) cdm = entries[name]
      }

      // ///////////////////////////////
      // Parse the data.
      const blob = new Blob([ldr.buffer])
      const ldrPic = new Image()
      ldrPic.onload = () => {
        this.width = ldrPic.width
        this.height = ldrPic.height
        // console.log(file.name + ": [" + this.width + ", " + this.height + "]");
        this.__data = {
          ldr: ldrPic,
          cdm: cdm,
        }
        if (!this.__loaded) {
          this.__loaded = true
          this.emit('loaded', {})
        } else {
          this.emit('updated', {})
        }
      }
      ldrPic.src = URL.createObjectURL(blob)
    })
  }

  /**
   * The __loadGIF method.
   * @param {string} ext - The file extension.
   * @private
   */
  __loadGIF() {
    const file = this.getParameter('FilePath').getFile()
    this.format = 'RGBA'
    this.type = 'UNSIGNED_BYTE'
    this.__streamAtlas = true

    // this.__streamAtlasDesc = new Vec4();
    this.addParameter(new Vec4Parameter('StreamAtlasDesc', new Vec4()))
    this.addParameter(new NumberParameter('StreamAtlasIndex', 0)).setRange([0, 1])

    this.getFrameDelay = () => {
      return 20
    }
    let playing
    let incrementFrame
    this.play = () => {
      resourcePromise.then(() => {
        playing = true
        if (incrementFrame) incrementFrame()
      })
    }
    this.stop = () => {
      playing = false
    }
    let resourcePromise
    if (file.id in imageDataLibrary) {
      resourcePromise = imageDataLibrary[file.id]
    } else {
      resourcePromise = new Promise((resolve, reject) => {
        resourceLoader.addWork(file.id, 1)

        if (file.assets && file.assets.atlas) {
          const imageElem = new Image()
          imageElem.crossOrigin = 'anonymous'
          imageElem.src = file.assets.atlas.url
          imageElem.addEventListener('load', () => {
            resolve({
              width: file.assets.atlas.width,
              height: file.assets.atlas.height,
              atlasSize: file.assets.atlas.atlasSize,
              frameDelays: file.assets.atlas.frameDelays,
              frameRange: [0, file.assets.atlas.frameDelays.length],
              imageData: imageElem,
            })
            resourceLoader.addWorkDone(file.id, 1)
          })
          return
        }

        loadBinfile(
          file.url,
          (data) => {
            console.warn('Unpacking Gif client side:' + file.name)

            const start = performance.now()

            // Decompressing using: https://github.com/matt-way/gifuct-js
            const gif = new GIF(data)
            const frames = gif.decompressFrames(true)

            // do something with the frame data
            const sideLength = Math.sqrt(frames.length)
            const atlasSize = [sideLength, sideLength]
            if (MathFunctions.fract(sideLength) > 0.0) {
              atlasSize[0] = Math.floor(atlasSize[0] + 1)
              if (MathFunctions.fract(sideLength) > 0.5) {
                atlasSize[1] = Math.floor(atlasSize[1] + 1)
              } else {
                atlasSize[1] = Math.floor(atlasSize[1])
              }
            }

            const width = frames[0].dims.width
            const height = frames[0].dims.height

            // gif patch canvas
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            // full gif canvas
            const gifCanvas = document.createElement('canvas')
            const gifCtx = gifCanvas.getContext('2d')

            gifCanvas.width = width
            gifCanvas.height = height

            // The atlas for all the frames.
            const atlasCanvas = document.createElement('canvas')
            const atlasCtx = atlasCanvas.getContext('2d')
            atlasCanvas.width = atlasSize[0] * width
            atlasCanvas.height = atlasSize[1] * height

            let frameImageData
            const frameDelays = []
            const renderFrame = (frame, index) => {
              const dims = frame.dims

              // Note: the server side library returns centisecs for
              // frame delays, so normalize here so that client and servers
              // valueus are in the
              frameDelays.push(frame.delay / 10)

              if (!frameImageData || dims.width != frameImageData.width || dims.height != frameImageData.height) {
                tempCanvas.width = dims.width
                tempCanvas.height = dims.height
                frameImageData = tempCtx.createImageData(dims.width, dims.height)
              }

              // set the patch data as an override
              frameImageData.data.set(frame.patch)
              tempCtx.putImageData(frameImageData, 0, 0)

              // Note: undocumented disposal method.
              // See Ids here: https://github.com/theturtle32/Flash-Animated-GIF-Library/blob/master/AS3GifPlayer/src/com/worlize/gif/constants/DisposalType.as
              // From what I can gather, 2 means we should clear the background first.
              // this seems towork with Gifs featuring moving transparency.
              // For fully opaque gifs, we should avoid this.
              if (frame.disposalType == 2) gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height)

              gifCtx.drawImage(tempCanvas, dims.left, dims.top)

              atlasCtx.drawImage(gifCanvas, (index % atlasSize[0]) * width, Math.floor(index / atlasSize[0]) * height)
            }

            for (let i = 0; i < frames.length; i++) {
              // console.log(frame);
              renderFrame(frames[i], i)
            }
            resourceLoader.addWorkDone(file.id, 1)

            const imageData = atlasCtx.getImageData(0, 0, atlasCanvas.width, atlasCanvas.height)

            const ms = performance.now() - start
            console.log(`Decode GIF '${file.name}' time:` + ms)

            resolve({
              width: atlasCanvas.width,
              height: atlasCanvas.height,
              atlasSize,
              frameRange: [0, frames.length],
              frameDelays,
              imageData,
            })
          },
          (statusText) => {
            const msg = 'Unable to Load URL:' + statusText + ':' + fileDesc.url
            console.warn(msg)
            reject(msg)
          }
        )
      })

      imageDataLibrary[file.id] = resourcePromise
    }

    resourcePromise.then((unpackedData) => {
      this.width = unpackedData.width
      this.height = unpackedData.height

      this.getParameter('StreamAtlasDesc').setValue(
        new Vec4(unpackedData.atlasSize[0], unpackedData.atlasSize[1], 0, 0)
      )
      this.getParameter('StreamAtlasIndex').setRange(unpackedData.frameRange)

      this.__data = unpackedData.imageData

      this.getFrameDelay = (index) => {
        // Note: Frame delays are in centisecs (not millisecs which the timers will require.)
        return unpackedData.frameDelays[index] * 10
      }

      // ////////////////////////
      // Playback
      const frameParam = this.getParameter('StreamAtlasIndex')
      const numFrames = frameParam.getRange()[1]
      let frame = 0
      incrementFrame = () => {
        frameParam.setValue(frame)
        if (playing) setTimeout(incrementFrame, this.getFrameDelay(frame))
        frame = (frame + 1) % numFrames
      }
      if (playing) incrementFrame()
      this.__loaded = true

      this.emit('loaded', {})
    })
  }

  /**
   * The isStream method.
   * @return {boolean} - The return value.
   */
  isStream() {
    return false
  }

  /**
   * The isLoaded method.
   * @return {any} - The return value.
   */
  isLoaded() {
    return this.__loaded
  }

  /**
   * The getParams method.
   * @return {any} - The return value.
   */
  getParams() {
    const params = super.getParams()
    if (this.__loaded) {
      params['data'] = this.__data
    }
    return params
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   */
  toJSON(context) {}

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} json - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(json, context) {}

  /**
   * The readBinary method.
   * @param {object} reader - The reader param.
   * @param {object} context - The context param.
   */
  readBinary(reader, context) {
    // super.readBinary(reader, context);
    this.setName(reader.loadStr())

    let filePath = reader.loadStr()
    if (typeof filePath === 'string' && filePath != '') {
      if (context.lod >= 0) {
        const suffixSt = filePath.lastIndexOf('.')
        if (suffixSt != -1) {
          const lodPath = filePath.substring(0, suffixSt) + context.lod + filePath.substring(suffixSt)
          if (resourceLoader.resolveFilepath(lodPath)) {
            filePath = lodPath
          }
        }
      }
      this.getParameter('FilePath').setFilepath(filePath)
    }
  }
}

/** Class representing a 2D file image.
 * @extends FileImage
 */
class FileImage2D extends FileImage {
  /**
   * Create a file image 2D.
   * @param {any} filePath - The filePath value.
   * @param {any} params - The params value.
   */
  constructor(filePath, params = {}) {
    console.warn('FileImage2D is becoming deprecated in favor of simple FileImage')
    super(filePath, params)
  }
}

Registry.register('FileImage2D', FileImage)
Registry.register('FileImage', FileImage)

export { FileImage, FileImage2D }
