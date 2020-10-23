/* eslint-disable guard-for-in */
import { TreeItem, ParameterOwner } from '../SceneTree/index'
import { SystemDesc } from '../SystemDesc'
import { onResize } from '../external/onResize'
import { create3DContext } from './GLContext'
import { GLScreenQuad } from './GLScreenQuad'
import { GLViewport } from './GLViewport'
import { Registry } from '../Registry'
import { VRViewport } from './VR/VRViewport'
import { POINTER_TYPES } from '../Utilities/EnumUtils'

let activeGLRenderer = undefined
let pointerIsDown = false
let pointerLeft = false
const registeredPasses = {}
const loggedErrors = {}

/**
 * Class representing a GL base renderer.
 *
 * @extends ParameterOwner
 */
class GLBaseRenderer extends ParameterOwner {
  /**
   * Create a GL base renderer.
   * @param {HTMLElement|HTMLCanvasElement} $canvas - The canvasDiv value.
   * @param {object} options - The options value.
   */
  constructor($canvas, options = {}) {
    super()

    if (!SystemDesc.gpuDesc) {
      console.warn('Unable to create renderer')
      return
    }

    this.__shaders = {}
    this.__passes = {}
    this.__passesRegistrationOrder = []
    this.__passCallbacks = []

    this.__childItemAdded = this.__childItemAdded.bind(this)
    this.__childItemRemoved = this.__childItemRemoved.bind(this)

    this.__viewports = []
    this.__activeViewport = undefined
    this.__continuousDrawing = false
    this.__redrawRequested = false
    this.__isMobile = SystemDesc.isMobileDevice

    this.__drawSuspensionLevel = 1
    this.__shaderDirectives = {}
    this.__preproc = {}

    this.__xrViewportPresenting = false

    // Function Bindings.
    this.renderGeomDataFbos = this.renderGeomDataFbos.bind(this)
    this.requestRedraw = this.requestRedraw.bind(this)

    this.setupWebGL($canvas, options.webglOptions ? options.webglOptions : {})
    this.bindEventHandlers()

    // eslint-disable-next-line guard-for-in
    for (const passType in registeredPasses) {
      for (const cls of registeredPasses[passType]) {
        // eslint-disable-next-line new-cap
        this.addPass(new cls(), passType, false)
      }
    }

    this.addViewport('main')

    // ////////////////////////////////////////////
    // WebXR
    this.__supportXR = options.supportXR !== undefined ? options.supportXR : true
    this.__xrViewport = undefined
    this.__xrViewportPromise = new Promise((resolve, reject) => {
      if (this.__supportXR) {
        // if(!navigator.xr && window.WebVRPolyfill != undefined) {
        //     this.__vrpolyfill = new WebVRPolyfill();
        // }
        if (navigator.xr) {
          const setupXRViewport = () => {
            // Note: could cause a context loss on machines with
            // multi-gpus (integrated Intel).
            // This is because the may force the context to switch
            // to the discrete GPU.
            // TODO: Provide a system to re-load the GPU data.
            // this.__gl.setCompatibleXRDevice(device);
            this.__gl.makeXRCompatible().then(() => {
              this.__xrViewport = this.__setupXRViewport()
              this.emit('xrViewportSetup', {
                xrViewport: this.__xrViewport,
              })
              resolve(this.__xrViewport)
            })
          }
          if (navigator.xr.supportsSessionMode) {
            // Old
            navigator.xr
              .supportsSessionMode('immersive-vr')
              .then(setupXRViewport)
              .catch((reason) => {
                console.warn('Unable to setup XR:' + reason)
              })
          } else {
            // New
            navigator.xr
              .isSessionSupported('immersive-vr')
              .then((isSupported) => {
                if (isSupported) {
                  setupXRViewport()
                }
              })
              .catch((reason) => {
                console.warn('Unable to setup XR:' + reason)
              })
          }

          // TODO:
          // navigator.xr.on('devicechange', checkForXRSupport);
        }
      }
    })
  }

  /**
   * The addShaderPreprocessorDirective method.
   * @param {string} name - The name value.
   * @param {string} value - The value param.
   */
  addShaderPreprocessorDirective(name, value) {
    if (value) this.__shaderDirectives[name] = '#define ' + name + ' = ' + value
    else this.__shaderDirectives[name] = '#define ' + name
    const directives = []
    // eslint-disable-next-line guard-for-in
    for (const key in this.__shaderDirectives) {
      directives.push(this.__shaderDirectives[key])
    }
    this.__preproc.defines = directives.join('\n') + '\n'
    this.__gl.shaderopts = this.__preproc
  }

