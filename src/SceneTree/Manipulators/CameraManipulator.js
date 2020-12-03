/* eslint-disable require-jsdoc */
import { Vec2, Vec3, Quat, Xfo, Ray } from '../../Math/index'
import { BaseTool } from './BaseTool.js'
import { NumberParameter, BooleanParameter } from '../Parameters/index'
import { SystemDesc } from '../../SystemDesc.js'
import { POINTER_TYPES } from '../../Utilities/EnumUtils'
import { PassType } from '../../Renderer/Passes/GLPass.js'

const MANIPULATION_MODES = {
  pan: 0,
  dolly: 1,
  focussing: 2,
  look: 3,
  turntable: 4,
  tumbler: 5,
  trackball: 6,
}

/**
 * Class for defining and interaction model of the camera.
 *
 * The CameraManipulator supports a variety of manipulation modes, and hotkeys/modifier keys
 * that allow the user to rapidly switch between modes, such as 'turntable' and 'pan'.
 * A detailed explanation of various camera manipulation modes can be found
 * here: https://www.mattkeeter.com/projects/rotation/
 *
 * **MANIPULATION_MODES**
 * * **pan:** Translates the camera sideways according the the camera's current orientation. Activated by the right mouse button, or two fingered touches on mobile.
 * * **dolly:** Translates the camera forwards and backwards according the the camera's current orientation. Activated by holding the ctrl and alt keys while using the left mouse button, or the mouse wheel, or two fingered touches on mobile.
 * * **focussing:** Focusses the camera on a specific 3d point in the scene. Activated by double clicking, or double tapping on a geometry in the 3d view.
 * * **look:** Rotates the camera around its own position. Useful for simulating looking by turning ones head inside a scene. Activated by holding the ctrl key and right mouse button.
 * * **turntable:** Rotates the camera around the current camera target, using the turntable style manipulation described above. Activated by the left mouse button.
 * * **tumbler:** Rotates the camera around the current camera target, using the tumbler style manipulation described above. Activated by the left mouse button.
 * * **trackball:** Rotates the camera around the current camera target, using the trackball style manipulation described above. Activated by the left mouse button.
 *
 * The default manipulation mode, is the mode that is active with only the left mouse button. The default manipulation mode is currently 'turntable'.
 *
 * To Assign a different default manipulation mode, retrieve the manipulator from the viewport
 * and set the default mode.
 * ```
 * const cameraManipulator = renderer.getViewport().getManipulator()
 * cameraManipulator.setDefaultManipulationMode(CameraManipulator.MANIPULATION_MODES.trackball);
 * ```
 *
 * This class is the default manipulator, and can be replaced with custom manipulators.
 *
 * ```
 * const customManipulator = new CustomCameraManipulator()
 * renderer.getViewport().setManipulator(customManipulator);
 * ```
 *
 *
 * **Parameters**
 * * **orbitRate(`NumberParameter`):** The rate at which mouse or touch interactions are translated camera orientation changes.
 * * **dollySpeed(`NumberParameter`):** The rate at which the mouse button or touch interactions are translated camera dolly movement.
 * * **mouseWheelDollySpeed(`NumberParameter`):** The rate at which the mouse wheel interactions are translated camera dolly movement.
 *
 *   Note: this value defaults to different values for touch based interfaces to mouse based input.
 *   For mobile devices, the orbit rate defaults to -0.3, and for mouse based interaction, the value defaults to 1.
 *   A value of 1 means that the camera will rotate 180 degrees for a mouse interaction that spans from the left border of the viewport to the right border.
 *   Some applications might require lower, or higher default values
 *
 * To set different default values for mobile or desktop set a different value based on the SystemDesc.isMobileDevice flag.
 * ```
 * const cameraManipulator = renderer.getViewport().getManipulator()
 * cameraManipulator.getParameter('orbitRate').setValue(SystemDesc.isMobileDevice ? 0.3 : 1)
 * ```
 *
 * **Events**
 * * **movementFinished:** Emitted when a camera movement is finished. E.g. when the user releases the mouse after a dolly, or after the focussing action has completed.
 * * **aimingFocus:** Emitted when a camera is being focussed on a target. E.g. when the user double clicks the mouse on a geometry in the view.
 *
 * @extends BaseTool
 */
