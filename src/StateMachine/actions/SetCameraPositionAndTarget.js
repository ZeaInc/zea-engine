import { sgFactory } from '../../SceneTree/SGFactory.js'

import { Camera } from '../../SceneTree/Camera.js'
import {
  NumberParameter,
  Vec3Parameter,
  TreeItemParameter,
} from '../../SceneTree/Parameters/index'
import { StateAction } from '../StateAction.js'

/** A state machine action that sets the camera position and target.
 * @extends StateAction
 * @private
 */
class SetCameraPositionAndTarget extends StateAction {
  /**
   * Create a set camera position and target.
   */
  constructor() {
    super()

    this.addParameter(new TreeItemParameter('Camera', (treeItem) => treeItem instanceof Camera))
    this.addParameter(new Vec3Parameter('CameraPos'))
    this.addParameter(new Vec3Parameter('CameraTarget'))
    this.addParameter(new NumberParameter('InterpTime', 1.0))

    // Note: if the update frequency here can be faster than the renderer, it means each
    // rendered frame there is an updated values. This keeps movement smooth.
    // This is very apparent when moving the camera, while changing other values. If the 2 changes
    // are slower than rendering, then we see juddering.
    this.addParameter(new NumberParameter('UpdateFrequency', 100))
  }

  /**
   * Sets the camera's position and target.
   * @param {any} pos - The position of the camera.
   * @param {any} target - The target of the camera.
   */
  setCameraPositionAndTarget(pos, target) {
    this.getParameter('CameraPos').setValue(pos)
    this.getParameter('CameraTarget').setValue(target)
  }

  /**
   * Activates the action.
   */
  activate() {
    const camera = this.getParameter('Camera').getValue()
    if (!camera) {
      console.warn(
        'Camera not assigned to SetCameraPositionAndTarget state action'
      )
      return
    }
    const posEnd = this.getParameter('CameraPos').getValue()
    const targetEnd = this.getParameter('CameraTarget').getValue()
    const interpTime = this.getParameter('InterpTime').getValue()
    if (interpTime > 0.0) {
      const posStart = camera.getGlobalXfo().tr
      const targetStart = camera.getTargetPostion()
      const distStart = posStart.subtract(targetStart).length()

      const updateFrequency = this.getParameter('UpdateFrequency').getValue()

      const distEnd = posEnd.subtract(targetEnd).length()
      let settingCameraDirection = true
      let smooth_t_prev = 0
      let step = 0
      const steps = Math.round(interpTime * updateFrequency)
      let modifyingCameraXfo = false
      const onCameraChanged = () => {
        if (!modifyingCameraXfo) {
          settingCameraDirection = false
        }
      }
      camera.on('globalXfoChanged', onCameraChanged)
      const timerCallback = () => {
        if (!settingCameraDirection) {
          return
        }
        step++
        if (step < steps) {
          const t = step / steps
          const smooth_t = Math.smoothStep(0.0, 1.0, t)
          const delta = (smooth_t - smooth_t_prev) / (1.0 - t)
          smooth_t_prev = smooth_t

          const posNow = camera.getGlobalXfo().tr
          const targetNow = camera.getTargetPostion()
          const distNow = posNow.subtract(targetNow).length()
          let newPos = posNow
          const newTarget = targetNow.lerp(targetEnd, delta)
          if (settingCameraDirection) {
            newPos = posNow.lerp(posEnd, delta)
          }

          const newVec = newPos.subtract(newTarget)
          const newDist = newVec.length()
          const idealDist = Math.lerp(distNow, distEnd, delta)
          // console.log("t:" + t + " delta: " + delta + " distNow:" + distNow + " idealDist:" + idealDist);
          newVec.scaleInPlace(idealDist / newVec.length())

          modifyingCameraXfo = true
          camera.setPositionAndTarget(newTarget.add(newVec), newTarget)
          modifyingCameraXfo = false

          this.__timeoutId = window.setTimeout(
            timerCallback,
            1000 / updateFrequency
          )
        } else {
          // camera.setPositionAndTarget(posEnd, targetEnd);
          camera.off('globalXfoChanged', onCameraChanged)
          camera.emit('movementFinished', {})
          this.__timeoutId = undefined
          this.__onDone()
        }
      }
      timerCallback()
    } else {
      camera.setPositionAndTarget(posEnd, targetEnd)
    }
  }
  
  /**
   * The deactivate method.
   */
  deactivate() {
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = undefined
    }
    super.deactivate()
  }

  /**
   * Cancels the action.
   */
  cancel() {
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = undefined
    }
  }
}

sgFactory.registerClass(
  'SetCameraPositionAndTarget',
  SetCameraPositionAndTarget
)
export { SetCameraPositionAndTarget }
