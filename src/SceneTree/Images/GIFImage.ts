/* eslint-disable prefer-promise-reject-errors */
import { Vec4 } from '../../Math/index'
import { loadBinfile } from '../Utils.js'
import { Registry } from '../../Registry'
import { FileImage } from './FileImage.js'

import { GIF } from '../../external/gifuct-js.js'
import { resourceLoader } from '../resourceLoader.js'

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
  __resourcePromise: any;
  __unpackedData: any;
  /**
   * Create a GIF image.
   * @param {string} name - The name value.
   * @param {string|object} filePath - The filePath value.
   * @param {object} params - The params value.
   */
  constructor(name: any, filePath = '', params = {}) {
    super(name, filePath, params)

    this.format = 'RGBA'
    this.type = 'UNSIGNED_BYTE'
    this.__streamAtlas = true
    // this.getParameter('FilePath').setSupportedExts('gif')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    this.addParameter(new Vec4Parameter('StreamAtlasDesc'))
    this.addParameter(new NumberParameter('StreamAtlasIndex', 0))

    const frameParam = this.getParameter('StreamAtlasIndex')
    frameParam.setRange([0, 1])

    let playing: any
    let frame = 0
    const incrementFrame = (numFrames: any) => {
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
  // @ts-expect-error ts-migrate(2425) FIXME: Class 'FileImage' defines instance member property... Remove this comment to see the full error message
  getFrameDelay(index: any) {
    // Note: Frame delays are in centisecs (not millisecs which the timers will require.)
    return this.__unpackedData.frameDelays[index] * 10
  }

  /**
   * The __loadData method.
   * @param {object} fileDesc - The fileDesc value.
   * @private
   */
  // @ts-expect-error ts-migrate(2416) FIXME: Property '__loadData' in type 'GIFImage' is not as... Remove this comment to see the full error message
  __loadData(fileDesc: any) {
    // this.__streamAtlasDesc = new Vec4();

    const imageDataLibrary = FileImage.__imageDataLibrary()
    if (fileDesc.id in imageDataLibrary) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
          (data: any) => {
            console.warn('Unpacking Gif client side:' + fileDesc.name)

            const start = performance.now()

            // Decompressing using: https://github.com/matt-way/gifuct-js
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
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

            let frameImageData: any
            const frameDelays: any = []
            const renderFrame = (frame: any, index: any) => {
              const dims = frame.dims

              // Note: the server side library returns centisecs (1/100 second) for
              // frame delays, so normalize here so that client and servers
              // valueus are in the
              frameDelays.push(frame.delay / 10)

              if (!frameImageData || dims.width != frameImageData.width || dims.height != frameImageData.height) {
                tempCanvas.width = dims.width
                tempCanvas.height = dims.height
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                frameImageData = tempCtx.createImageData(dims.width, dims.height)
              }

              // set the patch data as an override
              frameImageData.data.set(frame.patch)
              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              tempCtx.putImageData(frameImageData, 0, 0)

              // Note: undocumented disposal method.
              // See Ids here: https://github.com/theturtle32/Flash-Animated-GIF-Library/blob/master/AS3GifPlayer/src/com/worlize/gif/constants/DisposalType.as
              // From what I can gather, 2 means we should clear the background first.
              // this seems to work with Gifs featuring moving transparency.
              // For fully opaque gifs, we should avoid this.
              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              if (frame.disposalType == 2) gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height)

              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              gifCtx.drawImage(tempCanvas, dims.left, dims.top)

              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              atlasCtx.drawImage(gifCanvas, (index % atlasSize[0]) * width, Math.floor(index / atlasSize[0]) * height)
            }

            for (let i = 0; i < frames.length; i++) {
              // console.log(frame);
              renderFrame(frames[i], i)
            }
            resourceLoader.addWorkDone(fileDesc.id, 1)

            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
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
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(statusText: any) => void' is no... Remove this comment to see the full error message
          (statusText: any) => {
            const msg = 'Unable to Load URL:' + statusText + ':' + fileDesc.url
            console.warn(msg)
            reject(msg)
          }
        )
      })

      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      imageDataLibrary[fileDesc.id] = this.__resourcePromise
    }

    this.__resourcePromise.then((unpackedData: any) => {
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
