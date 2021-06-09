/* eslint-disable guard-for-in */
import { TreeItem, GeomItem, ParameterOwner } from '../SceneTree/index'
import { SystemDesc } from '../SystemDesc'
import { create3DContext } from './GLContext'
import { GLScreenQuad } from './GLScreenQuad'
import { GLViewport } from './GLViewport'
import { Registry } from '../Registry'
import { VRViewport } from './VR/VRViewport'
import { POINTER_TYPES } from '../Utilities/EnumUtils'
import { GLMaterialLibrary } from './Drawing/GLMaterialLibrary.js'
import { GLGeomLibrary } from './Drawing/GLGeomLibrary.js'
import { GLGeomItemLibrary } from './Drawing/GLGeomItemLibrary.js'

let activeGLRenderer = undefined
let pointerIsDown = false
let pointerLeft = false
const registeredPasses = {}

/**
 * Class representing a GL base renderer.
 *
 * @extends ParameterOwner
 */
class GLBaseRenderer extends ParameterOwner {
  /**
   * Create a GL base renderer.
   * @param {HTMLElement|HTMLCanvasElement} $canvas - The canvas element.
   * @param {object} options - The options value.
   */
  constructor($canvas, options = {}) {
    super()

    if (!SystemDesc.gpuDesc) {
      console.warn('Unable to create renderer')
      return
    }

    this.solidAngleLimit = 0.004

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

    this.__drawSuspensionLevel = 0
    this.__shaderDirectives = {}
    this.directives = {}

    this.__xrViewportPresenting = false

    // Function Bindings.
    this.renderGeomDataFbos = this.renderGeomDataFbos.bind(this)
    this.requestRedraw = this.requestRedraw.bind(this)

    this.setupWebGL($canvas, options.webglOptions ? { ...options, ...options.webglOptions } : options)
    this.bindEventHandlers()
    this.addViewport('main')

    this.glMaterialLibrary = new GLMaterialLibrary(this)
    this.glMaterialLibrary.on('updated', () => {
      this.requestRedraw()
    })
    this.glGeomLibrary = new GLGeomLibrary(this)
    this.glGeomLibrary.on('updated', () => {
      this.requestRedraw()
    })
    this.glGeomItemLibrary = new GLGeomItemLibrary(this)
    this.glGeomItemLibrary.on('updated', () => {
      this.requestRedraw()
    })

    // eslint-disable-next-line guard-for-in
    for (const passType in registeredPasses) {
      for (const cls of registeredPasses[passType]) {
        // eslint-disable-next-line new-cap
        this.addPass(new cls(), passType, false)
      }
    }

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
    this.directives = directives
    this.__gl.shaderopts = { directives } // used by zea-cad.
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
   * Adds tree items to the renderer, selecting the correct pass to delegate rendering too, and listens to future changes in the tree.
   *
   * @param {TreeItem} treeItem - The tree item to add.
   */
  addTreeItem(treeItem) {
    // Note: we can have BaseItems in the tree now.
    if (!(treeItem instanceof TreeItem)) return

    if (treeItem instanceof GeomItem) {
      const geomParam = treeItem.getParameter('Geometry')
      if (geomParam.getValue() == undefined) {
        // we will add this geomItem once it receives its geom.
        const geomAssigned = () => {
          this.assignTreeItemToGLPass(treeItem)
        }
        geomParam.once('valueChanged', geomAssigned)
      } else {
        this.assignTreeItemToGLPass(treeItem)
      }
    } else {
      this.assignTreeItemToGLPass(treeItem)
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
   * Searches through the passes and finds the appropriate pass to draw the given tree items.
   *
   * @param {TreeItem} treeItem - The tree item to assign.
   */
  assignTreeItemToGLPass(treeItem) {
    if (treeItem instanceof GeomItem) {
      const geomItem = treeItem
      this.glGeomItemLibrary.addGeomItem(geomItem)
    }

    let handled = false
    for (let i = this.__passesRegistrationOrder.length - 1; i >= 0; i--) {
      const pass = this.__passesRegistrationOrder[i]

      const rargs = {
        continueInSubTree: true,
      }
      handled = pass.itemAddedToScene(treeItem, rargs)
      if (handled) {
        if (!rargs.continueInSubTree) return
        break
      }
    }

    if (!handled) {
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
    }
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

    if (treeItem instanceof GeomItem) {
      const geomItem = treeItem
      this.glGeomItemLibrary.removeGeomItem(geomItem)
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
   * @return {WebGLRenderingContext} - The return value.
   */
  getGL() {
    return this.__gl
  }

  /**
   * Handle the canvas's parent resizing.
   *
   * @param {number} width - The new width of the canvas.
   * @param {number} height - The new height of the canvas.
   *
   * @private
   */
  handleResize(width, height) {
    if (this.__xrViewportPresenting) {
      return
    }
    // We cannot allow Our offscreen buffers to be resized to zero.
    // Limit the min size to 16.
    if (width < 16 || height < 16) {
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
    const DPR = 1.0 // window.devicePixelRatio

    const newWidth = width * DPR
    const newHeight = height * DPR

    if (newWidth != this.__glcanvas.width || newHeight != this.__glcanvas.height) {
      this.__glcanvas.width = newWidth
      this.__glcanvas.height = newHeight

      for (const vp of this.__viewports) {
        vp.resize(newWidth, newHeight)
      }

      this.emit('resized', {
        width: newWidth,
        height: newHeight,
      })
    }
    this.requestRedraw()
  }

  /**
   * Returns host div of the canvas element.
   *
   * @return {HTMLElement} - The return value.
   */
  getDiv() {
    return this.__glcanvas.parentElement
  }

  /**
   * Setups the WebGL configuration for the renderer, specifying the canvas element where our
   *
   * @param {HTMLCanvasElement|HTMLElement} $canvas - The $canvas element.
   * @param {object} webglOptions - The webglOptions value.
   */
  setupWebGL($canvas, webglOptions) {
    const { tagName } = $canvas

    if (!['DIV', 'CANVAS'].includes(tagName)) {
      throw new Error('Only CANVAS and DIV are valid root elements.')
    }

    const rootIsDiv = tagName === 'DIV'
    this.__glcanvas = $canvas

    if (rootIsDiv) {
      console.warn(
        '@GLBaseRenderer#setupWebGL.',
        'Using a DIV as root element is deprecated.',
        'Use a CANVAS instead.',
        'See: https://docs.zea.live/zea-engine/#/getting-started/get-started-with-engine?id=basic-setup'
      )

      this.__glcanvas = document.createElement('canvas')
      this.__glcanvas.style.left = '0px'
      this.__glcanvas.style.top = '0px'
      this.__glcanvas.style.width = '100%'
      this.__glcanvas.style.height = '100%'

      this.__div = $canvas
      this.__div.appendChild(this.__glcanvas)
    } else {
      this.__glcanvas = $canvas
    }

    this.__glcanvas.style['touch-action'] = 'none'
    const canvasIsStatic = window.getComputedStyle(this.__glcanvas).position === 'static'

    if (canvasIsStatic) {
      console.warn(
        '@GLBaseRenderer#setupWebGL.',
        "The CANVAS element's position must be other than `static`.",
        'See: https://docs.zea.live/zea-engine/#/getting-started/get-started-with-engine?id=basic-setup'
      )

      this.__glcanvas.style.position = webglOptions.canvasPosition ? webglOptions.canvasPosition : 'absolute'
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!entry.contentRect) {
          return
        }

        this.handleResize(entry.contentRect.width, entry.contentRect.height)
      }
    })

    this.handleResize(this.__glcanvas.parentElement.clientWidth, this.__glcanvas.parentElement.clientHeight)
    this.resizeObserver.observe(this.__glcanvas.parentElement)

    webglOptions.preserveDrawingBuffer = true
    // In webgl 2, we now render to a multi-sampled offscreen buffer, that we then resolve and blit to
    // the onscreen buffer. This means we no longer need the default render target to be antialiased.
    // In webgl 1 however we render surfaces to the offscreen buffer, and then lines to the default buffer.
    // The default buffer should then be antialiased.
    webglOptions.antialias =
      !SystemDesc.gpuDesc.supportsWebGL2 || webglOptions.webglContextType == 'webgl' ? true : false
    webglOptions.depth = true
    webglOptions.stencil = false
    webglOptions.alpha = webglOptions.alpha ? webglOptions.alpha : false
    // Note: Due to a change in Chrome (version 88-89), providing true here caused a pause when creating
    // an WebGL context, if the XR device was unplugged. We also call 'makeXRCompatible' when setting
    // up the XRViewport, so we to get an XR Compatible context anyway.
    webglOptions.xrCompatible = false

    // Most applications of our engine will prefer the high-performance context by default.
    webglOptions.powerPreference = webglOptions.powerPreference || 'high-performance'

    this.__gl = create3DContext(this.__glcanvas, webglOptions)
    if (!this.__gl) alert('Unable to create WebGL context. WebGL not supported.')
    this.__gl.renderer = this

    if (this.__gl.name == 'webgl2') {
      this.addShaderPreprocessorDirective('ENABLE_ES3')
    }
    if (this.__gl.floatTexturesSupported) {
      this.addShaderPreprocessorDirective('ENABLE_FLOAT_TEXTURES')
    }

    {
      const ext = this.__gl.getExtension('WEBGL_multi_draw')
      if (ext && !webglOptions.disableMultiDraw) {
        this.__gl.multiDrawArrays = ext.multiDrawArraysWEBGL.bind(ext)
        this.__gl.multiDrawElements = ext.multiDrawElementsWEBGL.bind(ext)
        this.__gl.multiDrawElementsInstanced = ext.multiDrawElementsInstancedWEBGL.bind(ext)
        this.__gl.multiDrawArraysInstanced = ext.multiDrawArraysInstancedWEBGL.bind(ext)
      } else {
        this.addShaderPreprocessorDirective('EMULATE_MULTI_DRAW')
      }
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
  }

  /**
   * Binds IO event handlers to the canvas
   */
  bindEventHandlers() {
    // ////////////////////////////////
    // Setup event handlers
    const isValidCanvas = () => this.getWidth() > 0 && this.getHeight()

    const prepareEvent = (event) => {
      event.propagating = true
      const sp = event.stopPropagation
      event.stopPropagation = () => {
        event.propagating = false
        if (sp) sp.call(event)
      }
    }
    const calcRendererCoords = (event) => {
      const rect = this.__glcanvas.getBoundingClientRect()
      // Disabling devicePixelRatio for now. See: __onResize
      const DPR = 1.0 // window.devicePixelRatio
      // Note: the rendererX/Y values are relative to the viewport,
      // but are available outside the viewport. So when a mouse
      // drag occurs, and drags outside the viewport, these values
      // provide consistent coords.
      // offsetX/Y are only valid inside the viewport and so cause
      // jumps when the mouse leaves the viewport.
      event.rendererX = (event.clientX - rect.left) * DPR
      event.rendererY = (event.clientY - rect.top) * DPR
    }

    /** Mouse Events Start */
    const isMobileSafariMouseEvent = (event) => {
      if (SystemDesc.isMobileDevice && SystemDesc.browserName == 'Safari') {
        console.warn('Mobile Safari is triggering mouse event:', event.type)
        return true
      }

      return false
    }

    this.__glcanvas.addEventListener('mousedown', (event) => {
      if (isMobileSafariMouseEvent(event)) {
        return
      }

      prepareEvent(event)
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
      if (isMobileSafariMouseEvent(event)) {
        return
      }

      if (activeGLRenderer != this || !isValidCanvas()) return

      prepareEvent(event)
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
        }

        activeGLRenderer = undefined
      }

      return false
    })

    document.addEventListener('mousemove', (event) => {
      if (isMobileSafariMouseEvent(event)) {
        return
      }

      if (activeGLRenderer != this || !isValidCanvas()) return

      prepareEvent(event)
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
      if (isMobileSafariMouseEvent(event)) {
        return
      }

      if (!pointerIsDown) {
        activeGLRenderer = this
        event.pointerType = POINTER_TYPES.mouse

        prepareEvent(event)
        calcRendererCoords(event)
        // TODO: Check mouse pos.
        activeGLRenderer.activateViewportAtPos(event.rendererX, event.rendererY)

        if (!pointerIsDown) {
          const viewport = activeGLRenderer.getActiveViewport()
          if (viewport) {
            event.pointerType = POINTER_TYPES.mouse
            viewport.onPointerEnter(event)
          }
        }

        pointerLeft = false
      }
    })

    this.__glcanvas.addEventListener('mouseleave', (event) => {
      if (isMobileSafariMouseEvent(event)) {
        return
      }

      if (activeGLRenderer != this || !isValidCanvas()) return

      prepareEvent(event)
      if (!pointerIsDown) {
        const viewport = activeGLRenderer.getActiveViewport()
        if (viewport) {
          event.pointerType = POINTER_TYPES.mouse
          viewport.onPointerLeave(event)
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

        // Touch events are passive and so cannot call prevent default
        // replace with a stub here...
        event.preventDefault = () => {}

        prepareEvent(event)
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerDown(event)
      },
      { passive: true }
    )

    this.__glcanvas.addEventListener(
      'touchend',
      (event) => {
        event.stopPropagation()

        // Touch events are passive and so cannot call prevent default
        // replace with a stub here...
        event.preventDefault = () => {}

        prepareEvent(event)
        for (let i = 0; i < event.changedTouches.length; i++) {
          calcRendererCoords(event.changedTouches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerUp(event)
      },
      { passive: true }
    )

    this.__glcanvas.addEventListener(
      'touchmove',
      (event) => {
        event.stopPropagation()

        // Touch events are passive and so cannot call prevent default
        // replace with a stub here...
        event.preventDefault = () => {}

        prepareEvent(event)
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i])
        }

        event.pointerType = POINTER_TYPES.touch
        this.getViewport().onPointerMove(event)
      },
      { passive: true }
    )
    /** Touch Events End */

    const onWheel = (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      if (activeGLRenderer) {
        prepareEvent(event)
        calcRendererCoords(event)
        const vp = activeGLRenderer.getActiveViewport()
        if (vp) {
          vp.onWheel(event)
        }
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

    document.addEventListener('keydown', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      prepareEvent(event)
      const vp = activeGLRenderer.getActiveViewport()
      if (vp) {
        vp.onKeyDown(event)
      }
    })

    document.addEventListener('keyup', (event) => {
      if (activeGLRenderer != this || !isValidCanvas()) return
      prepareEvent(event)
      const vp = activeGLRenderer.getActiveViewport()
      if (vp) {
        vp.onKeyUp(event)
      }
    })
  }

  /**
   * Returns canvas that was used to generate the gl context.
   *
   * @return {HTMLCanvasElement} - The return value.
   */
  getGLCanvas() {
    return this.__glcanvas
  }

  /**
   * Frames the specified viewport to the entire scene.
   * > See also: ${Viewport#frameView}
   * @param {number} viewportIndex - The viewportIndex value. If multiple viewports are configured, a viewport index will need to be provided.
   */
  frameAll(viewportIndex = 0) {
    this.__viewports[viewportIndex].frameView([this.__scene.getRoot()])
  }

  // ///////////////////////
  // Render Items Setup

  /**
   * A factory function used to construct new shader objects. If that specified shader has already been constructed, it returns the existing shader.
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
   * @param {GLPass} pass - The pass value.
   * @param {number} passType - The passType value.
   * @param {boolean} updateIndices - The updateIndices value.
   * @return {number} - The return value.
   */
  addPass(pass, passType = -1, updateIndices = true) {
    if (passType == -1) passType = pass.getPassType()
    if (!this.__passes[passType]) this.__passes[passType] = []

    let index = 0
    for (const key in this.__passes) {
      if (key == passType) break
      index += this.__passes[key].length
    }
    index += this.__passes[passType].length

    pass.on('updated', this.requestRedraw)
    pass.init(this, index)
    this.__passes[passType].push(pass)

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
   * The getPass method.
   * @param {number} index - The index value.
   * @return {GLPass} - The return value.
   */
  getPass(index) {
    let offset = 0
    for (const key in this.__passes) {
      const passSet = this.__passes[key]
      if (index - offset < passSet.length) return passSet[index - offset]
      offset += passSet.length
    }
  }

  // ///////////////////////
  // VR Setup

  /**
   * The supportsVR method.
   * @return {boolean} - The return value.
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
    if (
      this.__redrawRequested ||
      this.__continuousDrawing ||
      this.__xrViewportPresenting ||
      this.__drawSuspensionLevel > 0
    ) {
      return false
    }

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
   * Forces a redraw of the viewports
   */
  forceRender() {
    if (!this.__redrawRequested) {
      console.warn('@GlBaseRenderer#forceRender - Scene is not dirty')
      return
    }

    this.__redrawRequested = false
    for (const vp of this.__viewports) {
      vp.draw()
    }
  }

  /**
   * The bindGLBaseRenderer method.
   * @param {object} renderState - The renderState value.
   */
  bindGLBaseRenderer(renderState) {
    renderState.gl = this.__gl
    renderState.shaderopts = { directives: this.directives } // we will start deprecating this in favor os a simpler directives

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

    renderState.directives = [...this.directives, '#define DRAW_COLOR']
    renderState.shaderopts.directives = renderState.directives

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

    renderState.directives = [...this.directives, '#define DRAW_HIGHLIGHT']
    renderState.shaderopts.directives = renderState.directives

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

    renderState.directives = [...this.directives, '#define DRAW_GEOMDATA']
    renderState.shaderopts.directives = renderState.directives

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
   * @param {PassType} passType - The passType value.
   */
  static registerPass(cls, passType) {
    if (!registeredPasses[passType]) registeredPasses[passType] = []
    registeredPasses[passType].push(cls)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()

    this.resizeObserver.unobserve()
  }
}

export { GLBaseRenderer }