class CameraManipulator extends BaseTool {
  /**
   * Create a camera, mouse and keyboard
   * @param {object} appData - The object containing the scene and the renderer.
   */
  constructor(appData) {
    super()

    this.appData = appData

    this.__defaultManipulationState = MANIPULATION_MODES.turntable
    this.__manipulationState = this.__defaultManipulationState
    this.__pointerDown = false
    this.__dragging = 0
    this.__keyboardMovement = false
    this.__keysPressed = []
    this.__velocity = new Vec3()
    this.__prevVelocityIntegrationTime = -1
    this.__ongoingTouches = {}

    this.__orbitRateParam = this.addParameter(new NumberParameter('OrbitRate', SystemDesc.isMobileDevice ? 0.3 : 1))
    this.__dollySpeedParam = this.addParameter(new NumberParameter('DollySpeed', 0.02))
    this.__mouseWheelDollySpeedParam = this.addParameter(new NumberParameter('MouseWheelDollySpeed', 0.0005))
    this.addParameter(new NumberParameter('WalkSpeed', 5)) // Value is in meters/second
    this.addParameter(new BooleanParameter('WalkModeCollisionDetection', false))

    this.addParameterDeprecationMapping('orbitRate', 'OrbitRate')
    this.addParameterDeprecationMapping('dollySpeed', 'DollySpeed')
    this.addParameterDeprecationMapping('mouseWheelDollySpeed', 'MouseWheelDollySpeed')
  }

  /**
   * Enables tools usage.
   */
  activateTool() {
    super.activateTool()
    if (this.appData && this.appData.renderer) {
      this.prevCursor = this.appData.renderer.getGLCanvas().style.cursor
      this.appData.renderer.getGLCanvas().style.cursor = 'cursor'
    }
  }

  /**
   * Disables tool usage.
   */
  deactivateTool() {
    super.deactivateTool()
    if (this.appData && this.appData.renderer) {
      this.appData.renderer.getGLCanvas().style.cursor = this.appData.renderer.getGLCanvas().style.cursor
    }
  }

  /**
   * Sets default manipulation mode.
   * The value can be on of the keys in #CameraManipulator.MANIPULATION_MODES
   *
   * @param {string} manipulationMode - The manipulation mode value.
   */
  setDefaultManipulationMode(manipulationMode) {
    if (typeof manipulationMode == 'string') {
      this.__defaultManipulationState = MANIPULATION_MODES[manipulationMode]
    } else this.__defaultManipulationState = manipulationMode
  }