  /**
   * The getShaderPreproc method.
   * @return {object} - The return value.
   */
  getShaderPreproc() {
    return this.__preproc
  }

  /**
   * Returns HTMLCanvasElement's width
   *
   * @return {number} - The return value.
   */
  getWidth() {
    return this.__glcanvas.width
  }

  /**
   * Returns HTMLCanvasElement's Height
   * @return {number} - The return value.
   */
  getHeight() {
    return this.__glcanvas.height
  }

  // //////////////////////////////////////
  // Viewports

  /**
   * Adds a new viewport(viewing region) to the scene.
   *
   * @param {string} name - The name of the viewport.
   * @return {GLViewport} - The return value.
   */
  addViewport(name) {
    const vp = new GLViewport(this, name, this.getWidth(), this.getHeight())

    vp.createGeomDataFbo(this.__floatGeomBuffer)

    const updated = () => {
      this.requestRedraw()
    }
    const viewChanged = (data) => {
      if (!this.__xrViewportPresenting) {
        this.emit('viewChanged', data)
      }
    }
    vp.on('updated', updated)
    vp.on('viewChanged', viewChanged)

    this.__viewports.push(vp)
    return vp
  }

  /**
   * Returns a viewport element by specifying its index in the list of viewports.
   *
   * @param {number} index - The index value.
   * @return {GLViewport} - The return value.
   */
  getViewport(index = 0) {
    return this.__viewports[index]
  }

  /**
   * Returns a viewport element under the specified XY coordinates.
   *
   * @param {number} offsetX - The viewport offset in the X axis.
   * @param {number} offsetY - The viewport offset in the Y axis.
   * @return {GLViewport} - The return value.
   */
  getViewportAtPos(offsetX, offsetY) {
    for (const vp of this.__viewports) {
      const x = vp.getPosX()
      const y = vp.getPosY()
      const width = vp.getWidth()
      const height = vp.getHeight()
      if (offsetX >= x && offsetY >= y && offsetX <= width + x && offsetY <= height + y) return vp
    }
    return undefined
  }

  /**
   * Sets as `active` the specified viewport.
   *
   * @param {GLViewport} vp - The viewport.
   */
  activateViewport(vp) {
    if (this.__activeViewport == vp) return

    this.__activeViewport = vp
  }

  /**
   * Sets as àctive` the viewport under the specified XY coordinates.
   *
   * @param {number} offsetX - The viewport offset in the X axis.
   * @param {number} offsetY - The viewport offset in the Y axis.
   */
  activateViewportAtPos(offsetX, offsetY) {
    if (this.__xrViewportPresenting) return
    const vp = this.getViewportAtPos(offsetX, offsetY)
    if (vp && vp != this.__activeViewport) this.activateViewport(vp)
  }

  /**
   * Returns current active viewport.
   *
   * @return {GLViewport} - The return value.
   */
  getActiveViewport() {
    if (this.__xrViewportPresenting) return this.__xrViewport
    return this.__activeViewport
  }

  /**
   * The suspendDrawing method.
   */
  suspendDrawing() {
    this.__drawSuspensionLevel++
  }

  /**
   * The resumeDrawing method.
   */
  resumeDrawing() {
    this.__drawSuspensionLevel--
    if (this.__drawSuspensionLevel == 0) {
      if (this.__loadingImg) this.__$canvas.removeChild(this.__loadingImg)

      this.renderGeomDataFbos()
      this.requestRedraw()
    }
  }

  /**
   * The renderGeomDataFbos method. Frame buffer (FBO).
   */
  renderGeomDataFbos() {
    if (this.__renderGeomDataFbosRequested == true) return

    this.__renderGeomDataFbosRequested = true
    const onAnimationFrame = () => {
      for (const vp of this.__viewports) vp.renderGeomDataFbo()
      this.__renderGeomDataFbosRequested = false
    }
    window.requestAnimationFrame(onAnimationFrame)
  }

  // //////////////////////////////////////
  // Scene

  /**
   * Sets up and displays the scene grid of a given size and resolution.
   *
   * @param {number} gridSize - The size of the grid.
   * @param {Color} gridColor - The color of the grid.
   * @param {number} resolution - The resolution of the grid.
   * @param {number} lineThickness - The thickness of the grid lines.
   * @return {GridTreeItem} - The return value.
   * @deprecated
   */
  setupGrid(gridSize, gridColor, resolution, lineThickness) {
    console.warn('@GLBaseRenderer#setupGrid - Deprecated Method. Please use scene.setupGrid')
    return this.__scene.setupGrid(gridSize, resolution, gridColor)
  }

