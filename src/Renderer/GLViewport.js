/* eslint-disable guard-for-in */
import { Vec2, Vec3, Ray, Mat4 } from '../Math/index'
import { Camera } from '../SceneTree/index'
import { GLBaseViewport } from './GLBaseViewport.js'
import { GLFbo } from './GLFbo.js'
import { GLTexture2D } from './GLTexture2D.js'
import { POINTER_TYPES } from '../Utilities/EnumUtils'
import { BaseTool } from '../SceneTree/index'
import { CameraManipulator } from '../SceneTree/index'

/**
 * Class representing a GL viewport.
 *
 * @extends GLBaseViewport
 */
class GLViewport extends GLBaseViewport {
  /**
   * Create a GL viewport.
   * @param {GLRenderer} renderer - The renderer value.
   * @param {string} name - The name value.
   * @param {number} width - The width of the viewport
   * @param {number} height - The height of the viewport
   */
  constructor(renderer, name, width, height) {
    super(renderer)
    this.__name = name
    this.__projectionMatrix = new Mat4()
    this.__frustumDim = new Vec2()

    // Layout coords, x:[0..1], y:[0..1]
    this.__bl = new Vec2(0, 0)
    this.__tr = new Vec2(1, 1)

    this.__exposure = 0.0
    this.__exposureRange = [-5, 10]
    this.__tonemap = true
    this.__gamma = 2.2
    this.__prevDownTime = 0

    this.__geomDataBuffer = undefined
    this.__geomDataBufferFbo = undefined

    // this.renderGeomDataFbo = this.renderGeomDataFbo.bind(this);

    // Each user has a separate camera, and so the default
    //  camera cannot be part of the scene.
    this.setCamera(new Camera('DefaultCamera'))
    this.setManipulator(new CameraManipulator({ renderer }))

    this.resize(width, height)
  }

  /**
   * Dynamically resizes viewport.
   *
   * @param {number} width - The width value.
   * @param {number} height - The height value.
   */
  resize(width, height) {
    this.__canvasWidth = width
    this.__canvasHeight = height
    this.__x = width * this.__bl.x
    this.__y = width * this.__bl.y
    this.__width = width * this.__tr.x - width * this.__bl.x
    this.__height = height * this.__tr.y - height * this.__bl.y
    this.region = [this.__x, this.__y, this.__width, this.__height]

    if (this.__camera) this.__updateProjectionMatrix()

    if (this.__geomDataBufferFbo) {
      this.__geomDataBuffer.resize(this.__width, this.__height)
      this.__geomDataBufferFbo.resize()

      this.renderGeomDataFbo()
    }

    this.emit('resized', { width, height })
  }

  /**
   * Returns current camera object
   *
   * @return {Camera} - The return value.
   */
  getCamera() {
    return this.__camera
  }

  /**
   * Sets current camera object
   *
   * @param {Camera} camera - The camera value.
   */
  setCamera(camera) {
    this.__camera = camera
    const globalXfoParam = camera.getParameter('GlobalXfo')
    const getCameraParams = () => {
      this.__cameraXfo = globalXfoParam.getValue()
      this.__cameraMat = this.__cameraXfo.toMat4()
      this.__viewMat = this.__cameraMat.inverse()
    }
    getCameraParams()
    globalXfoParam.on('valueChanged', () => {
      getCameraParams()
      this.invalidateGeomDataBuffer()
      this.emit('updated', {})
      this.emit('viewChanged', {
        interfaceType: 'CameraAndPointer',
        viewXfo: this.__cameraXfo,
        focalDistance: this.__camera.getFocalDistance(),
      })
    })
    this.__camera.on('projectionParamChanged', () => {
      this.__updateProjectionMatrix()
      this.emit('updated', {})
    })

    this.__updateProjectionMatrix()
  }

  /**
   * The getManipulator method.
   * @return {any} - The return value.
   */
  getManipulator() {
    return this.manipulator
  }

  /**
   * The setManipulator method.
   * @param {any} manipulator - The manipulator value.
   */
  setManipulator(manipulator) {
    if (this.manipulator != manipulator) {
      if (this.manipulator && this.manipulator.deactivateTool) {
        this.manipulator.deactivateTool()
      }

      this.manipulator = manipulator

      if (manipulator.activateTool) {
        manipulator.activateTool()
      }
    }
  }