  /**
   * The look method.
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  look(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const orbitRate = this.__orbitRateParam.getValue()

    const globalXfo = camera.getParameter('GlobalXfo').getValue()

    // Orbit
    const orbit = new Quat()
    orbit.rotateZ((dragVec.x / viewport.getWidth()) * Math.PI * orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    // Pitch
    const pitch = new Quat()
    pitch.rotateX((dragVec.y / viewport.getHeight()) * Math.PI * orbitRate)
    globalXfo.ori.multiplyInPlace(pitch)

    camera.getParameter('GlobalXfo').setValue(globalXfo)
  }

  /**
   * Rotates viewport camera about the target.
   *
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  turntable(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const focalDistance = camera.getFocalDistance()
    const orbitRate = this.__orbitRateParam.getValue()

    const globalXfo = camera.getParameter('GlobalXfo').getValue()
    const cameraTarget = camera.getTargetPosition()

    // Orbit
    const orbit = new Quat()
    orbit.rotateZ((dragVec.x / viewport.getWidth()) * 2 * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    // Pitch
    const pitch = new Quat()
    pitch.rotateX((dragVec.y / viewport.getHeight()) * Math.PI * -orbitRate)
    globalXfo.ori.multiplyInPlace(pitch)

    globalXfo.tr = cameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

    camera.getParameter('GlobalXfo').setValue(globalXfo)
  }

  /**
   * Rotates viewport camera about the target.
   *
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  tumble(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()
    const focalDistance = camera.getFocalDistance()
    const orbitRate = this.__orbitRateParam.getValue()

    const globalXfo = camera.getParameter('GlobalXfo').getValue()
    const xvec = globalXfo.ori.getXaxis()
    const yvec = globalXfo.ori.getYaxis()
    const zvec = globalXfo.ori.getZaxis()
    const vec = xvec.scale(-dragVec.x).add(yvec.scale(dragVec.y))
    const rotateAxis = vec.cross(zvec)
    rotateAxis.normalizeInPlace()

    const dragVecLength = dragVec.length()

    const cameraTarget = camera.getTargetPosition()

    // Orbit
    const orbit = new Quat()
    orbit.setFromAxisAndAngle(rotateAxis, (dragVecLength / viewport.getWidth()) * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    globalXfo.tr = cameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

    camera.getParameter('GlobalXfo').setValue(globalXfo)
  }

  /**
   * Rotates viewport camera about the target.
   *
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  trackball(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()
    const focalDistance = camera.getFocalDistance()
    const orbitRate = this.__orbitRateParam.getValue()

    const globalXfo = camera.getParameter('GlobalXfo').getValue()
    const xvec = globalXfo.ori.getXaxis()
    const yvec = globalXfo.ori.getYaxis()
    const zvec = globalXfo.ori.getZaxis()
    const vec = xvec.scale(-dragVec.x).add(yvec.scale(dragVec.y))
    const rotateAxis = vec.cross(zvec)
    rotateAxis.normalizeInPlace()

    const dragVecLength = dragVec.length()

    const cameraTarget = camera.getTargetPosition()

    // Orbit
    const orbit = new Quat()
    orbit.setFromAxisAndAngle(rotateAxis, (dragVecLength / viewport.getWidth()) * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    globalXfo.tr = cameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

    camera.getParameter('GlobalXfo').setValue(globalXfo)
  }

  /**
   * Rotates the camera around its own `X`,`Y` axes.
   *
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  pan(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const focalDistance = camera.getFocalDistance()
    const fovY = camera.getFov()
    const xAxis = new Vec3(1, 0, 0)
    const yAxis = new Vec3(0, 1, 0)

    const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY)
    const cameraPlaneWidth = cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight())
    const delta = new Xfo()
    delta.tr = xAxis.scale(-(dragVec.x / viewport.getWidth()) * cameraPlaneWidth)
    delta.tr.addInPlace(yAxis.scale((dragVec.y / viewport.getHeight()) * cameraPlaneHeight))

    const cameraXfo = camera.getParameter('GlobalXfo').getValue()
    camera.getParameter('GlobalXfo').setValue(cameraXfo.multiply(delta))
  }

  /**
   * The dolly method.
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} dragVec - The drag vector value.
   */
  dolly(event, dragVec) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const dollyDist = dragVec.x * this.__dollySpeedParam.getValue()
    const delta = new Xfo()
    delta.tr.set(0, 0, dollyDist)
    const globalXfo = camera.getParameter('GlobalXfo').getValue()
    camera.getParameter('GlobalXfo').setValue(globalXfo.multiply(delta))
  }

  /**
   * Rotates the camera around its own `X`,`Y` axes and applies a zoom.
   *
   * @param {MouseEvent} event - The event value.
   * @param {Vec2} panDelta - The pan delta value.
   * @param {number} dragDist - The drag distance value.
   */
  panAndZoom(event, panDelta, dragDist) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const focalDistance = camera.getFocalDistance()
    const fovY = camera.getFov()

    const xAxis = new Vec3(1, 0, 0)
    const yAxis = new Vec3(0, 1, 0)

    const cameraPlaneHeight = 2.0 * focalDistance * Math.tan(0.5 * fovY)
    const cameraPlaneWidth = cameraPlaneHeight * (viewport.getWidth() / viewport.getHeight())
    const delta = new Xfo()
    delta.tr = xAxis.scale(-(panDelta.x / viewport.getWidth()) * cameraPlaneWidth)
    delta.tr.addInPlace(yAxis.scale((panDelta.y / viewport.getHeight()) * cameraPlaneHeight))

    const zoomDist = dragDist * focalDistance
    camera.setFocalDistance(focalDistance + zoomDist)
    delta.tr.z += zoomDist
    const globalXfo = camera.getParameter('GlobalXfo').getValue()
    camera.getParameter('GlobalXfo').setValue(globalXfo.multiply(delta))
  }

  /**
   * The initDrag method.
   *
   * @private
   * @param {PointerEvent} event - The event value.
   */
  initDrag(event) {
    const { pointerPos } = event

    this.__pointerDown = true
    this.__prevPointerPos = pointerPos
    this.__dragging = 1
  }

  /**
   * The initDrag method.
   *
   * @private
   * @param {MouseEvent} event - The event value.
   */
  endDrag(event) {
    this.__dragging = 0
    this.__pointerDown = false
  }

  /**
   * The aimFocus method.
   *
   * @private
   * @param {Camera} camera - The camera that we are aiming
   * @param {Vec3} target - The target to focus on.
   * @param {Number} distance - The distance from the target to get to.
   * @param {Number} duration - The duration in milliseconds to aim the focus.
   */
  aimFocus(camera, target, distance = -1, duration = 400) {
    if (this.__focusIntervalId) clearInterval(this.__focusIntervalId)

    const count = Math.round(duration / 20) // each step is 20ms
    const initalMode = this.__manipulationState
    let i = 0
    const applyMovement = () => {
      const prevGlobalXfo = camera.getParameter('GlobalXfo').getValue()
      const initialDist = camera.getFocalDistance()
      const dir = target.subtract(prevGlobalXfo.tr)
      const currDist = dir.normalizeInPlace()

      const targetGlobalXfo = prevGlobalXfo.clone()
      if (initalMode == MANIPULATION_MODES.turntable || initalMode == MANIPULATION_MODES.look) {
        // Orbit
        {
          const currDir = prevGlobalXfo.ori.getZaxis().clone()
          currDir.z = 0
          const newDir = dir.negate()
          newDir.z = 0

          const orbit = new Quat()
          orbit.setFrom2Vectors(currDir, newDir)
          targetGlobalXfo.ori = orbit.multiply(targetGlobalXfo.ori)
        }

        // Pitch
        {
          const xAxis = prevGlobalXfo.ori.getXaxis().clone()
          const currDir = prevGlobalXfo.ori.getZaxis().clone()
          const newDir = dir.negate()

          newDir.subtractInPlace(xAxis.scale(newDir.dot(xAxis)))
          newDir.normalizeInPlace()

          const pitch = new Quat()
          if (currDir.cross(newDir).dot(xAxis) > 0.0) pitch.rotateX(currDir.angleTo(newDir))
          else pitch.rotateX(-currDir.angleTo(newDir))
          targetGlobalXfo.ori = targetGlobalXfo.ori.multiply(pitch)
        }

        // Fix Roll
        {
          const currDir = targetGlobalXfo.ori.getXaxis().clone()
          const newDir = currDir.clone()
          newDir.z = 0
          newDir.normalizeInPlace()

          const roll = new Quat()
          roll.setFrom2Vectors(currDir, newDir)
          targetGlobalXfo.ori = roll.multiply(targetGlobalXfo.ori)
        }
      } else {
        const currDir = prevGlobalXfo.ori.getZaxis().clone()
        const newDir = dir.negate()

        const orbit = new Quat()
        orbit.setFrom2Vectors(currDir, newDir)
        targetGlobalXfo.ori = orbit.multiply(targetGlobalXfo.ori)
      }

      // With each iteration we get closer to our goal
      // and on the final iteration we should aim perfectly at
      // the target.
      const t = Math.pow(i / count, 2)
      const globalXfo = prevGlobalXfo.clone()
      globalXfo.ori = prevGlobalXfo.ori.lerp(targetGlobalXfo.ori, t)
      if (distance > 0) {
        const displacement = dir.scale(currDist - distance)
        globalXfo.tr.addInPlace(displacement.scale(t))
      }

      camera.setFocalDistance(initialDist + (currDist - initialDist) * t)
      camera.getParameter('GlobalXfo').setValue(globalXfo)

      i++
      if (i <= count) {
        this.__focusIntervalId = setTimeout(applyMovement, 20)
      } else {
        this.__focusIntervalId = undefined

        this.emit('movementFinished', {})
        camera.emit('movementFinished', {})
      }
    }
    applyMovement()

    this.__manipulationState = 'focussing'
  }

  /**
   * The orientPointOfView method.
   *
   * @private
   * @param {Camera} camera - The camera that we are orienting
   * @param {Vec3} position - The target to focus on.
   * @param {Vec3} target - The target to focus on.
   * @param {Number} distance - The distance to the specified we want the user to be moved to
   * @param {Number} duration - The duration in milliseconds to aim the focus.
   */
  orientPointOfView(camera, position, target, distance = 0, duration = 400) {
    if (this.__focusIntervalId) clearInterval(this.__focusIntervalId)

    const count = Math.round(duration / 20) // each step is 20ms
    let i = 0
    const applyMovement = () => {
      const initlalGlobalXfo = camera.getParameter('GlobalXfo').getValue()
      const initialTarget = camera.getTargetPosition()

      // With each iteration we get closer to our goal
      // and on the final iteration we should aim perfectly at
      // the target.
      const t = Math.pow(i / count, 2)

      // Sometimes we want to pull users to within some threshold of the specified position.
      const dirToPosition = position.subtract(initlalGlobalXfo.tr)
      const currDistToPosition = dirToPosition.normalizeInPlace()
      const displacement = dirToPosition.scale(currDistToPosition - distance)
      const pos = initlalGlobalXfo.tr.add(displacement.scale(t))

      const targetPos = initialTarget.lerp(target, t)

      camera.setPositionAndTarget(pos, targetPos)

      i++
      if (i <= count) {
        this.__focusIntervalId = setTimeout(applyMovement, 20)
      } else {
        this.__focusIntervalId = undefined

        this.emit('movementFinished', {})
        camera.emit('movementFinished', { event: 'aimFocus' })
      }
    }
    applyMovement()

    this.__manipulationState = 'focussing'
  }

  /**
   * Invoked when a user double presses a pointer over an element.
   *
   * @param {MouseEvent|TouchEvent} event - The pointer event that occurs
   * @memberof CameraManipulator
   */
  onPointerDoublePress(event) {
    if (event.intersectionData) {
      const { viewport } = event
      const camera = viewport.getCamera()
      const cameraGlobalXfo = camera.getParameter('GlobalXfo').getValue()
      const aimTarget = cameraGlobalXfo.tr.add(event.pointerRay.dir.scale(event.intersectionData.dist))
      this.aimFocus(camera, aimTarget)

      // Note: Collab can use these events to guide users attention.
      event.aimTarget = aimTarget
      event.aimDistance = event.intersectionData.dist
      this.emit('aimingFocus', event)
      camera.emit('aimingFocus', event)
    }

    event.stopPropagation()
    event.preventDefault()
  }

  /**
   * Invoked when the user starts to drag an element.
   *
   * @param {PointerEvent} event - The mouse event that occurs.
   */
  onPointerDown(event) {
    if (event.pointerType === POINTER_TYPES.mouse) {
      if (this.__dragging == 1) {
        this.endDrag(event)
      }

      this.initDrag(event)

      if (event.button == 2) {
        this.__manipulationState = MANIPULATION_MODES.pan
      } else if (event.ctrlKey && event.altKey) {
        this.__manipulationState = MANIPULATION_MODES.dolly
      } else if (event.ctrlKey || event.button == 2) {
        this.__manipulationState = MANIPULATION_MODES.look
      } else {
        this.__manipulationState = this.__defaultManipulationState
      }
    } else if (event.pointerType === POINTER_TYPES.touch) {
      this._onTouchStart(event)
    }

    event.stopPropagation()
    event.preventDefault()
  }

  /**
   * Invoked when an element is being dragged.
   *
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerMove(event) {
    if (event.pointerType === POINTER_TYPES.mouse) this._onMouseMove(event)
    if (event.pointerType === POINTER_TYPES.touch) this._onTouchMove(event)

    event.stopPropagation()
    event.preventDefault()
  }

  /**
   * The event that occurs when the user moves the pointer across a screen.
   *
   * @param {MouseEvent} event -The event value
   */
  _onMouseMove(event) {
    if (!this.__pointerDown) return

    if (this.__dragging == 2) {
      this.initDrag(event)
    }

    const pointerPos = event.pointerPos
    // this.__calculatingDragAction = true
    const dragVec = pointerPos.subtract(this.__prevPointerPos)

    switch (this.__manipulationState) {
      case MANIPULATION_MODES.turntable:
        this.turntable(event, dragVec)
        break
      case MANIPULATION_MODES.tumbler:
        this.tumble(event, dragVec)
        break
      case MANIPULATION_MODES.trackball:
        this.trackball(event, dragVec)
        break
      case MANIPULATION_MODES.look:
        this.look(event, dragVec)
        break
      case MANIPULATION_MODES.pan:
        this.pan(event, pointerPos.subtract(this.__prevPointerPos))
        break
      case MANIPULATION_MODES.dolly:
        this.dolly(event, dragVec)
        break
    }
    this.__prevPointerPos = pointerPos
    // this.__calculatingDragAction = false
  }

  /**
   * The event that occurs when the user moves pointer across a touch screen.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   * @private
   */
  _onTouchMove(event) {
    // this.__calculatingDragAction = true

    const touches = event.touches
    if (touches.length == 1 && this.__manipMode != 'panAndZoom') {
      const touch = touches[0]
      const touchPos = new Vec2(touch.clientX, touch.clientY)
      const touchData = this.__ongoingTouches[touch.identifier]
      if (!touchData) return
      const dragVec = touchPos.subtract(touchData.pos)
      switch (this.__defaultManipulationState) {
        case MANIPULATION_MODES.look:
          // TODO: scale panning here.
          dragVec.scaleInPlace(6.0)
          this.look(event, dragVec)
          break
        case MANIPULATION_MODES.turntable:
          this.turntable(event, dragVec)
          break
        case MANIPULATION_MODES.tumbler:
          this.tumbler(event, dragVec)
          break
        case MANIPULATION_MODES.trackball:
          this.trackball(event, dragVec)
          break
      }
      touchData.pos = touchPos
    } else if (touches.length == 2) {
      const touch0 = touches[0]
      const touchData0 = this.__ongoingTouches[touch0.identifier]
      const touch1 = touches[1]
      const touchData1 = this.__ongoingTouches[touch1.identifier]

      if (!touchData0 || !touchData1) return
      const touch0Pos = new Vec2(touch0.clientX, touch0.clientY)
      const touch1Pos = new Vec2(touch1.clientX, touch1.clientY)
      const startSeparation = touchData1.pos.subtract(touchData0.pos).length()
      const dragSeparation = touch1Pos.subtract(touch0Pos).length()
      const separationDist = startSeparation - dragSeparation

      const touch0Drag = touch0Pos.subtract(touchData0.pos)
      const touch1Drag = touch1Pos.subtract(touchData1.pos)
      const dragVec = touch0Drag.add(touch1Drag)
      // TODO: scale panning here.
      dragVec.scaleInPlace(0.5)
      this.panAndZoom(event, dragVec, separationDist * 0.002)

      touchData0.pos = touch0Pos
      touchData1.pos = touch1Pos
      this.__manipMode = 'panAndZoom'
    }

    // this.__calculatingDragAction = false
  }

  /**
   * Invoked when the user has finished dragging an element.
   *
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerUp(event) {
    event.stopPropagation()
    event.preventDefault()

    if (this.__dragging != 0) {
      if (event.pointerType === POINTER_TYPES.mouse) {
        this.endDrag(event)

        this.emit('movementFinished', {})
        event.viewport.getCamera().emit('movementFinished', {})
      } else if (event.pointerType === POINTER_TYPES.touch) {
        event.preventDefault()
        const touches = event.changedTouches

        for (let i = 0; i < touches.length; i++) {
          this.__endTouch(touches[i])
        }

        if (Object.keys(this.__ongoingTouches).length == 0) this.endDrag(event)
      }
    }
  }

  /**
   * Invoked when the mouse wheel is rolled up or down over an element.
   *
   * @param {WheelEvent} event - The wheel event that occurs.
   */
  onWheel(event) {
    const { viewport } = event
    const camera = viewport.getCamera()
    const mouseWheelDollySpeed = this.__mouseWheelDollySpeedParam.getValue()
    const modulator = event.shiftKey ? 0.1 : 0.5
    const xfo = camera.getParameter('GlobalXfo').getValue()
    const movementVec = xfo.ori.getZaxis()
    if (this.__mouseWheelZoomIntervalId) clearInterval(this.__mouseWheelZoomIntervalId)
    let count = 0
    const applyMovement = () => {
      const focalDistance = camera.getFocalDistance()
      const zoomDist = event.deltaY * mouseWheelDollySpeed * focalDistance * modulator
      xfo.tr.addInPlace(movementVec.scale(zoomDist))

      camera.setFocalDistance(camera.getFocalDistance() + zoomDist)
      camera.getParameter('GlobalXfo').setValue(xfo)

      count++
      if (count < 10) {
        this.__mouseWheelZoomIntervalId = setTimeout(applyMovement, 10)
      } else {
        this.__mouseWheelZoomIntervalId = undefined
        this.emit('movementFinished', {})
        camera.emit('movementFinished', { event: 'onWheel' })
      }
    }
    applyMovement()

    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * The integrateVelocityChange method.
   * @param {MouseEvent} event - The event value.
   * @private
   */
  integrateVelocityChange(event) {
    const { viewport } = event
    const camera = viewport.getCamera()

    const time = performance.now()
    if (this.__prevVelocityIntegrationTime > 0) {
      const timeDelta = (time - this.__prevVelocityIntegrationTime) / 1000
      const speed = this.getParameter('WalkSpeed').getValue()
      // movement.tr = this.__velocity.normalize().scale(speed * timeDelta)

      if (speed > 0.0) {
        // As we move over a terrain, it can be helpful to allow users to walk
        // over surfaces without falling through them. This allows users to look
        // down while walking forwards for example.
        // Calculate where we might be soon
        const movement = new Xfo()
        movement.tr = this.__velocity.normalize().scale(speed * timeDelta)
        const cameraXfo = camera.getParameter('GlobalXfo').getValue()

        const newXfo = cameraXfo.multiply(movement)

        const collisionDetection = this.getParameter('WalkModeCollisionDetection').getValue()
        if (collisionDetection) {
          // Raycast from 1.5 meter up
          const headHeight = 1.5
          const dist = 1.5
          const area = 0.5
          const raycastXfo = new Xfo(newXfo.tr)
          const ray = new Ray(newXfo.tr, new Vec3(0, 0, -1))
          const results = viewport.getRenderer().raycastCluster(raycastXfo, ray, dist, area, PassType.OPAQUE)

          if (results.length > 0) {
            let avgDist = 0
            // eslint-disable-next-line guard-for-in
            results.forEach((result) => {
              avgDist += result.dist
            })
            avgDist /= results.length

            // Snap the movement vector to make the user rest on the ground.
            newXfo.tr = ray.start.add(ray.dir.scale(avgDist - headHeight))
          }
        }
        camera.getParameter('GlobalXfo').setValue(newXfo)
      }
    }

    this.__prevVelocityIntegrationTime = time
  }

  /**
   * Invoked when the user is pressing a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The keyboard event that occurs.
   * @private
   */
  onKeyDown(event) {
    const key = event.key.toLowerCase()
    // Note: onKeyPressed is called initially only once, and then we
    // get a series of calls. Here we ignore subsequent events.
    if (this.__keysPressed.includes(key)) return
    switch (key) {
      case 'w':
        this.__velocity.z -= 1.0
        break
      case 's':
        this.__velocity.z += 1.0
        break
      case 'a':
        this.__velocity.x -= 1.0
        break
      case 'd':
        this.__velocity.x += 1.0
        break
      default:
        return
    }
    this.__keysPressed.push(key)
    if (!this.__keyboardMovement) {
      this.__keyboardMovement = true
      this.__prevVelocityIntegrationTime = performance.now()
      const animationFrame = () => {
        this.integrateVelocityChange(event)
        if (this.__keyboardMovement) {
          window.requestAnimationFrame(animationFrame)
        }
      }
      window.requestAnimationFrame(animationFrame)
    }
  }

  /**
   * Invoked when the user releases a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event that occurs.
   */
  onKeyUp(event) {
    const key = event.key.toLowerCase()
    if (!this.__keysPressed.includes(key)) return
    switch (key) {
      case 'w':
        this.__velocity.z += 1.0
        break
      case 's':
        this.__velocity.z -= 1.0
        break
      case 'a':
        this.__velocity.x += 1.0
        break
      case 'd':
        this.__velocity.x -= 1.0
        break
      default:
        return
    }
    const keyIndex = this.__keysPressed.indexOf(key)
    this.__keysPressed.splice(keyIndex, 1)
    if (this.__keysPressed.length == 0) this.__keyboardMovement = false
  }

  // ///////////////////////////////////
  // Touch controls

  /**
   * The __startTouch method.
   * @param {TouchEvent} touch - The touch value.
   * @private
   */
  __startTouch(touch) {
    this.__ongoingTouches[touch.identifier] = {
      identifier: touch.identifier,
      pos: new Vec2(touch.clientX, touch.clientY),
    }
  }

  /**
   * The __endTouch method.
   * @param {TouchEvent} touch - The touch value.
   * @private
   */
  __endTouch(touch) {
    // let idx = this.__ongoingTouchIndexById(touch.identifier);
    // this.__ongoingTouches.splice(idx, 1); // remove it; we're done
    delete this.__ongoingTouches[touch.identifier]
  }

  // Touch events

  /**
   * Invoked when the user touches an element on a touch screen.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  _onTouchStart(event) {
    if (Object.keys(this.__ongoingTouches).length == 0) this.__manipMode = undefined

    const touches = event.changedTouches
    for (let i = 0; i < touches.length; i++) {
      this.__startTouch(touches[i])
    }

    this.initDrag(event)
  }

  /**
   * Invoked when the user removes his/her finger from the touch pad.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  onTouchEnd(event) {
    event.preventDefault()
    event.stopPropagation()
    const touches = event.changedTouches
    for (let i = 0; i < touches.length; i++) {
      this.__endTouch(touches[i])
    }

    if (Object.keys(this.__ongoingTouches).length == 0) this.endDrag(event)
  }

  /**
   * Invoked when the touch event gets interrupted.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  onTouchCancel(event) {
    event.preventDefault()
    const touches = event.touches
    for (let i = 0; i < touches.length; i++) {
      this.__endTouch(touches[i])
    }
    if (Object.keys(this.__ongoingTouches).length == 0) this.endDrag(event)
  }

  /**
   * Returns a dictionary of support manipulation modes.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  static get MANIPULATION_MODES() {
    return MANIPULATION_MODES
  }
}

export { CameraManipulator }
