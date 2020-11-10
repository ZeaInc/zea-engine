import { SystemDesc } from '../../SystemDesc.js'
import { Vec3, Mat4, Xfo } from '../../Math/index'
import { TreeItem } from '../../SceneTree/index'
import { GLBaseViewport } from '../GLBaseViewport.js'
import { VRHead } from './VRHead.js'
import { VRController } from './VRController.js'
import { resourceLoader } from '../../SceneTree/resourceLoader.js'

/** Class representing a VR viewport.
 * @extends GLBaseViewport
 */
class VRViewport extends GLBaseViewport {
  /**
   * Create a VR viewport.
   * @param {any} renderer - The renderer value.
   */
  constructor(renderer) {
    super(renderer)
    this.getParameter('DoubleClickTimeMS').setValue(300)

    // ////////////////////////////////////////////
    // Viewport params
    this.__projectionMatriciesUpdated = false

    // These values are in meters.
    this.__far = 1024.0
    this.__near = 0.1
    // ////////////////////////////////////////////
    // Tree

    this.__stageTreeItem = new TreeItem('VRStage')
    this.__stageTreeItem.setSelectable(false)
    this.__stageTreeItem.setVisible(false)
    this.__renderer.addTreeItem(this.__stageTreeItem)

    this.__vrhead = new VRHead(this.__renderer.gl, this.__stageTreeItem)

    this.__vrControllersMap = {}
    this.__vrControllers = []

    // ////////////////////////////////////////////
    // Xfos
    const xfo = new Xfo()
    // Convert Y-Up to Z-Up.
    xfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * 0.5)
    this.setXfo(xfo) // Reset the stage Xfo.