  // eslint-disable-next-line require-jsdoc
  __updateProjectionMatrix() {
    const aspect = this.__width / this.__height
    this.__camera.updateProjectionMatrix(this.__projectionMatrix, aspect)

    const frustumH = Math.tan(this.__camera.getFov() / 2.0) * this.__camera.getNear() * 2.0
    const frustumW = frustumH * aspect
    this.__frustumDim.set(frustumW, frustumH)
  }

  /**
   * The getProjectionMatrix method.
   * @return {Mat4} - The return projection matrix for the viewport.
   */
  getProjectionMatrix() {
    return this.__projectionMatrix
  }

  /**
   * The getProjectionMatrix method.
   * @return {Mat4} - The return projection matrix for the viewport.
   */
  getViewMatrix() {
    return this.__viewMat
  }

  /**
   * The setActive method.
   * @param {boolean} state - The state value.
   */
  setActive(state) {
    if (state) activeViewport = this
    else activeViewport = undefined
  }

  /**
   * The frameView method.
   * @param {array} treeItems - The treeItems value.
   */
  frameView(treeItems) {
    if (this.__width > 0 && this.__height > 0) {
      this.__camera.frameView(this, treeItems)
    } else {
      // Wait till the window is resized and try again.
      this.once('resized', () => this.frameView())
    }
  }

  /**
   * Compute a ray into the scene based on a mouse coordinate.
   * @param {Vec2} screenPos - The screen position.
   * @return {Ray} - The return value.
   */
  calcRayFromScreenPos(screenPos) {
    // Convert the raster coordinates to screen space ([0,{w|h}] -> [-1,1]
    // - Note: The raster vertical is inverted wrt OGL screenspace Y

    const topy = this.__canvasHeight * (1.0 - this.__tr.y)
    let sx = (screenPos.x - this.__x) / this.__width
    let sy = (screenPos.y - topy) / this.__height

    sx = sx * 2.0 - 1.0
    sy = sy * 2.0 - 1.0

    // Transform the origin from camera local to world space
    const cameraMat = this.__cameraMat

    const projInv = this.__projectionMatrix.inverse()
    if (projInv == null)
      // Sometimes this happens, not sure why...
      return null

    let rayStart
    let rayDirection
    if (this.__camera.getIsOrthographic()) {
      // Orthographic projections.
      rayStart = cameraMat.transformVec3(projInv.transformVec3(new Vec3(sx, -sy, -1.0)))
      rayDirection = new Vec3(0.0, 0.0, -1.0)
    } else {
      rayStart = cameraMat.translation
      // Get the projected window coordinate on the near plane
      // See http://www.songho.ca/opengl/gl_projectionmatrix.html
      // for details.
      rayDirection = projInv.transformVec3(new Vec3(sx, -sy, -1.0))
    }
    // And from projection space to camera local.
    // - We nuke the translation part since we're transforming a vector.
    rayDirection = cameraMat.rotateVec3(rayDirection).normalize()
    return new Ray(rayStart, rayDirection)
  }

  // //////////////////////////
  // GeomData

  /**
   * The createGeomDataFbo method.
   * @param {boolean} floatGeomBuffer - true if the GPU supports rendering
   * to floating point textures.
   */
  createGeomDataFbo(floatGeomBuffer) {
    const gl = this.__renderer.gl
    this.__floatGeomBuffer = floatGeomBuffer
    if (this.__floatGeomBuffer) {
      this.__geomDataBuffer = new GLTexture2D(gl, {
        type: 'FLOAT',
        format: 'RGBA',
        filter: 'NEAREST',
        width: this.__width <= 1 ? 1 : this.__width,
        height: this.__height <= 1 ? 1 : this.__height,
      })
    } else {
      this.__geomDataBuffer = new GLTexture2D(gl, {
        type: 'UNSIGNED_BYTE',
        format: 'RGBA',
        filter: 'NEAREST',
        width: this.__width <= 1 ? 1 : this.__width,
        height: this.__height <= 1 ? 1 : this.__height,
      })
    }
    this.__geomDataBufferFbo = new GLFbo(gl, this.__geomDataBuffer, true)
    this.__geomDataBufferFbo.setClearColor([0, 0, 0, 0])
  }

  /**
   * The getGeomDataFbo method.
   * @return {GLFbo} - The return value.
   */
  getGeomDataFbo() {
    return this.__geomDataBufferFbo
  }

  /**
   * Renders the scene geometry to the viewports geom data buffer
   * in preparation for mouse picking.
   */
  renderGeomDataFbo() {
    if (this.__geomDataBufferFbo) {
      this.__geomDataBufferFbo.bindAndClear()

      const renderstate = {}
      this.__initRenderState(renderstate)
      this.__renderer.drawSceneGeomData(renderstate)
      this.__geomDataBufferInvalid = false
    }
  }