  /**
   * Returns current scene(Environment where all assets live) object.
   *
   * @return {Scene} - The return value.
   */
  getScene() {
    return this.__scene
  }

  /**
   * Sets scene to the renderer.
   *
   * @param {Scene} scene - The scene value.
   */
  setScene(scene) {
    this.__scene = scene
    this.addTreeItem(this.__scene.getRoot())

    if (this.__gizmoContext) this.__gizmoContext.setSelectionManager(scene.getSelectionManager())

    this.emit('sceneSet', { scene: this.__scene })
  }

  /**
   * @param {*} event -
   * @private
   */
  __childItemAdded(event) {
    this.addTreeItem(event.childItem)
  }

  /**
   * @param {*} event -
   * @private
   */
  __childItemRemoved(event) {
    this.removeTreeItem(event.childItem)
  }

  /**
   * Adds tree items to the scene.
   *
   * @param {TreeItem} treeItem - The tree item to add.
   */
  addTreeItem(treeItem) {
    // Note: we can have BaseItems in the tree now.
    if (!(treeItem instanceof TreeItem)) return

    for (let i = this.__passesRegistrationOrder.length - 1; i >= 0; i--) {
      const pass = this.__passesRegistrationOrder[i]
      try {
        const rargs = {
          continueInSubTree: true,
        }
        const handled = pass.itemAddedToScene(treeItem, rargs)
        if (handled) {
          if (!rargs.continueInSubTree) return
          break
        }
      } catch (error) {
        if (!loggedErrors[pass.constructor.name]) {
          loggedErrors[pass.constructor.name] = error.message
          console.warn(error.message)
        }
      }
    }

    for (const passCbs of this.__passCallbacks) {
      const rargs = {
        continueInSubTree: true,
      }
      const handled = passCbs.itemAddedFn(treeItem, rargs)
      if (handled) {
        if (!rargs.continueInSubTree) return
        break
      }
    }

    // Traverse the tree adding items until we hit the leaves (which are usually GeomItems.)
    for (const childItem of treeItem.getChildren()) {
      if (childItem) this.addTreeItem(childItem)
    }

    treeItem.on('childAdded', this.__childItemAdded)
    treeItem.on('childRemoved', this.__childItemRemoved)

    this.renderGeomDataFbos()
  }

  /**
   * Remove tree items from the scene.
   *
   * @param {TreeItem} treeItem - The tree item to remove.
   */
  removeTreeItem(treeItem) {
    // Note: we can have BaseItems in the tree now.
    if (!(treeItem instanceof TreeItem)) return

    treeItem.off('childAdded', this.__childItemAdded)
    treeItem.off('childRemoved', this.__childItemRemoved)

    for (let i = this.__passesRegistrationOrder.length - 1; i >= 0; i--) {
      const pass = this.__passesRegistrationOrder[i]
      const rargs = {
        continueInSubTree: true,
      }
      const handled = pass.itemRemovedFromScene(treeItem, rargs)
      if (handled) {
        if (!rargs.continueInSubTree) return
        break
      }
    }

    for (const passCbs of this.__passCallbacks) {
      if (!passCbs.itemRemovedFn) continue
      const rargs = {
        continueInSubTree: true,
      }
      const handled = passCbs.itemRemovedFn(treeItem, rargs)
      if (handled) {
        if (!rargs.continueInSubTree) return
        break
      }
    }

    // Traverse the tree adding items till we hit the leaves (which are usually GeomItems).
    for (const childItem of treeItem.getChildren()) {
      if (childItem) this.removeTreeItem(childItem)
    }
    this.renderGeomDataFbos()
  }

  // ///////////////////////
  // Renderer Setup

  /**
   * Getter for gl.
   */
  get gl() {
    return this.__gl
  }

  /**
   * The getGL method.
   * @return {any} - The return value.
   */
  getGL() {
    return this.__gl
  }

  /**
   * The resizeFbos method. Frame buffer (FBO).
   *
   * @param {number} width - The width of the frame buffer.
   * @param {number} height - The height of the frame buffer.
   */
  resizeFbos(width, height) {}

