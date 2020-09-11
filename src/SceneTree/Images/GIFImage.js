/* eslint-disable prefer-promise-reject-errors */
import { Vec4 } from '../../Math/index'
import { loadBinfile } from '../Utils.js'
import { Registry } from '../../Registry'
import { FileImage } from './FileImage.js'

import { GIF } from '../../external/gifuct-js.js'
import { resourceLoader } from '../ResourceLoader.js'

import { NumberParameter, Vec4Parameter } from '../Parameters/index'
import { MathFunctions } from '../../Utilities/MathFunctions'

/**
 * Class representing a GIF image.
 *
 * ```
 * const image = new GIFImage()
 * image.getParameter('FilePath').setUrl("https://storage.googleapis.com/zea-playground-assets/zea-engine/texture.gif")
 * ```
 *
 * **Parameters**
 * * **StreamAtlasDesc:**
 * * **StreamAtlasIndex:**
 *
 * **Events**
 * * **loaded:** Triggered when the gif data is loaded.
 *
 * **File Types:** gif
 *
 * @extends FileImage
 */
class GIFImage extends FileImage {
  /**
   * Create a GIF image.
   * @param {string} name - The name value.
   * @param {string|object} filePath - The filePath value.
   * @param {object} params - The params value.
   */
  constructor(name, filePath = '', params = {}) {
    super(name, filePath, params)

    this.format = 'RGBA'
    this.type = 'UNSIGNED_BYTE'
    this.__streamAtlas = true
    // this.getParameter('FilePath').setSupportedExts('gif')

    this.addParameter(new Vec4Parameter('StreamAtlasDesc'))
    this.addParameter(new NumberParameter('StreamAtlasIndex', 0))

    const frameParam = this.getParameter('StreamAtlasIndex')
    frameParam.setRange([0, 1])

    let playing
    let frame = 0
    const incrementFrame = (numFrames) => {
      frameParam.setValue(frame)
      if (playing) setTimeout(() => incrementFrame(numFrames), this.getFrameDelay(frame))
      frame = (frame + 1) % numFrames
    }
    this.play = () => {
      this.__resourcePromise.then(() => {
        playing = true
        const numFrames = frameParam.getRange()[1]
        incrementFrame(numFrames)
      })
    }
    this.stop = () => {
      playing = false
    }
  }

  /**
   * The getFrameDelay method.
   * @param {number} index - The index value.
   * @return {number} - The return value.
   */
  getFrameDelay(index) {
    // Note: Frame delays are in centisecs (not millisecs which the timers will require.)
    return this.__unpackedData.frameDelays[index] * 10
  }

  /**
   * The __loadData method.
   * @param {object} fileDesc - The fileDesc value.
   * @private
   */
  __loadData(fileDesc) {
    // this.__streamAtlasDesc = new Vec4();

    const imageDataLibrary = FileImage.__imageDataLibrary()
    if (fileDesc.id in imageDataLibrary) {
      this.__resourcePromise = imageDataLibrary[fileDesc.id]
    } else {
      this.__resourcePromise = new Promise((resolve, reject) => {
        resourceLoader.addWork(fileDesc.id, 1)

        if (fileDesc.assets && fileDesc.assets.atlas) {
          const imageElem = new Image()
          imageElem.crossOrigin = 'anonymous'
          imageElem.src = fileDesc.assets.atlas.url
          imageElem.addEventListener('load', () => {
            resolve({
              width: fileDesc.assets.atlas.width,
              height: fileDesc.assets.atlas.height,
              atlasSize: fileDesc.assets.atlas.atlasSize,
              frameDelays: fileDesc.assets.atlas.frameDelays,
              frameRange: [0, fileDesc.assets.atlas.frameDelays.length],
              imageData: imageElem,
            })
            resourceLoader.addWorkDone(fileDesc.id, 1)
          })
          return
        }

        loadBinfile(
          fileDesc.url,
          (data) => {
            console.warn('Unpacking Gif client side:' + fileDesc.name)

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

              // Note: the server side library returns centisecs (1/100 second) for
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
              // this seems to work with Gifs featuring moving transparency.
              // For fully opaque gifs, we should avoid this.
              if (frame.disposalType == 2) gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height)

              gifCtx.drawImage(tempCanvas, dims.left, dims.top)

              atlasCtx.drawImage(gifCanvas, (index % atlasSize[0]) * width, Math.floor(index / atlasSize[0]) * height)
            }

            for (let i = 0; i < frames.length; i++) {
              // console.log(frame);
              renderFrame(frames[i], i)
            }
            resourceLoader.addWorkDone(fileDesc.id, 1)

            const imageData = atlasCtx.getImageData(0, 0, atlasCanvas.width, atlasCanvas.height)

            const ms = performance.now() - start
            console.log(`Decode GIF '${fileDesc.name}' time:` + ms)

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

      imageDataLibrary[fileDesc.id] = this.__resourcePromise
    }

    this.__resourcePromise.then((unpackedData) => {
      this.width = unpackedData.width
      this.height = unpackedData.height

      this.getParameter('StreamAtlasDesc').setValue(
        new Vec4(unpackedData.atlasSize[0], unpackedData.atlasSize[1], 0, 0)
      )
      this.getParameter('StreamAtlasIndex').setRange(unpackedData.frameRange)

      this.__unpackedData = unpackedData
      this.__data = unpackedData.imageData

      // ////////////////////////
      // Playback
      this.__loaded = true

      this.emit('loaded', {})
    })
  }
}

FileImage.registerLoader('gif', GIFImage)
Registry.register('GIFImage', GIFImage)

export { GIFImage }