  /**
   * The invalidateGeomDataBuffer method.
   */
  invalidateGeomDataBuffer() {
    this.__geomDataBufferInvalid = true
  }

  /**
   * The getGeomDataAtPos method.
   * @param {Vec2} screenPos - The screen position.
   * @param {Ray} pointerRay - The pointerRay value.
   * @return {object} - The return value.
   */
  getGeomDataAtPos(screenPos, pointerRay) {
    if (this.__geomDataBufferFbo) {
      if (this.__geomDataBufferInvalid) {
        this.renderGeomDataFbo()
        this.__screenPos = null
      }

      // Cache the intersection tests result so subsequent queries will return the same value.
      // Note: every new mouse event will generate a new pointerPos value, so the cache
      // is only valid for a given event propagation, and for that exact pointerPos value.
      if (screenPos === this.__screenPos) {
        return this.__intersectionData
      }
      this.__screenPos = screenPos
      this.__intersectionData = null

      const gl = this.__renderer.gl
      gl.finish()

      this.__geomDataBufferFbo.bindForReading()

      // const logGeomData = ()=>{
      //     console.log("logGeomData :[" + this.__geomDataBuffer.width +","+ this.__geomDataBuffer.height + "]")
      //     const pixels = new Float32Array(this.__geomDataBuffer.width * 4);
      //     for(let i=0; i<this.__geomDataBuffer.height; i++){
      //       gl.readPixels(0, i, this.__geomDataBuffer.width, 1, gl.RGBA, gl.FLOAT, pixels);
      //         for(let j=0; j<this.__geomDataBuffer.width; j++){
      //             const geomData = pixels.subarray(j*4, (j+1)*4);
      //             if (geomData[0] != 0 || geomData[1] != 0){
      //                 console.log(j, i)
      //                 break; // Only log the left border pixels.
      //             }
      //         }
      //       // console.log(pixels);
      //     }
      // }
      // logGeomData();
      // console.log("getGeomDataAtPos:", screenPos.toString(), screenPos.x,this.__width)

      // Allocate a 1 pixel block and read grom the GeomData buffer.
      let passId
      let geomData
      if (gl.floatGeomBuffer) {
        geomData = new Float32Array(4)
        gl.readPixels(screenPos.x, this.__height - screenPos.y, 1, 1, gl.RGBA, gl.FLOAT, geomData)
        if (geomData[3] == 0) return undefined
        // Mask the pass id to be only the first 6 bits of the integer.
        passId = Math.round(geomData[0]) & (64 - 1)
      } else {
        geomData = new Uint8Array(4)
        gl.readPixels(screenPos.x, this.__height - screenPos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, geomData)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        if (geomData[0] == 0 && geomData[1] == 0) return undefined
        passId = Math.floor(geomData[1] / 64)
      }
      this.__geomDataBufferFbo.unbind()
      const pass = this.__renderer.getPass(passId)
      if (!pass) {
        console.warn('Geom data buffer returns invalid pass id:', passId)
        return
      }

      const geomItemAndDist = pass.getGeomItemAndDist(geomData)

      if (geomItemAndDist) {
        const materialParameter = geomItemAndDist.geomItem.getParameter('Material')
        if (materialParameter && !materialParameter.getValue().visibleInGeomDataBuffer) return

        if (!pointerRay) pointerRay = this.calcRayFromScreenPos(screenPos)
        const intersectionPos = pointerRay.start.add(pointerRay.dir.scale(geomItemAndDist.dist))
        this.__intersectionData = {
          screenPos,
          pointerRay,
          intersectionPos,
          geomItem: geomItemAndDist.geomItem,
          dist: geomItemAndDist.dist,
          geomData,
        }
      }

      return this.__intersectionData
    }
  }