  /**
   * The __onResize method.
   * @private
   */
  __onResize() {
    if (!this.__xrViewportPresenting) {
      // Oftern the canvas has zero size as the web components are still loading.
      // So we must force the resize untill we get a proper size.
      if (this.__glcanvas.clientWidth == 0 || this.__glcanvas.clientHeight == 0) {
        setTimeout(this.__onResize.bind(this), 10)
        return
      }
      // Note: devicePixelRatio has already been factored into the clientWidth and clientHeight,
      // meaning we do not need to multiply client values by devicePixelRatio to get real values.
      // On some devices, this duplicate multiplication (when the meta tag was not present), caused
      // very large offscreen buffers to be created, which crashed devices.
      // (PT 15/10/2019 - Zahner project)
      // In some cases I have seen this is disabled using a viewport meta tag in the DOM, which then
      // requires that we multiply by devicePixelRatio to get the screen pixels size.
      // By removing that tag, it seems like manual zooming now on desktop systems does _NOT_
      // effect the clientWidth/clientHeight which causes blurry rendering(when zoomed).
      // This is a minor issue IMO, and so am disabling devicePixelRatio until its value is clear.
      // _Remove the meta name="viewport" from the HTML_
      const dpr = 1.0 // window.devicePixelRatio
      const newWidth = this.__glcanvas.clientWidth * dpr
      const newHeight = this.__glcanvas.clientHeight * dpr
      if (newWidth != this.__glcanvas.width || newHeight != this.__glcanvas.height) {
        this.__glcanvas.width = newWidth
        this.__glcanvas.height = newHeight

        for (const vp of this.__viewports) vp.resize(this.__glcanvas.width, this.__glcanvas.height)

        this.resizeFbos(this.__glcanvas.width, this.__glcanvas.height)

        this.emit('resized', {
          width: this.__glcanvas.width,
          height: this.__glcanvas.height,
        })
        this.requestRedraw()
      }
    }
  }

  /**
   * Returns host div of the canvas element.
   *
   * @return {HTMLElement} - The return value.
   */
  getDiv() {
    const { tagName } = this.__$canvas
    if (tagName == 'DIV') return this.__$canvas

    return this.__$canvas.parentElement
  }

  /**
   * Setups the WebGL configuration for the renderer, specifying the canvas element where our
   *
   * @param {HTMLCanvasElement|HTMLElement} $canvas - The $canvas value.
   * @param {object} webglOptions - The webglOptions value.
   */
  setupWebGL($canvas, webglOptions) {
    const { tagName } = $canvas

    if (!['DIV', 'CANVAS'].includes(tagName)) {
      throw new Error('Only `canvas` and `div` are valid root elements.')
    }

    const rootIsDiv = tagName === 'DIV'

    if (rootIsDiv) {
      console.warn(
        '@GLBaseRenderer#setupWebGL. Using a `div` as root element is deprecated. Use a `canvas` instead. See: https://zea.live/zea-engine/#/getting-started/get-started-with-engine?id=basic-setup'
      )

      this.__glcanvas = document.createElement('canvas')
      this.__glcanvas.style.position = webglOptions.canvasPosition ? webglOptions.canvasPosition : 'absolute'
      this.__glcanvas.style.left = '0px'
      this.__glcanvas.style.top = '0px'
      this.__glcanvas.style.width = '100%'
      this.__glcanvas.style.height = '100%'

      this.__$canvas = $canvas
      this.__$canvas.appendChild(this.__glcanvas)
    } else {
      this.__glcanvas = $canvas
    }

    onResize(this.__glcanvas, () => {
      this.__onResize()
    })

    this.__onResize()

    window.addEventListener('orientationchange', (event) => {
      this.__onResize()
    })

    webglOptions.preserveDrawingBuffer = true
    webglOptions.stencil = webglOptions.stencil ? webglOptions.stencil : false
    webglOptions.alpha = webglOptions.alpha ? webglOptions.alpha : false
    webglOptions.xrCompatible = true
    this.__gl = create3DContext(this.__glcanvas, webglOptions)
    if (!this.__gl) alert('Unable to create WebGL context. WebGL not supported.')
    this.__gl.renderer = this

    if (this.__gl.name == 'webgl2') {
      this.addShaderPreprocessorDirective('ENABLE_ES3')
    }
    if (this.__gl.floatTexturesSupported) {
      this.addShaderPreprocessorDirective('ENABLE_FLOAT_TEXTURES')
    }

    this.__gl.screenQuad = new GLScreenQuad(this.__gl)
    this.__screenQuad = this.__gl.screenQuad

    // Note: Mobile devices don't provide much support for reading data back from float textures,
    // and checking compatibility is patchy at best.
    // Note: We are now pushing on high-end mobile devices.
    // Galaxy and above. We need this. We need to accurately determine
    // if the float buffer is not supported.
    this.__floatGeomBuffer = this.__gl.floatTexturesSupported && SystemDesc.browserName != 'Safari'
    this.__gl.floatGeomBuffer = this.__floatGeomBuffer
    // Note: the following returns UNSIGNED_BYTE even if the browser supports float.
    // const implType = this.__gl.getParameter(this.__gl.IMPLEMENTATION_COLOR_READ_TYPE);
    // this.__floatGeomBuffer = (implType == this.__gl.FLOAT);

    // //////////////////////////////////
    // Bind a default texture.
    // Note: If shaders have sampler2D uniforms, but we don't bind textures, then
    // they get assigned texture0. If we have no textures bound at all, then
    // we get warnings saying.
    // There is no texture bound to the unit 0
    // Bind a default texture to unit 0 simply to avoid these warnings.
    // this.__texture0 = new GLTexture2D(this.__gl, {
    //     format: 'RGB',
    //     type: 'UNSIGNED_BYTE',
    //     width: 1,
    //     height: 1,
    //     filter: 'NEAREST',
    //     mipMapped: false,
    //     wrap: 'CLAMP_TO_EDGE',
    //     data: new Uint8Array(3)
    // });

    // // gl.activeTexture(this.__gl.TEXTURE0);
    // this.__gl.bindTexture(this.__gl.TEXTURE_2D, this.__texture0.getTexHdl());
  }

