import { GLPass, PassType } from './GLPass.js'
import { GLRenderer } from '../GLRenderer.js'

import { AudioItem, GeomItem } from '../../SceneTree/index'

const AudioContext =
  window.navigator &&
  (window.AudioContext || // Default
    window.webkitAudioContext || // Safari and old versions of Chrome
    false)

let audioCtx
if (AudioContext) {
  // Do whatever you want using the Web Audio API
  audioCtx = new AudioContext()
  // ...
} else if (window.navigator) {
  // Web Audio API is not supported
  // Alert the user
  alert(
    'Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox'
  )
}

/** Class representing a GL audio items pass.
 * @extends GLPass
 */
class GLAudioItemsPass extends GLPass {
  /**
   * Create a GL audio items pass.
   */
  constructor() {
    super()
    this.__audioItems = []
  }

  /**
   * The init method.
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)

    if (!audioCtx) return
  }

  /**
   * The itemAddedToScene method is called on each pass when a new item
   * is added to the scene, and the renderer must decide how to render it.
   * It allows Passes to select geometries to handle the drawing of.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * The object contains a parameter 'continueInSubTree', which can be set to false,
   * so the subtree of this node will not be traversed after this node is handled.
   * @return {Boolean} - The return value.
   */
  itemAddedToScene(treeItem, rargs) {
    if (treeItem instanceof AudioItem) {
      treeItem.on('audioSourceCreated', (event) => {
        const { audioSource } = event
        this.addAudioSource(treeItem, audioSource, treeItem)
      })
      return true
    }
    if (treeItem instanceof GeomItem) {
      const material = treeItem.getParameter('Material').getValue()
      if (material) {
        const baseColorParam = material.getParameter('BaseColor')
        if (baseColorParam && baseColorParam.getImage && baseColorParam.getImage()) {
          const image = baseColorParam.getImage()
          image.on('loaded', () => {
            if (image.getAudioSource) {
              const audioSource = image.getAudioSource()
              if (audioSource instanceof HTMLMediaElement || audioSource instanceof AudioBufferSourceNode)
                this.addAudioSource(treeItem, audioSource, image)
            }
          })
        }
      }
      // Let other passes handle this item.
      return false
    }
  }
  /**
   * The itemRemovedFromScene method is called on each pass when aa item
   * is removed to the scene, and the pass must handle cleaning up any resources.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * @return {Boolean} - The return value.
   */
  itemRemovedFromScene(treeItem, rargs) {}

  /**
   * The addAudioSource method.
   * @param {any} treeItem - The treeItem value.
   * @param {any} audioSource - The audioSource value.
   * @param {any} parameterOwner - The parameterOwner value.
   */
  addAudioSource(treeItem, audioSource, parameterOwner) {
    if (audioSource.addedToCollector) return

    let source
    if (audioSource instanceof HTMLMediaElement) source = audioCtx.createMediaElementSource(audioSource)
    else if (audioSource instanceof AudioBufferSourceNode) source = audioSource
    else source = audioCtx.createMediaStreamSource(audioSource)

    const connectVLParamToAudioNodeParam = (vlParam, param) => {
      if (!vlParam) return
      // Note: setting the gain has no effect. Not sure what to do.
      // param.value = vlParam.getValue();
      param.setValueAtTime(vlParam.getValue(), 0)
      param.setValueAtTime(vlParam.getValue(), 5)
      vlParam.on('valueChanged', () => {
        // param.setTargetAtTime(vlParam.getValue(), audioCtx.currentTime);
        param.value = vlParam.getValue()
      })
    }

    const gainNode = audioCtx.createGain()
    const gainParam = parameterOwner.getParameter('Gain')
    if (gainParam) {
      connectVLParamToAudioNodeParam(gainParam, gainNode.gain)
    }

    'gasource', inNode

    const spatializeParam = parameterOwner.getParameter('SpatializeAudio')
    if (spatializeParam && spatializeParam.getValue() == false) {
      'ausource', dioCtx.destination
    } else {
      const panner = audioCtx.createPanner()
      panner.panningModel = 'HRTF'
      panner.distanceModel = 'inverse'('pasource', nner)('aupanner', dioCtx.destination)

      const connectVLParamToAudioNode = (paramName) => {
        const vlParam = parameterOwner.getParameter(paramName)
        if (!vlParam) return
        panner[paramName] = vlParam.getValue()
        vlParam.on('valueChanged', () => {
          panner[paramName] = vlParam.getValue()
        })
      }

      // connectVLParamToAudioNode('refDistance');
      // connectVLParamToAudioNode('maxDistance');
      // connectVLParamToAudioNode('rolloffFactor');
      connectVLParamToAudioNode('coneInnerAngle')
      connectVLParamToAudioNode('coneOuterAngle')
      connectVLParamToAudioNode('coneOuterGain')

      const updatePannerNodePosition = () => {
        // Note: the new audio params are reccomended to be used, but cause audio stutter.
        // ITs as if when we set the value, it is set for only a brief moment in time, and
        // then reverts back to the previous value.
        // Note: I downloaded and messed with the 'RoomOfMetal' demo here, and found
        // that I could not move the listener using the reccommended approach (setting values on the AudioParams.)
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/setPosition

        let mat4
        if (treeItem instanceof GeomItem) mat4 = treeItem.getGeomMat4()
        else mat4 = treeItem.getParameter('GlobalXfo').getValue().toMat4()
        const tr = mat4.translation
        // if (panner.positionX) {
        //     // panner.positionX.setTargetAtTime(xfo.tr.x, audioCtx.currentTime);
        //     // panner.positionY.setTargetAtTime(xfo.tr.y, audioCtx.currentTime);
        //     // panner.positionZ.setTargetAtTime(xfo.tr.z, audioCtx.currentTime);
        //     panner.positionX.value = xfo.tr.x;
        //     panner.positionY.value = xfo.tr.y;
        //     panner.positionZ.value = xfo.tr.z;
        // } else {
        panner.setPosition(tr.x, tr.y, tr.z)
        // }

        const dir = mat4.zAxis
        // if (panner.orientationX) {
        //     // panner.orientationX.setTargetAtTime(dir.x, audioCtx.currentTime);
        //     // panner.orientationY.setTargetAtTime(dir.y, audioCtx.currentTime);
        //     // panner.orientationZ.setTargetAtTime(dir.z, audioCtx.currentTime);
        //     panner.orientationX.value = dir.x;
        //     panner.orientationY.value = dir.y;
        //     panner.orientationZ.value = dir.z;
        // } else {
        panner.setOrientation(dir.x, dir.y, dir.z)
        // }

        // TODO:
        // setVelocity()
      }
      updatePannerNodePosition()
      treeItem.on('globalXfoChanged', (event) => {
        updatePannerNodePosition()
      })
    }

    audioSource.addedToCollector = true
    this.__audioItems.push({
      treeItem,
      audioSource,
      parameterOwner,
    })

    this.emit('updated', {})
  }

