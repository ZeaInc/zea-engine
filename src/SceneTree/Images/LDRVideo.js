import { Registry } from '../../Registry'
import { resourceLoader } from '../ResourceLoader.js'

import { BooleanParameter, NumberParameter } from '../Parameters/index'

import { FileImage } from './FileImage.js'

/**
 * Class representing a LDR (low dynamic range) video.
 *
 * ```
 * const video = new LDRVideo()
 * video.getParameter('FilePath').setUrl("https://storage.googleapis.com/zea-playground-assets/zea-engine/video.mp4")
 * ```
 *
 * **Parameters**
 * * **Mute(`BooleanParameter`):** Mutes video volume.
 * * **Loop(`BooleanParameter`):** Repeats video over and over again.
 * * **Gain(`NumberParameter`):** Sets loudness of the video before going through any processing.
 * * **SpatializeAudio(`BooleanParameter`):** Enables/Disables spatial(Surrounding) audio.
 * * **refDistance(`NumberParameter`):** _todo_
 * * **maxDistance(`NumberParameter`):** _todo_
 * * **rolloffFactor(`NumberParameter`):** _todo_
 * * **coneInnerAngle(`NumberParameter`):** _todo_
 * * **coneOuterAngle(`NumberParameter`):** _todo_
 * * **coneOuterGain(`NumberParameter`):** _todo_
 *
 * **File Types:** mp4, ogg
 *
 * @extends FileImage
 */
class LDRVideo extends FileImage {
  /**
   * Create a LDR video.
   * @param {string} name - The name value.
   * @param {string} filePath - The filePath value.
   * @param {object} params - The params value.
   */
  constructor(name, filePath, params) {
    super(name, filePath, params)
    this.format = 'RGB'
    this.type = 'UNSIGNED_BYTE'

    this.addParameter(new BooleanParameter('Mute', false))
    this.addParameter(new BooleanParameter('Loop', true))
    this.addParameter(new NumberParameter('Gain', 2.0)).setRange([0, 5])
    this.addParameter(new BooleanParameter('SpatializeAudio', true))
    this.addParameter(new NumberParameter('refDistance', 2))
    this.addParameter(new NumberParameter('maxDistance', 10000))
    this.addParameter(new NumberParameter('rolloffFactor', 1))
    this.addParameter(new NumberParameter('coneInnerAngle', 360))
    this.addParameter(new NumberParameter('coneOuterAngle', 0))
    this.addParameter(new NumberParameter('coneOuterGain', 1))
  }

  /**
   * The __loadData method.
   * @param {object} fileDesc - The fileDesc value.
   * @private
   */
  __loadData(fileDesc) {
    resourceLoader.addWork(fileDesc.id, 1)

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
    videoElem.addEventListener(
      'loadedmetadata',
      () => {
        // videoElem.play();

        const muteParam = this.getParameter('Mute')
        videoElem.muted = muteParam.getValue()
        muteParam.on('valueChanged', () => {
          videoElem.muted = muteParam.getValue()
        })

        const loopParam = this.getParameter('Loop')
        videoElem.loop = loopParam.getValue()
        loopParam.on('valueChanged', () => {
          videoElem.loop = loopParam.getValue()
        })

        this.width = videoElem.videoHeight
        this.height = videoElem.videoWidth
        this.__data = videoElem
        this.__loaded = true
        resourceLoader.addWorkDone(fileDesc.id, 1)
        this.emit('loaded', {})

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
      false
    )
    videoElem.src = fileDesc.url
    // videoElem.load();
    const promise = videoElem.play()
    if (promise !== undefined) {
      promise
        .then((_) => {
          console.log('Autoplay started!')
          // Autoplay started!
        })
        .catch(() => {
          console.log('Autoplay was prevented.')
          // Autoplay was prevented.
          // Show a "Play" button so that user can start playback.
        })
    }
  }
}

FileImage.registerLoader('mp4|ogg', LDRVideo)
Registry.register('LDRVideo', LDRVideo)

export { LDRVideo }