  /**
   * Binds IO event handlers to the canvas
   */
  bindEventHandlers() {
    // ////////////////////////////////
    // Setup event handlers
    const isValidCanvas = () => {
      return this.__glcanvas.width > 0 && this.__glcanvas.height
    }

    const calcRendererCoords = (event) => {
      const rect = this.__glcanvas.getBoundingClientRect()
      // Disabling devicePixelRatio for now. See: __onResize
      const dpr = 1.0 // window.devicePixelRatio
      // Note: the rendererX/Y values are relative to the viewport,
      // but are available outside the viewport. So when a mouse
      // drag occurs, and drags outside the viewport, these values
      // provide consistent coords.
      // offsetX/Y are only valid inside the viewport and so cause
      // jumps when the mouse leaves the viewport.
      event.rendererX = (event.clientX - rect.left) * dpr
      event.rendererY = (event.clientY - rect.top) * dpr
    }

    /** Mouse Events Start */
    this.__glcanvas.addEventListener('mousedown', (event) => {
      calcRendererCoords(event)
      pointerIsDown = true
      activeGLRenderer = this
      activeGLRenderer.activateViewportAtPos(event.rendererX, event.rendererY)
      const viewport = activeGLRenderer.getActiveViewport()
      if (viewport) {
        event.pointerType = POINTER_TYPES.mouse
        viewport.onPointerDown(event)
      }

      pointerLeft = false
      return false
    })

    document.addEventListener('mouseup', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return

      calcRendererCoords(event)
      pointerIsDown = false
      const viewport = activeGLRenderer.getActiveViewport()
      if (viewport) {
        event.pointerType = POINTER_TYPES.mouse
        viewport.onPointerUp(event)
      }

      if (pointerLeft) {
        if (viewport) {
          event.pointerType = POINTER_TYPES.mouse
          viewport.onPointerLeave(event)
          event.preventDefault()
        }

        activeGLRenderer = undefined
      }

      return false
    })