    this.__leftViewMatrix = new Mat4()
    this.__leftProjectionMatrix = new Mat4()
    this.__rightViewMatrix = new Mat4()
    this.__rightProjectionMatrix = new Mat4()
  }

  /**
   * The getVRDisplay method.
   * @return {any} - The return value.
   */
  getVRDisplay() {
    return this.__vrDisplay
  }

  /**
   * The getAsset method.
   * @return {any} - The return value.
   */
  getAsset() {
    return this.__vrAsset
  }

  /**
   * The getTreeItem method.
   * @return {any} - The return value.
   */
  getTreeItem() {
    return this.__stageTreeItem
  }

  /**
   * The getVRHead method.
   * @return {any} - The return value.
   */
  getVRHead() {
    return this.__vrhead
  }

  /**
   * The getXfo method.
   * @return {Xfo} - The return value.
   */
  getXfo() {
    return this.__stageXfo
  }

  /**
   * The setXfo method.
   * @param {Xfo} xfo - The xfo value.
   */
  setXfo(xfo) {
    this.__stageXfo = xfo
    this.__stageTreeItem.getParameter('GlobalXfo').setValue(xfo)
    this.__stageMatrix = xfo.inverse().toMat4()
    // this.__stageMatrix.multiplyInPlace(this.__sittingToStandingMatrix);
    this.__stageScale = xfo.sc.x
  }

  /**
   * The getControllers method.
   * @return {any} - The return value.
   */
  getControllers() {
    return this.__vrControllers
  }

  // //////////////////////////
  // Presenting

  /**
   * The canPresent method.
   * @return {any} - The return value.
   */
  canPresent() {
    return this.__canPresent
  }

  /**
   * The isPresenting method.
   * @return {boolean} - The return value.
   */
  isPresenting() {
    return this.__session
  }

  /**
   * The __startSession method.
   * @private
   */
  __startSession() {
    const onAnimationFrame = (t, frame) => {
      if (this.__session) {
        this.__session.requestAnimationFrame(onAnimationFrame)
        this.draw(frame)
        // console.log(frame)
        // let pose = frame.getViewerPose(this.__refSpace);
        // if(pose) {
        //     console.log(pose)
        //     this.__session.end();
        // }
        // else {
        //     this.__session.requestAnimationFrame(onAnimationFrame);
        // }
      }
    }
    this.__session.requestAnimationFrame(onAnimationFrame)
  }

  /**
   * The loadHMDResources method.
   * @return {any} - The return value.
   */
  loadHMDResources() {
    // If the HMD has changed, reset it.
    const hmd = localStorage.getItem('hmd')
    if (this.__hmd != hmd) {
      this.__hmdAssetPromise = undefined
    }

    if (this.__hmdAssetPromise) return this.__hmdAssetPromise

    this.__hmd = hmd
    this.__hmdAssetPromise = new Promise((resolve, reject) => {
      // ////////////////////////////////////////////
      // Resources

      // Note: when the VRViewport is setup
      const sceneSet = (event) => {
        const scene = event.scene

        let assetPath
        switch (hmd) {
          case 'Vive':
            assetPath = 'ZeaEngine/Vive.vla'
            break
          case 'Oculus':
            assetPath = 'ZeaEngine/Oculus.vla'
            break
          default:
            assetPath = 'ZeaEngine/Oculus.vla'
            break
        }

        const hmdAssetId = resourceLoader.resolveFilePathToId(assetPath)
        if (hmdAssetId && !SystemDesc.isMobileDevice) {
          this.__vrAsset = resourceLoader.loadCommonAssetResource(hmdAssetId)
          this.__vrAsset.on('loaded', () => {
            const materialLibrary = this.__vrAsset.getMaterialLibrary()
            const materialNames = materialLibrary.getMaterialNames()
            for (const name of materialNames) {
              const material = materialLibrary.getMaterial(name, false)
              if (material) {
                material.visibleInGeomDataBuffer = false
                material.setShaderName('SimpleSurfaceShader')
              }
            }
            resolve(this.__vrAsset)
          })
        } else reject()
      }
      this.__renderer.on('sceneSet', sceneSet)
    })
    return this.__hmdAssetPromise
  }

  /**
   * The startPresenting method.
   */
  startPresenting() {
    return new Promise((resolve, reject) => {
      // https://github.com/immersive-web/webxr/blob/master/explainer.md

      const gl = this.__renderer.gl

      const __startPresenting = () => {
        navigator.xr
          .requestSession('immersive-vr', {
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['bounded-floor'],
          })
          .then((session) => {
            this.__renderer.__xrViewportPresenting = true

            let mirrorCanvas
            if (!SystemDesc.isMobileDevice) {
              // Add an output canvas that will allow XR to also send a view
              // back the monitor.
              mirrorCanvas = document.createElement('canvas')
              mirrorCanvas.style.position = 'relative'
              mirrorCanvas.style.left = '0px'
              mirrorCanvas.style.top = '0px'
              mirrorCanvas.style.width = '100%'
              mirrorCanvas.style.height = '100%'

              this.__renderer.getDiv().replaceChild(mirrorCanvas, this.__renderer.getGLCanvas())

              session.on('end', (event) => {
                this.__renderer.getDiv().replaceChild(this.__renderer.getGLCanvas(), mirrorCanvas)
              })
            }

            session.on('end', (event) => {
              this.__stageTreeItem.setVisible(false)
              this.__session = null
              this.emit('presentingChanged', { state: false })
            })

            const onSelectStart = (ev) => {
              const controller = this.__vrControllersMap[ev.inputSource.handedness]
              if (controller) {
                const downTime = Date.now()
                console.log('controller:', ev.inputSource.handedness, ' down', downTime - controller.__prevDownTime)
                if (downTime - controller.__prevDownTime < this.__doubleClickTimeMSParam.getValue()) {
                  this.emit(
                    'controllerDoubleClicked',
                    {
                      button: 1,
                      controller,
                      vleStopPropagation: false,
                      vrviewport: this,
                    },
                    this
                  )
                } else {
                  controller.__prevDownTime = downTime

                  this.emit(
                    'controllerButtonDown',
                    {
                      button: 1,
                      controller,
                      vleStopPropagation: false,
                      vrviewport: this,
                    },
                    this
                  )
                }
              }
            }
            const onSelectEnd = (ev) => {
              const controller = this.__vrControllersMap[ev.inputSource.handedness]
              if (controller) {
                console.log('controller:', ev.inputSource.handedness, ' up')
                this.emit(
                  'controllerButtonUp',
                  {
                    button: 1,
                    controller,
                    vleStopPropagation: false,
                    vrviewport: this,
                  },
                  this
                )
              }
            }
            session.on('selectstart', onSelectStart)
            session.on('selectend', onSelectEnd)

            this.__session = session

            // ////////////////////////////
            // Old code
            // this.__session.baseLayer = new XRWebGLLayer(session, gl);

            // New code
            session.updateRenderState({
              baseLayer: new XRWebGLLayer(session, gl, {
                compositionDisabled: session.mode == 'inline',
              }),
              outputContext: mirrorCanvas ? mirrorCanvas.getContext('xrpresent') : null,
            })
            // ////////////////////////////

            // Get a stage frame of reference, which will align the user's physical
            // floor with Y=0 and can provide boundaries that indicate where the
            // user can safely walk. If the system can't natively provide stage
            // coordinates (for example, with a 3DoF device) then it will return an
            // emulated stage, where the view is translated up by a static height so
            // that the scene still renders in approximately the right place.

            // If a bounded reference space isn't supported, fall back to a
            // stationary/floor-level reference space. This still provides a
            // floor-relative space and will always be supported for
            // immersive sessions. It will not, however, provide boundaries
            // and generally expects the user to stand in one place.
            // If the device doesn't have a way of determining the floor
            // level (for example, with a 3DoF device) then it will return
            // an emulated floor-level space, where the view is translated
            // up by a static height so that the scene still renders in
            // approximately the right place.
            //   console.log('Falling back to floor-level reference space');
            session
              .requestReferenceSpace(SystemDesc.isMobileDevice ? 'local' : 'local-floor')
              .catch((e) => {
                // if (!session.mode.startsWith('immersive')) {
                // If we're in inline mode, our underlying platform may not support
                // the stationary reference space, but an identity space is guaranteed.
                console.log('Falling back to identity reference space')
                return session.requestReferenceSpace('viewer').then((refSpace) => {
                  // If we use an identity reference space we need to scoot the
                  // origin down a bit to put the camera at approximately the
                  // right level. (Here we're moving it 1.6 meters, which should
                  // *very* roughly align us with the eye height of an "average"
                  // adult human.)
                  return refSpace.getOffsetReferenceSpace(new XRRigidTransform({ y: -1.6 }))
                })
                // } else {
                //   throw e
                // }
              })
              .then((refSpace) => {
                this.__refSpace = refSpace
                this.__stageTreeItem.setVisible(true)
                this.emit('presentingChanged', { state: true })
                this.__startSession()

                resolve()
              })
              .catch((e) => {
                console.warn(e.message)
                reject('Unable to start XR Session:' + e.message)
              })
          })
          .catch((e) => {
            console.warn(e.message)
          })
      }

      if (SystemDesc.isMobileDevice) {
        __startPresenting()
      } else {
        // Note: we should not need to load the resources here
        // They could be loaded only once the controllers are
        // being created. However, I can't see the controllers if
        // the loading is defered
        this.loadHMDResources().then(__startPresenting)
      }
    })
  }

  /**
   * The stopPresenting method.
   */
  stopPresenting() {
    if (!this.__session) return

    this.__session.end()
  }

  /**
   * The togglePresenting method.
   */
  togglePresenting() {
    if (this.__session) this.stopPresenting()
    else this.startPresenting()
  }

  /**
   * The getHMDCanvasSize method.
   * @return {any} - The return value.
   */
  getHMDCanvasSize() {
    return this.__hmdCanvasSize
  }

  // //////////////////////////
  // Controllers

  /**
   * The __createController method.
   * @param {any} id - The id value.
   * @param {any} inputSource - The inputSource value.
   * @return {any} - The return value.
   * @private
   */
  __createController(id, inputSource) {
    console.log('creating controller:', inputSource.handedness)
    const controller = new VRController(this, inputSource, id)
    this.__vrControllersMap[inputSource.handedness] = controller
    this.__vrControllers[id] = controller
    this.emit('controllerAdded', { controller })
    return vrController
  }

  /**
   * The updateControllers method.
   * @param {any} xrFrame - The xrFrame value.
   */
  updateControllers(xrFrame) {
    const inputSources = this.__session.inputSources
    for (let i = 0; i < inputSources.length; i++) {
      const inputSource = inputSources[i]

      // Note: This is to avoid a bug/feature in WebXR where initially the
      // controllers have no handedness specified, then suddenly
      // get handedness. We need the handedness before we can setup the controller.
      if (inputSource.handedness == '' || inputSource.handedness == 'none') return

      if (!this.__vrControllers[i]) {
        this.__createController(i, inputSource)
      }
      this.__vrControllers[i].updatePose(this.__refSpace, xrFrame, inputSource)
    }
  }

  /**
   * The draw method.
   * @param {any} xrFrame - The xrFrame value.
   */
  draw(xrFrame) {
    const session = xrFrame.session
    // Assumed to be a XRWebGLLayer for now.

    // Old
    // const layer = session.baseLayer;
    // New
    const layer = session.renderState.baseLayer

    const pose = xrFrame.getViewerPose(this.__refSpace)
    const views = pose.views

    if (!this.__projectionMatriciesUpdated) {
      this.__projectionMatrices = []
      this.__viewMatrices = []
      this.__cameraMatrices = []
      this.__region = [0, 0, 0, 0]
      for (let i = 0; i < views.length; i++) {
        const view = views[i]
        const projMat = new Mat4()
        projMat.setDataArray(view.projectionMatrix)
        this.__projectionMatrices[i] = projMat
        this.__viewMatrices[i] = new Mat4()
        this.__cameraMatrices[i] = new Mat4()

        const vp = layer.getViewport(view)
        this.__region[2] = Math.max(this.__region[2], vp.x + vp.width)
        this.__region[3] = Math.max(this.__region[3], vp.y + vp.height)
      }

      this.__renderer.resizeFbos(this.__region[2], this.__region[3])
      this.__projectionMatriciesUpdated = true
    }

    const gl = this.__renderer.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer)

    if (this.__backgroundColor) gl.clearColor(...this.__backgroundColor.asArray())
    gl.colorMask(true, true, true, true)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const renderstate = {
      boundRendertarget: layer.framebuffer,
      region: this.__region,
      vrviewport: this,
      viewports: [],
    }
    // renderstate.boundRendertarget.vrfbo = true;

    for (let i = 0; i < views.length; i++) {
      const view = views[i]
      this.__viewMatrices[i].setDataArray(view.transform.inverse.matrix)
      this.__viewMatrices[i].multiplyInPlace(this.__stageMatrix)
      // this.__cameraMatrices[i].setDataArray(view.transform.matrix);

      const vp = layer.getViewport(view)
      renderstate.viewports.push({
        viewMatrix: this.__viewMatrices[i],
        projectionMatrix: this.__projectionMatrices[i],
        region: [vp.x, vp.y, vp.width, vp.height],
      })
    }

    this.__vrhead.update(pose)

    this.updateControllers(xrFrame)

    renderstate.viewXfo = this.__vrhead.getTreeItem().getParameter('GlobalXfo').getValue()
    renderstate.viewScale = 1.0 / this.__stageScale
    renderstate.cameraMatrix = renderstate.viewXfo.toMat4()
    renderstate.region = this.__region
    renderstate.vrPresenting = true // Some rendering is ajusted slightly in VR. e.g. Billboards

    this.__renderer.drawScene(renderstate)

    if (this.capturedElement) {
      const event = {
        viewport: this,
      }
      this.capturedElement.onPointerMove(event)
    }

    // ///////////////////////
    // Emit a signal for the shared session.
    const data = {
      interfaceType: 'VR',
      hmd: this.__hmd,
      viewXfo: renderstate.viewXfo,
      controllers: this.__vrControllers,
      vrviewport: this,
    }
    this.emit('viewChanged', data)
  }

  /**
   * The setCapture method.
   * @param {any} target - The target value.
   * @private
   */
  setCapture(target) {
    this.capturedElement = target
  }

  /**
   * The getCapture method.
   * @return {any} - The return value.
   */
  getCapture() {
    return this.capturedElement
  }

  /**
   * The releaseCapture method.
   */
  releaseCapture() {
    this.capturedElement = null
    // TODO: This should be a request, wbihch is fulfilled next time
    // a frame is dranw.
    this.renderGeomDataFbo()
  }
}

export { VRViewport }
