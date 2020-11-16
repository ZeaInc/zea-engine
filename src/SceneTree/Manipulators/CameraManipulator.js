/* eslint-disable require-jsdoc */
import { Vec2, Vec3, Quat, Xfo } from '../../Math/index'
import { BaseTool } from './BaseTool.js'
import { NumberParameter } from '../Parameters/index'
import { SystemDesc } from '../../SystemDesc.js'
import { POINTER_TYPES } from '../../Utilities/EnumUtils'

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
 * * **movementFinished:** Triggered when a camera movement is finished. E.g. when the user releases the mouse after a dolly, or after the focussing action has completed.
 *
 * @extends BaseTool
 */
class CameraManipulator extends BaseTool {
  /**
   * Create a camera, mouse and keyboard
   * @param {string} name - The name value.
   */
  constructor(appData) {
    super()

    this.appData = appData

    this.__defaultManipulationState = MANIPULATION_MODES.turntable
    this.__manipulationState = this.__defaultManipulationState
    this.__pointerDown = false
    this.__dragging = false
    this.__pointerDragDelta = new Vec2()
    this.__keyboardMovement = false
    this.__keysPressed = []
    this.__maxVel = 0.002
    this.__velocity = new Vec3()

    this.__ongoingTouches = {}

    this.__globalXfoChangedDuringDrag = this.__globalXfoChangedDuringDrag.bind(this)

    this.__orbitRateParam = this.addParameter(new NumberParameter('orbitRate', SystemDesc.isMobileDevice ? 0.3 : 1))
    this.__dollySpeedParam = this.addParameter(new NumberParameter('dollySpeed', 0.02))
    this.__mouseWheelDollySpeedParam = this.addParameter(new NumberParameter('mouseWheelDollySpeed', 0.0005))
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

    const focalDistance = camera.getFocalDistance()
    const orbitRate = this.__orbitRateParam.getValue()

    if (this.__keyboardMovement) {
      const globalXfo = camera.getParameter('GlobalXfo').getValue()
      this.__pointerDownCameraXfo = globalXfo.clone()
      this.__pointerDownZaxis = globalXfo.ori.getZaxis()
      const targetOffset = this.__pointerDownZaxis.scale(-focalDistance)
      this.__pointerDownCameraTarget = globalXfo.tr.add(targetOffset)
    }

    const globalXfo = this.__pointerDownCameraXfo.clone()

    // Orbit
    const orbit = new Quat()
    orbit.rotateZ((dragVec.x / viewport.getWidth()) * Math.PI * orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    // Pitch
    const pitch = new Quat()
    pitch.rotateX((dragVec.y / viewport.getHeight()) * Math.PI * orbitRate)
    globalXfo.ori.multiplyInPlace(pitch)

    if (this.__keyboardMovement) {
      // TODO: debug this potential regression. we now use the generic method which emits a signal.
      // Avoid generating a signal because we have an animation frame occurring.
      // see: onKeyPressed
      camera.getParameter('GlobalXfo').setValue(globalXfo)
    } else {
      camera.getParameter('GlobalXfo').setValue(globalXfo)
    }
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

    if (this.__keyboardMovement) {
      const globalXfo = camera.getParameter('GlobalXfo').getValue()
      this.__pointerDownCameraXfo = globalXfo.clone()
      this.__pointerDownZaxis = globalXfo.ori.getZaxis()
      const targetOffset = this.__pointerDownZaxis.scale(-focalDistance)
      this.__pointerDownCameraTarget = globalXfo.tr.add(targetOffset)
    }

    const globalXfo = this.__pointerDownCameraXfo.clone()

    // Orbit
    const orbit = new Quat()
    orbit.rotateZ((dragVec.x / viewport.getWidth()) * 2 * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    // Pitch
    const pitch = new Quat()
    pitch.rotateX((dragVec.y / viewport.getHeight()) * Math.PI * -orbitRate)
    globalXfo.ori.multiplyInPlace(pitch)

    globalXfo.tr = this.__pointerDownCameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

    if (this.__keyboardMovement) {
      // TODO: debug this potential regression. we now use the generic method which emits a signal.
      // Avoid generating a signal because we have an animation frame occurring.
      // see: onKeyPressed
      camera.getParameter('GlobalXfo').setValue(globalXfo)
    } else {
      camera.getParameter('GlobalXfo').setValue(globalXfo)
    }
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

    const xvec = this.__pointerDownCameraXfo.ori.getXaxis()
    const yvec = this.__pointerDownCameraXfo.ori.getYaxis()
    const zvec = this.__pointerDownCameraXfo.ori.getZaxis()
    const vec = xvec.scale(-dragVec.x).add(yvec.scale(dragVec.y))
    const rotateAxis = vec.cross(zvec)
    rotateAxis.normalizeInPlace()

    const dragVecLength = dragVec.length()

    const globalXfo = this.__pointerDownCameraXfo.clone()

    // Orbit
    const orbit = new Quat()
    orbit.setFromAxisAndAngle(rotateAxis, (dragVecLength / viewport.getWidth()) * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    globalXfo.tr = this.__pointerDownCameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

    camera.getParameter('GlobalXfo').setValue(globalXfo)

    // Update the mouse pos so the next delta is just the difference to this update.
    this.__pointerDownPos = event.pointerPos
    this.__pointerDownCameraXfo = globalXfo
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

    const xvec = this.__pointerDownCameraXfo.ori.getXaxis()
    const yvec = this.__pointerDownCameraXfo.ori.getYaxis()
    const zvec = this.__pointerDownCameraXfo.ori.getZaxis()
    const vec = xvec.scale(-dragVec.x).add(yvec.scale(dragVec.y))
    const rotateAxis = vec.cross(zvec)
    rotateAxis.normalizeInPlace()

    const dragVecLength = dragVec.length()

    const globalXfo = this.__pointerDownCameraXfo.clone()

    // Orbit
    const orbit = new Quat()
    orbit.setFromAxisAndAngle(rotateAxis, (dragVecLength / viewport.getWidth()) * Math.PI * -orbitRate)
    globalXfo.ori = orbit.multiply(globalXfo.ori)

    globalXfo.tr = this.__pointerDownCameraTarget.add(globalXfo.ori.getZaxis().scale(focalDistance))

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

    camera.getParameter('GlobalXfo').setValue(this.__pointerDownCameraXfo.multiply(delta))
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
    camera.getParameter('GlobalXfo').setValue(this.__pointerDownCameraXfo.multiply(delta))
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
    camera.setFocalDistance(this.__pointerDownFocalDist + zoomDist)
    delta.tr.z += zoomDist
    camera.getParameter('GlobalXfo').setValue(this.__pointerDownCameraXfo.multiply(delta))
  }

  /**
   * The initDrag method.
   *
   * @private
   * @param {PointerEvent} event - The event value.
   */
  initDrag(event) {
    const { viewport } = event
    const camera = viewport.getCamera()
    const focalDistance = camera.getFocalDistance()

    this.__pointerDown = true
    this.__calculatingDragAction = false
    this.__pointerDownPos = event.pointerPos
    this.__pointerDownViewport = viewport
    this.__pointerDragDelta.set(0, 0)
    this.__pointerDownCameraXfo = camera.getParameter('GlobalXfo').getValue().clone()
    this.__pointerDownZaxis = this.__pointerDownCameraXfo.ori.getZaxis()
    const targetOffset = this.__pointerDownZaxis.scale(-focalDistance)
    this.__pointerDownCameraTarget = camera.getParameter('GlobalXfo').getValue().tr.add(targetOffset)
    this.__pointerDownFocalDist = focalDistance

    camera.getParameter('GlobalXfo').on('valueChanged', this.__globalXfoChangedDuringDrag)

    this.__dragging = true
  }

  /**
   * @private
   */
  __globalXfoChangedDuringDrag() {
    if (!this.__calculatingDragAction) {
      if (this.__dragging) {
        const camera = this.__pointerDownViewport.getCamera()
        camera.getParameter('GlobalXfo').off('valueChanged', this.__globalXfoChangedDuringDrag)
        this.__dragging = false
      }
      this.initDrag({ viewport: this.__pointerDownViewport, pointerPos: this.__pointerDownPos })
    }
  }

  /**
   * The initDrag method.
   *
   * @private
   * @param {MouseEvent} event - The event value.
   */
  endDrag(event) {
    if (this.__dragging) {
      const { viewport } = event
      const camera = viewport.getCamera()
      camera.getParameter('GlobalXfo').off('valueChanged', this.__globalXfoChangedDuringDrag)
      this.__dragging = false
    }
    this.__pointerDown = false
  }

  /**
   * The aimFocus method.
   *
   * @private
   * @param {MouseEvent} event - The event value.
   * @param {Vec3} pos - The position value.
   */
  aimFocus(event, pos) {
    const { viewport } = event
    const camera = viewport.getCamera()

    if (this.__focusIntervalId) clearInterval(this.__focusIntervalId)

    const count = 20
    let i = 0
    const applyMovement = () => {
      const initlalGlobalXfo = camera.getParameter('GlobalXfo').getValue()
      const initlalDist = camera.getFocalDistance()
      const dir = pos.subtract(initlalGlobalXfo.tr)
      const dist = dir.normalizeInPlace()

      const orbit = new Quat()
      const pitch = new Quat()

      // Orbit
      {
        const currDir = initlalGlobalXfo.ori.getZaxis().clone()
        currDir.z = 0
        const newDir = dir.negate()
        newDir.z = 0

        orbit.setFrom2Vectors(currDir, newDir)
      }

      // Pitch
      {
        const currDir = initlalGlobalXfo.ori.getZaxis().clone()
        const newDir = dir.negate()
        currDir.x = newDir.x
        currDir.y = newDir.y
        currDir.normalizeInPlace()

        if (currDir.cross(newDir).dot(initlalGlobalXfo.ori.getXaxis()) > 0.0) pitch.rotateX(currDir.angleTo(newDir))
        else pitch.rotateX(-currDir.angleTo(newDir))
      }

      const targetGlobalXfo = initlalGlobalXfo.clone()
      targetGlobalXfo.ori = orbit.multiply(targetGlobalXfo.ori)
      targetGlobalXfo.ori.multiplyInPlace(pitch)

      // With each iteration we get closer to our goal
      // and on the final iteration we should aim perfectly at
      // the target.
      const t = Math.pow(i / count, 2)
      const globalXfo = initlalGlobalXfo.clone()
      globalXfo.ori = initlalGlobalXfo.ori.lerp(targetGlobalXfo.ori, t)

      camera.setFocalDistance(initlalDist + (dist - initlalDist) * t)
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
   * Causes an event to occur when a user double presses a pointer over an element.
   *
   * @param {MouseEvent|TouchEvent} event - The pointer event that occurs
   * @memberof CameraManipulator
   */
  onPointerDoublePress(event) {
    if (event.intersectionData) {
      const { viewport } = event
      const camera = viewport.getCamera()
      const cameraGlobalXfo = camera.getParameter('GlobalXfo').getValue()
      const pos = cameraGlobalXfo.tr.add(event.pointerRay.dir.scale(event.intersectionData.dist))
      this.aimFocus(event, pos)
    }

    event.preventDefault()
  }

  /**
   * Causes an event to occur when the user starts to drag an element.
   *
   * @param {PointerEvent} event - The mouse event that occurs.
   */
  onPointerDown(event) {
    if (event.pointerType === POINTER_TYPES.mouse) {
      if (this.__dragging) {
        const camera = this.__pointerDownViewport.getCamera()
        camera.getParameter('GlobalXfo').off('valueChanged', this.__globalXfoChangedDuringDrag)
        this.__dragging = false
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
   * Causes an event to occur when an element is being dragged.
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
    const pointerPos = event.pointerPos
    this.__calculatingDragAction = true
    if (this.__keyboardMovement) {
      this.__pointerDragDelta = pointerPos
    } else {
      this.__pointerDragDelta = pointerPos.subtract(this.__pointerDownPos)
    }
    switch (this.__manipulationState) {
      case MANIPULATION_MODES.turntable:
        this.turntable(event, this.__pointerDragDelta)
        break
      case MANIPULATION_MODES.tumbler:
        this.tumble(event, this.__pointerDragDelta)
        break
      case MANIPULATION_MODES.trackball:
        this.trackball(event, this.__pointerDragDelta)
        break
      case MANIPULATION_MODES.look:
        this.look(event, this.__pointerDragDelta)
        break
      case MANIPULATION_MODES.pan:
        this.pan(event, this.__pointerDragDelta)
        break
      case MANIPULATION_MODES.dolly:
        this.dolly(event, this.__pointerDragDelta)
        break
    }
    this.__dragging = true
    this.__calculatingDragAction = false
  }

  /**
   * The event that occurs when the user moves pointer across a touch screen.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   * @private
   */
  _onTouchMove(event) {
    this.__calculatingDragAction = true

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
      this.__manipMode = 'panAndZoom'
    }

    this.__calculatingDragAction = false
  }

  /**
   * Causes an event to occur when the user has finished dragging an element.
   *
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerUp(event) {
    event.stopPropagation()
    event.preventDefault()

    if (event.pointerType === POINTER_TYPES.mouse) {
      this.endDrag(event)

      if (!this.__pointerDragDelta.approxEqual(new Vec2(0, 0))) {
        this.emit('movementFinished', {})
        event.viewport.getCamera().emit('movementFinished', {})
      }
    } else if (event.pointerType === POINTER_TYPES.touch) {
      event.preventDefault()
      const touches = event.changedTouches

      for (let i = 0; i < touches.length; i++) {
        this.__endTouch(touches[i])
      }

      if (Object.keys(this.__ongoingTouches).length == 0) this.endDrag(event)
    }
  }

  /**
   * Causes an event to occur when the mouse wheel is rolled up or down over an element.
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
      if (this.__defaultManipulationState != MANIPULATION_MODES.walk) {
        camera.setFocalDistance(camera.getFocalDistance() + zoomDist)
      }
      camera.getParameter('GlobalXfo').setValue(xfo)

      count++
      if (count < 10) {
        this.__mouseWheelZoomIntervalId = setTimeout(applyMovement, 10)
      } else {
        this.__mouseWheelZoomIntervalId = undefined
        this.emit('movementFinished', {})
        camera.emit('movementFinished', {})
      }
    }
    applyMovement()

    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * The __integrateVelocityChange method.
   * @param {MouseEvent} event - The event value.
   * @private
   */
  __integrateVelocityChange(event) {
    const { viewport } = event
    const camera = viewport.getCamera()
    const delta = new Xfo()
    delta.tr = this.__velocity.normalize().scale(this.__maxVel)
    camera.getParameter('GlobalXfo').setValue(camera.getParameter('GlobalXfo').getValue().multiply(delta))
  }

  /**
   * Causes an event to occurs when the user presses a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The keyboard event that occurs.
   * @return {boolean} - The return value.
   * @private
   */
  onKeyPressed(event) {
    // Note: onKeyPressed is called initially only once, and then we
    // get a series of calls. Here we ignore subsequent events.
    // (TODO: move this logic to a special controller)
    /*
    const key = String.fromCharCode(event.keyCode).toLowerCase()
    switch (key) {
      case 'w':
        if (this.__keysPressed.includes(key))
          return false;
        this.__velocity.z -= 1.0;
        break;
      case 's':
        if (this.__keysPressed.includes(key))
          return false;
        this.__velocity.z += 1.0;
        break;
      case 'a':
        if (this.__keysPressed.includes(key))
          return false;
        this.__velocity.x -= 1.0;
        break;
      case 'd':
        if (this.__keysPressed.includes(key))
          return false;
        this.__velocity.x += 1.0;
        break;
      default:
        return false;
    }
    this.__keysPressed.push(key);
    if (!this.__keyboardMovement) {
      this.__keyboardMovement = true;
      let animationFrame = ()=>{
        this.__integrateVelocityChange(event)
        if (this.__keyboardMovement)
          window.requestAnimationFrame(animationFrame);
      }
      window.requestAnimationFrame(animationFrame);
    }
    */
    return false // no keys handled
  }

  /**
   * Causes an event to occur when the user is pressing a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The keyboard event that occurs.
   * @private
   */
  onKeyDown(event) {}

  /**
   * Causes an event to occur when the user releases a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event that occurs.
   * @private
   */
  onKeyUp(event) {
    // (TODO: move this logic to a special controller)
    /*
    const key = String.fromCharCode(event.keyCode).toLowerCase()
    switch (key) {
      case 'w':
        this.__velocity.z += 1.0;
        break;
      case 's':
        this.__velocity.z -= 1.0;
        break;
      case 'a':
        this.__velocity.x += 1.0;
        break;
      case 'd':
        this.__velocity.x -= 1.0;
        break;
      default:
        return false;
    }
    let keyIndex = this.__keysPressed.indexOf(key);
    this.__keysPressed.splice(keyIndex, 1);
    if (this.__keysPressed.length == 0)
      this.__keyboardMovement = false;
    */
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
   * Causes an event to occur when the user touches an element on a touch screen.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  _onTouchStart(event) {
    if (Object.keys(this.__ongoingTouches).length == 0) this.__manipMode = undefined

    const touches = event.changedTouches
    for (let i = 0; i < touches.length; i++) {
      this.__startTouch(touches[i])
    }

    // if (Object.keys(this.__ongoingTouches).length == 1) {
    this.initDrag(event)
    // }
  }

  /**
   * Causes an event to occur when the user removes his/her finger from an element.
   *
   * @param {TouchEvent} event - The touch event that occurs.
   */
  onTouchEnd(event) {
    event.preventDefault()
    event.stopPropagation()
    const touches = event.changedTouches
    // switch (this.__manipMode) {
    // case 'camera-manipulation':
    //     let touch = touches[0];
    //     let releasePos = new Vec2(touch.clientX, touch.clientY);
    //     viewport.getCamera().onDragEnd(event, releasePos);
    //     break;
    // }
    for (let i = 0; i < touches.length; i++) {
      this.__endTouch(touches[i])
    }

    if (Object.keys(this.__ongoingTouches).length == 0) this.endDrag(event)
  }

  /**
   * Causes an event to occur when the touch event gets interrupted.
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