  /**
   * The __updateListenerPosition method.
   * @param {any} viewXfo - The viewXfo value.
   * @private
   */
  __updateListenerPosition(viewXfo) {
    if (!audioCtx) return

    // Note: the new audio params are reccomended to be used, but cause audio stutter.
    // ITs as if when we set the value, it is set for only a brief moment in time, and
    // then reverts back to the previous value.
    // Note: I downloaded and messed with the 'RoomOfMetal' demo here, and found
    // that I could not move the listener using the reccommended approach (setting values on the AudioParams.)
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/setPosition

    // Note: Moving the listener seems to cause problems.
    const listener = audioCtx.listener
    // if(listener.positionX) {
    //   listener.positionX.value = viewXfo.tr.x;
    //   listener.positionY.value = viewXfo.tr.y;
    //   listener.positionZ.value = viewXfo.tr.z;
    //   // listener.positionX.setValueAtTime(viewXfo.tr.x, audioCtx.currentTime);
    //   // listener.positionY.setValueAtTime(viewXfo.tr.y, audioCtx.currentTime);
    //   // listener.positionZ.setValueAtTime(viewXfo.tr.z, audioCtx.currentTime);
    // } else {
    listener.setPosition(viewXfo.tr.x, viewXfo.tr.y, viewXfo.tr.z)
    // }
    const up = viewXfo.ori.getYaxis()
    const fw = viewXfo.ori.getZaxis().negate()
    // if(listener.upX) {
    //   // listener.upX.setValueAtTime(up.x, audioCtx.currentTime);
    //   // listener.upY.setValueAtTime(up.y, audioCtx.currentTime);
    //   // listener.upZ.setValueAtTime(up.z, audioCtx.currentTime);
    //   // listener.forwardX.setValueAtTime(fw.x, audioCtx.currentTime);
    //   // listener.forwardY.setValueAtTime(fw.y, audioCtx.currentTime);
    //   // listener.forwardZ.setValueAtTime(fw.z, audioCtx.currentTime);
    //   listener.upX.value = up.x;
    //   listener.upY.value = up.y;
    //   listener.upZ.value = up.z;
    //   listener.forwardX.value = fw.x;
    //   listener.forwardY.value = fw.y;
    //   listener.forwardZ.value = fw.z;
    // } else {
    listener.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z)
    // }
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    if (this.__audioItems.length == 0) return
    this.__updateListenerPosition(renderstate.viewXfo)
  }
}

// Hack so Audio Item can access the context.
if (window.navigator) {
  window.ZeaAudioaudioCtx = audioCtx
}

export { GLAudioItemsPass, audioCtx }