  /**
   * getGeomItemsInRect
   * Gathers all the geoms renders in a given rectangle of the viewport.
   * @param {Vec2} tl - The top left value of the rectangle.
   * @param {Vec2} br - The bottom right corner of the rectangle.
   * @return {Set} - The return value.
   */
  getGeomItemsInRect(tl, br) {
    // TODO: Use a Math.Rect instead
    if (this.__geomDataBufferFbo) {
      const gl = this.__renderer.gl
      gl.finish()
      // Allocate a pixel block.
      const rectBottom = Math.round(this.__height - br.y)
      const rectLeft = Math.round(tl.x)
      const rectWidth = Math.round(br.x - tl.x)
      const rectHeight = Math.round(br.y - tl.y)
      const numPixels = rectWidth * rectHeight

      this.__geomDataBufferFbo.bindForReading()

      let geomDatas
      if (gl.floatGeomBuffer) {
        geomDatas = new Float32Array(4 * numPixels)
        gl.readPixels(rectLeft, rectBottom, rectWidth, rectHeight, gl.RGBA, gl.FLOAT, geomDatas)
      } else {
        geomDatas = new Uint8Array(4 * numPixels)
        gl.readPixels(rectLeft, rectBottom, rectWidth, rectHeight, gl.RGBA, gl.UNSIGNED_BYTE, geomDatas)
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)

      const geomItems = new Set()
      for (let i = 0; i < numPixels; i++) {
        let passId
        const geomData = geomDatas.subarray(i * 4, (i + 1) * 4)
        if (gl.floatGeomBuffer) {
          if (geomData[3] == 0) continue
          passId = Math.round(geomData[0])
        } else {
          if (geomData[0] == 0 && geomData[1] == 0) continue
          passId = Math.floor(geomData[1] / 64)
        }

        const geomItemAndDist = this.__renderer.getPass(passId).getGeomItemAndDist(geomData)
        if (geomItemAndDist) {
          const materialParameter = geomItemAndDist.geomItem.getParameter('Material')
          if (materialParameter && !materialParameter.getValue().visibleInGeomDataBuffer) continue

          geomItems.add(geomItemAndDist.geomItem)
        }
      }

      return [...geomItems].filter((geomItem) => {
        const materialParameter = geomItem.getParameter('Material')
        if (materialParameter && !materialParameter.getValue().visibleInGeomDataBuffer) return false

        return true
      })
    }
  }

  // ///////////////////////////
  // Events
  /**
   * Calculates the event coordinates relative to the viewport.
   * There could be multiple viewports connected to the current renderer.
   *
   * @param {number} rendererX - The rendererX value
   * @param {number} rendererY - The rendererY value
   * @return {Vec2} - Returns a new Vec2.
   * @private
   */
  __getPointerPos(rendererX, rendererY) {
    return new Vec2(rendererX - this.getPosX(), rendererY - this.getPosY())
  }

  /**
   * The getCapture method.
   * @return {BaseItem} - The return value.
   */
  getCapture() {
    return this.capturedItem
  }

  /**
   * The releaseCapture method.
   */
  releaseCapture() {
    this.capturedItem = null
    // TODO: This should be a request, wbihch is fulfilled next time
    // a frame is dranw.
    this.renderGeomDataFbo()
  }

  /**
   * Prepares pointer event by adding properties of the engine to it.
   *
   * @param {MouseEvent|TouchEvent} event - The event that occurs in the canvas
   * @private
   */
  __preparePointerEvent(event) {
    event.viewport = this

    event.setCapture = (item) => {
      this.capturedItem = item
    }

    event.getCapture = (item) => {
      return this.capturedItem
    }

    event.releaseCapture = () => {
      this.capturedItem = null
      // TODO: This should be a request, which is fulfilled next time
      // a frame is drawn.
      this.renderGeomDataFbo()
    }
  }

  /**
   * Handler of the `pointerdown` event fired when the pointer device is initially pressed.
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   * @return {boolean} -
   */
  onPointerDown(event) {
    this.__preparePointerEvent(event)

    if (event.pointerType === POINTER_TYPES.mouse) {
      event.pointerPos = this.__getPointerPos(event.rendererX, event.rendererY)

      event.pointerRay = this.calcRayFromScreenPos(event.pointerPos)
      event.intersectionData = this.getGeomDataAtPos(event.pointerPos, event.pointerRay)
    } else if (event.pointerType === POINTER_TYPES.touch) {
      if (event.touches.length == 1) {
        const touch = event.touches[0]
        event.pointerPos = this.__getPointerPos(touch.rendererX, touch.rendererY)

        event.pointerRay = this.calcRayFromScreenPos(event.pointerPos)
        event.intersectionData = this.getGeomDataAtPos(event.pointerPos, event.pointerRay)
      }
    }

    if (this.capturedItem) {
      this.capturedItem.onPointerDown(event)
      return
    }

    if (event.intersectionData != undefined) {
      event.intersectionData.geomItem.onPointerDown(event)

      if (!event.propagating || this.capturedItem) return

      this.emit('pointerDownOnGeom', event)
    }

    const downTime = Date.now()
    if (downTime - this.__prevDownTime < this.__doubleClickTimeMSParam.getValue()) {
      if (this.manipulator) {
        this.manipulator.onPointerDoublePress(event)
        if (!event.propagating) return
      }

      this.emit('pointerDoublePressed', event)
    } else {
      this.__prevDownTime = downTime
      if (!event.propagating || this.capturedItem) return

      this.emit('pointerDown', event)
      if (!event.propagating) return

      if (this.manipulator) {
        this.manipulator.onPointerDown(event)

        if (!event.propagating) return
      }
    }

    return false
  }