    document.addEventListener('mousemove', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return

      calcRendererCoords(event)
      if (!pointerIsDown) activeGLRenderer.activateViewportAtPos(event.rendererX, event.rendererY)

      const viewport = activeGLRenderer.getActiveViewport()
      if (viewport) {
        event.pointerType = POINTER_TYPES.mouse
        viewport.onPointerMove(event)
      }
      return false
    })

    this.__glcanvas.addEventListener('mouseenter', (event) => {
      if (!pointerIsDown) {
        activeGLRenderer = this
        event.pointerType = POINTER_TYPES.mouse

        calcRendererCoords(event)
        // TODO: Check mouse pos.
        activeGLRenderer.activateViewportAtPos(event.rendererX, event.rendererY)
        pointerLeft = false
      }
    })

    this.__glcanvas.addEventListener('mouseleave', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return

      if (!pointerIsDown) {
        const viewport = activeGLRenderer.getActiveViewport()
        if (viewport) {
          event.pointerType = POINTER_TYPES.mouse
          viewport.onPointerLeave(event)
          event.preventDefault()
        }
        activeGLRenderer = undefined
      } else {
        pointerLeft = true
      }
    })
    /** Mouse Events End */

    /** Touch Events Start */
    this.__glcanvas.addEventListener(
      'touchstart',
      (event) => {
        event.stopPropagation()
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerDown(event)
        // This prevents the event propagation to `mousedown`
        event.preventDefault()
      },
      false
    )

    this.__glcanvas.addEventListener(
      'touchend',
      (event) => {
        event.stopPropagation()
        for (let i = 0; i < event.changedTouches.length; i++) {
          calcRendererCoords(event.changedTouches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerUp(event)
      },
      false
    )

    this.__glcanvas.addEventListener(
      'touchmove',
      (event) => {
        event.stopPropagation()
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerMove(event)
      },
      false
    )
    /** Touch Events End */

    const onWheel = (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      if (activeGLRenderer) {
        event.undoRedoManager = this.undoRedoManager
        this.onWheel(event)
      }
      return false
    }
    if (window.addEventListener)
      /** DOMMouseScroll is for mozilla. */
      window.addEventListener('wheel', onWheel, { passive: false })
    else {
      /** IE/Opera. */
      window.onmousewheel = document.onmousewheel = onWheel
    }

    window.oncontextmenu = function () {
      return false
    }

    document.addEventListener('keypress', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      const vp = activeGLRenderer.getActiveViewport()
      if (vp) {
        vp.onKeyPressed(event)
      }
    })

    document.addEventListener('keydown', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      const vp = activeGLRenderer.getActiveViewport()
      if (vp) {
        vp.onKeyDown(event)
      }
    })

    document.addEventListener('keyup', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      const vp = activeGLRenderer.getActiveViewport()
      if (vp) {
        vp.onKeyUp(event)
      }
    })
  }

  /**
   * Returns canvas element where our scene lives.
   *
   * @return {HTMLCanvasElement} - The return value.
   */
  getGLCanvas() {
    return this.__glcanvas
  }

  /**
   * The getScreenQuad method.
   *
   * @return {GLScreenQuad} - The return value.
   */
  getScreenQuad() {
    return this.__screenQuad
  }

  /**
   * Causes an event to occur when the mouse wheel is rolled up or down over an element.
   *
   * @param {WheelEvent} event - The event that occurs.
   */
  onWheel(event) {
    this.__viewports[0].onWheel(event)
  }

  /**
   * The frameAll method.
   * @param {number} viewportIndex - The viewportIndex value.
   */
  frameAll(viewportIndex = 0) {
    this.__viewports[viewportIndex].frameView([this.__scene.getRoot()])
  }

  // ///////////////////////
  // Render Items Setup

  /**
   * The getOrCreateShader method.
   * @param {string} shaderName - The shader name.
   * @return {GLShader} - The return value.
   */
  getOrCreateShader(shaderName) {
    let glShader = this.__shaders[shaderName]
    if (!glShader) {
      glShader = Registry.constructClass(shaderName, this.__gl)
      if (!glShader)
        console.error('@GLBaseRenderer#getOrCreateShader - Shader not registered with the Registry:', shaderName)
      this.__shaders[shaderName] = glShader
    }

    return glShader
  }

  /**
   * The addPass method.
   * @param {any} pass - The pass value.
   * @param {number} passtype - The passtype value.
   * @param {boolean} updateIndices - The updateIndices value.
   * @return {number} - The return value.
   */
  addPass(pass, passtype = 0, updateIndices = true) {
    if (!this.__passes[passtype]) this.__passes[passtype] = []

    let index = 0
    for (const key in this.__passes) {
      if (key == passtype) break
      index += this.__passes[key].length
    }
    index += this.__passes[passtype].length

    pass.on('updated', this.requestRedraw)
    pass.init(this, index)
    this.__passes[passtype].push(pass)

    if (updateIndices) {
      // Now update all the  subsequent pass indices because the
      // indices after will have changed.
      let offset = 0
      for (const key in this.__passes) {
        const passSet = this.__passes[key]
        passSet.forEach((pass, index) => {
          pass.setPassIndex(offset + index)
        })
        offset += passSet.length
      }
    }
    this.__passesRegistrationOrder.push(pass)
    this.requestRedraw()
    return index
  }

  /**
   * The registerPass method.
   * @param {function} itemAddedFn - The itemAddedFn value.
   * @param {function} itemRemovedFn - The itemRemovedFn value.
   */
  registerPass(itemAddedFn, itemRemovedFn) {
    console.warn('Deprecated, GLPass must now implement #itemAddedToScene and #itemRemovedFromScene instead')
    // insert at the beginning so it is called first.
    this.__passCallbacks.splice(0, 0, {
      itemAddedFn,
      itemRemovedFn,
    })
  }

  /**
   * The getPass method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getPass(index) {
    let offset = 0
    for (const key in this.__passes) {
      const passSet = this.__passes[key]
      if (index - offset < passSet.length) return passSet[index - offset]
      offset += passSet.length
    }
  }

  /**
   * The findPass method.
   * @param {any} constructor - The constructor value.
   * @return {any} - The return value.
   */
  findPass(constructor) {
    for (const key in this.__passes) {
      const passSet = this.__passes[key]
      for (const pass of passSet) {
        if (pass.constructor == constructor) return pass
      }
    }
  }

  /**
   * The getGizmoPass method.
   * @return {any} - The return value.
   */
  getGizmoPass() {
    return this.__gizmoPass
  }

  // ///////////////////////
  // VR Setup

  /**
   * The supportsVR method.
   * @return {any} - The return value.
   */
  supportsVR() {
    console.warn('@GLBaseRenderer#supportVR - Deprecated Method. Please instead connect to the vrViewportSetup signal.')
    return this.__supportXR && navigator.xr != null
  }

  /**
   * The __setupXRViewport method.
   * @return {VRViewport} - The return value.
   * @private
   */
  __setupXRViewport() {
    // Always get the last display. Additional displays are added at the end.(e.g. [Polyfill, HMD])
    const xrvp = new VRViewport(this)

    const emitViewChanged = (event) => {
      this.emit('viewChanged', event)
    }

    xrvp.on('presentingChanged', (event) => {
      const state = event.state
      this.__xrViewportPresenting = state
      if (state) {
        // Let the passes know that VR is starting.
        // They can do things like optimize shaders.
        for (const key in this.__passes) {
          const passSet = this.__passes[key]
          for (const pass of passSet) {
            pass.startPresenting()
          }
        }

        xrvp.on('viewChanged', emitViewChanged)
      } else {
        xrvp.off('viewChanged', emitViewChanged)
        this.emit('updated', {})

        for (const key in this.__passes) {
          const passSet = this.__passes[key]
          for (const pass of passSet) {
            pass.stopPresenting()
          }
        }
        const event = {
          interfaceType: 'CameraAndPointer',
          viewXfo: this.getViewport().getCamera().getParameter('GlobalXfo').getValue(),
        }
        this.emit('viewChanged', event)

        this.resizeFbos(this.__glcanvas.width, this.__glcanvas.height)
        this.requestRedraw()
      }
    })
    return xrvp
  }

  /**
   * The getVRViewport method.
   * @return {VRViewport} - The return value.
   */
  getVRViewport() {
    return this.__xrViewport
  }

  /**
   * The getXRViewport method.
   * @return {Promise} - The return value.
   */
  getXRViewport() {
    return this.__xrViewportPromise
  }

  /**
   * The isXRViewportPresenting method.
   * @return {boolean} - The return value.
   */
  isXRViewportPresenting() {
    return this.__xrViewportPresenting
  }

  // //////////////////////////
  // Rendering

  /**
   * The isContinuouslyDrawing method.
   * @return {boolean} - The return value.
   */
  isContinuouslyDrawing() {
    return this.__continuousDrawing
  }

  /**
   * The startContinuousDrawing method.
   */
  startContinuousDrawing() {
    if (this.isContinuouslyDrawing() || this.__xrViewportPresenting) return

    const onAnimationFrame = () => {
      if (this.__continuousDrawing && !this.__xrViewportPresenting) window.requestAnimationFrame(onAnimationFrame)
      for (const vp of this.__viewports) vp.draw()
    }

    this.__continuousDrawing = true
    window.requestAnimationFrame(onAnimationFrame)
  }

  /**
   * The stopContinuousDrawing method.
   */
  stopContinuousDrawing() {
    this.__continuousDrawing = false
  }

  /**
   * The toggleContinuousDrawing method.
   */
  toggleContinuousDrawing() {
    if (!this.__continuousDrawing) {
      this.startContinuousDrawing()
    } else {
      this.stopContinuousDrawing()
    }
  }

  /**
   * The drawItemChanged method.
   */
  drawItemChanged() {
    for (const vp of this.__viewports) vp.invalidateGeomDataBuffer()
    this.requestRedraw()
  }

  /**
   * Request a single redraw, usually in response to a signal/event.
   * @return {boolean} - The return value.
   */
  requestRedraw() {
    // If a redraw has already been requested, then simply return and wait.
    if (this.__redrawRequested || this.__continuousDrawing || this.__xrViewportPresenting) return false

    const onAnimationFrame = () => {
      this.__redrawRequested = false
      for (const vp of this.__viewports) {
        vp.draw()
      }
    }
    window.requestAnimationFrame(onAnimationFrame)
    this.__redrawRequested = true
    return true
  }

  /**
   * The bindGLBaseRenderer method.
   * @param {object} renderState - The renderState value.
   */
  bindGLBaseRenderer(renderState) {
    renderState.shaderopts = this.__preproc

    const gl = this.__gl
    if (!renderState.viewports || renderState.viewports.length == 1) {
      renderState.bindRendererUnifs = (unifs) => {
        const { cameraMatrix, viewMatrix, projectionMatrix, eye } = unifs
        if (cameraMatrix) {
          gl.uniformMatrix4fv(cameraMatrix.location, false, renderState.cameraMatrix.asArray())
        }

        const vp = renderState.viewports[0]
        if (viewMatrix) {
          gl.uniformMatrix4fv(viewMatrix.location, false, vp.viewMatrix.asArray())
        }

        if (projectionMatrix) {
          gl.uniformMatrix4fv(projectionMatrix.location, false, vp.projectionMatrix.asArray())
        }

        if (eye) {
          // Left or right eye, when rendering sterio VR.
          gl.uniform1i(eye.location, index)
        }
      }
      renderState.bindViewports = (unifs, cb) => cb()
    } else {
      renderState.bindRendererUnifs = (unifs) => {
        // Note: the camera matrix should be the head position instead
        // of the eye position. The inverse(viewMatrix) can be used
        // when we want the eye pos.
        const { cameraMatrix } = unifs
        if (cameraMatrix) {
          gl.uniformMatrix4fv(cameraMatrix.location, false, renderState.cameraMatrix.asArray())
        }
      }

      renderState.bindViewports = (unifs, cb) => {
        renderState.viewports.forEach((vp, index) => {
          gl.viewport(...vp.region)

          const { viewMatrix, projectionMatrix, eye } = unifs
          if (viewMatrix) {
            gl.uniformMatrix4fv(viewMatrix.location, false, vp.viewMatrix.asArray())
          }

          if (projectionMatrix) {
            gl.uniformMatrix4fv(projectionMatrix.location, false, vp.projectionMatrix.asArray())
          }

          if (eye) {
            // Left or right eye, when rendering sterio VR.
            gl.uniform1i(eye.location, index)
          }
          cb()
        })
      }
    }
  }

  /**
   * The drawScene method.
   * @param {object} renderState - The renderState value.
   */
  drawScene(renderState) {
    // Bind already called by GLRenderer.
    for (const key in this.__passes) {
      const passSet = this.__passes[key]
      for (const pass of passSet) {
        if (pass.enabled) pass.draw(renderState)
      }
    }
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {object} renderState - The renderState value.
   */
  drawHighlightedGeoms(renderState) {
    this.bindGLBaseRenderer(renderState)
    for (const key in this.__passes) {
      const passSet = this.__passes[key]
      for (const pass of passSet) {
        if (pass.enabled) pass.drawHighlightedGeoms(renderState)
      }
    }
  }

  /**
   * The drawSceneGeomData method.
   * @param {object} renderState - The renderState value.
   * @param {number} [mask=255] - The mask value
   */
  drawSceneGeomData(renderState, mask = 255) {
    this.bindGLBaseRenderer(renderState)
    for (const key in this.__passes) {
      // Skip pass categories that do not match
      // the mask. E.g. we may not want to hit
      // "Overlay" geoms such as labels,
      // or we might be trying to move labels and don't
      // want to grab normal geoms.
      if ((Number.parseInt(key) & mask) == 0) continue
      const passSet = this.__passes[key]
      for (const pass of passSet) {
        if (pass.enabled) pass.drawGeomData(renderState)
      }
    }
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * The registerPass method.
   * @param {function} cls - The cls value.
   * @param {PassType} passType - The passtype value.
   */
  static registerPass(cls, passType) {
    if (!registeredPasses[passType]) registeredPasses[passType] = []
    registeredPasses[passType].push(cls)
  }
}

export { GLBaseRenderer }