  /**
   * Causes an event to occur when a user releases a mouse button over a element.
   *
   * @param {MouseEvent|TouchEvent} event - The event that occurs.
   */
  onPointerUp(event) {
    this.__preparePointerEvent(event)

    if (event.pointerType === POINTER_TYPES.mouse) {
      event.pointerPos = this.__getPointerPos(event.rendererX, event.rendererY)
      event.pointerRay = this.calcRayFromScreenPos(event.pointerPos)
      event.intersectionData = this.getGeomDataAtPos(event.pointerPos, event.pointerRay)
    } else if (event.pointerType === POINTER_TYPES.touch) {
      if (event.touches.length == 0 && event.changedTouches.length == 1) {
        const touch = event.changedTouches[0]
        event.pointerPos = this.__getPointerPos(touch.rendererX, touch.rendererY)
        event.pointerRay = this.calcRayFromScreenPos(event.pointerPos)
        event.intersectionData = this.getGeomDataAtPos(event.pointerPos, event.pointerRay)
      }
    }

    if (this.capturedItem) {
      this.capturedItem.onPointerUp(event)
      return
    }

    if (event.intersectionData != undefined) {
      event.intersectionData.geomItem.onPointerUp(event)
      if (!event.propagating) return
    }

    this.emit('pointerUp', event)
    if (!event.propagating) return

    if (this.manipulator) {
      this.manipulator.onPointerUp(event)

      if (!event.propagating) return
    }
  }

  /**
   * Causes an event to occur when the pointer device is moving.
   *
   * @param {MouseEvent|TouchEvent} event - The event that occurs.
   */
  onPointerMove(event) {
    this.__preparePointerEvent(event)

    if (event.pointerType === POINTER_TYPES.mouse) {
      const pointerPos = this.__getPointerPos(event.rendererX, event.rendererY)
      event.pointerPos = pointerPos
      event.pointerRay = this.calcRayFromScreenPos(pointerPos)
    } else if (event.pointerType === POINTER_TYPES.touch) {
      event.touchPos = []
      event.touchRay = []
      for (let index = 0; index < event.touches.length; index++) {
        const touch = event.touches[index]
        const touchPos = this.__getPointerPos(touch.rendererX, touch.rendererY)
        event.touchPos[index] = touchPos
        event.touchRay[index] = this.calcRayFromScreenPos(touchPos)
      }

      event.pointerPos = event.touchPos[0]
      event.pointerRay = event.touchRay[0]
    }

    event.intersectionData = this.getGeomDataAtPos(event.pointerPos, event.pointerRay)
    if (this.capturedItem) {
      this.capturedItem.onPointerMove(event)
      return
    }

    if (event.intersectionData) {
      if (event.intersectionData.geomItem != this.pointerOverItem) {
        if (this.pointerOverItem) {
          event.leftGeometry = this.pointerOverItem
          this.pointerOverItem.onPointerLeave(event)

          if (event.propagating) this.emit('pointerLeaveGeom', event)
        }

        this.pointerOverItem = event.intersectionData.geomItem
        this.pointerOverItem.onPointerEnter(event)

        if (!event.propagating) return

        this.emit('pointerOverGeom', event)
      }

      event.intersectionData.geomItem.onPointerMove(event)
      if (!event.propagating || this.capturedItem) return
    } else if (this.pointerOverItem) {
      event.leftGeometry = this.pointerOverItem
      this.pointerOverItem.onPointerLeave(event)
      this.pointerOverItem = null

      if (!event.propagating) return

      this.emit('pointerLeaveGeom', event)
    }

    this.emit('pointerMove', event)
    if (!event.propagating) return

    if (this.manipulator) {
      this.manipulator.onPointerMove(event)
      if (!event.propagating) return
    }
  }

  /**
   * Causes an event to occur when the mouse pointer is moved into this viewport
   * @param {MouseEvent|TouchEvent} event - The event that occurs.
   */
  onPointerEnter(event) {
    this.__preparePointerEvent(event)
    this.emit('pointerEnter', event)
    if (!event.propagating) return

    if (this.manipulator && this.manipulator.onPointerEnter) {
      this.manipulator.onPointerEnter(event)
      if (!event.propagating) return
    }
  }

  /**
   * Causes an event to occur when the mouse pointer is moved out of this viewport
   * @param {MouseEvent|TouchEvent} event - The event that occurs.
   */
  onPointerLeave(event) {
    this.__preparePointerEvent(event)
    this.emit('pointerLeave', event)
    if (!event.propagating) return

    if (this.manipulator && this.manipulator.onPointerLeave) {
      this.manipulator.onPointerLeave(event)
      if (!event.propagating) return
    }
  }

  /**
   * Causes an event to occurs when the user presses a key on the keyboard.
   * @param {KeyboardEvent} event - The event that occurs.
   */
  onKeyPressed(event) {
    this.__preparePointerEvent(event)
    if (this.manipulator) {
      if (this.manipulator.onKeyPressed(event)) return
    }
    this.emit('keyPressed', event)
  }

  /**
   * Causes an event to occur when the user is pressing a key on the keyboard.
   * @param {KeyboardEvent} event - The event that occurs.
   */
  onKeyDown(event) {
    this.__preparePointerEvent(event)
    if (this.manipulator) {
      if (this.manipulator.onKeyDown(event)) return
    }
    this.emit('keyDown', event)
  }

  /**
   * Causes an event to occur  when the user releases a key on the keyboard.
   * @param {KeyboardEvent} event - The event that occurs.
   */
  onKeyUp(event) {
    this.__preparePointerEvent(event)
    if (this.manipulator) {
      if (this.manipulator.onKeyUp(event)) return
    }
    this.emit('keyUp', event)
  }

  /**
   * Causes an event to occur when the mouse wheel is rolled up or down over an element.
   * @param {MouoseWheelEvent} event - The event that occurs.
   */
  onWheel(event) {
    this.__preparePointerEvent(event)
    if (event.intersectionData != undefined) {
      event.intersectionData.geomItem.onWheel(event)
      if (!event.propagating) return
    }

    if (this.manipulator) {
      this.manipulator.onWheel(event)
      return
    }
    this.emit('mouseWheel', event)
  }

  // Touch events

  /**
   * Causes an event to occur when the touch event gets interrupted.
   * @param {TouchEvent} event - The event that occurs.
   */
  onTouchCancel(event) {
    this.__preparePointerEvent(event)

    if (this.capturedItem) {
      this.capturedItem.onTouchCancel(event)
      return
    }

    if (this.manipulator) {
      this.manipulator.onTouchCancel(event)
      return
    }
    this.emit('touchCancel', event)
  }

  // //////////////////////////
  // Rendering

  /**
   * The __initRenderState method.
   * @param {any} renderstate - The renderstate value.
   * @private
   */
  __initRenderState(renderstate) {
    // console.log(this.__viewMat.toString())
    renderstate.viewXfo = this.__cameraXfo
    renderstate.viewScale = 1.0
    renderstate.region = this.region
    renderstate.cameraMatrix = this.__cameraMat
    renderstate.viewport = this
    renderstate.viewports = [
      {
        region: this.region,
        viewMatrix: this.__viewMat,
        projectionMatrix: this.__projectionMatrix,
        viewportFrustumSize: this.__frustumDim,
        isOrthographic: this.__camera.getIsOrthographic(),
        fovY: this.__camera.getFov(),
      },
    ]
  }

  /**
   * The draw method.
   */
  draw() {
    const gl = this.__renderer.gl

    // Make sure the default fbo is bound
    // Note: Sometimes an Fbo is left bound
    // from anohter op(like resizing, populating etc..)
    // We need to unbind here to ensure rendering is to the
    // right target.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(...this.region)

    if (this.__backgroundColor) gl.clearColor(...this.__backgroundColor.asArray())
    gl.colorMask(true, true, true, true)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const renderstate = {}
    this.__initRenderState(renderstate)
    this.__renderer.drawScene(renderstate)

    // Turn this on to debug the geom data buffer.
    // {
    //     gl.screenQuad.bindShader(renderstate);
    //     gl.screenQuad.draw(renderstate, this.__geomDataBuffer);
    // }
  }
}

export { GLViewport }
