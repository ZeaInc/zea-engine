import { Signal } from '../Utilities';
import { TreeItem, sgFactory } from '../SceneTree';
import { SystemDesc } from '../BrowserDetection.js';
import { onResize } from '../external/onResize.js';
import { create3DContext } from './GLContext.js';
import { GLScreenQuad } from './GLScreenQuad.js';
import { GLViewport } from './GLViewport.js';
// import {
//     GLTexture2D
// } from './GLTexture2D.js';
import { VRViewport } from './VR/VRViewport.js';

let activeGLRenderer = undefined;
let mouseIsDown = false;
let mouseLeft = false;

const registeredPasses = {};

/** Class representing a GL base renderer. */
class GLBaseRenderer {
  /**
   * Create a GL base renderer.
   * @param {any} canvasDiv - The canvasDiv value.
   * @param {any} options - The options value.
   */
  constructor(canvasDiv, options = {}) {
    if (!SystemDesc.gpuDesc) {
      console.warn('Unable to create renderer');
      return;
    }

    this.__shaders = {};
    this.__passes = {};
    this.__passCallbacks = [];

    this.addTreeItem = this.addTreeItem.bind(this);
    this.removeTreeItem = this.removeTreeItem.bind(this);

    this.__viewports = [];
    this.__activeViewport = undefined;
    this.__continuousDrawing = false;
    this.__redrawRequested = false;
    this.__isMobile = SystemDesc.isMobileDevice;

    this.__drawSuspensionLevel = 1;
    this.__shaderDirectives = {};
    this.__preproc = {};

    this.__xrViewportPresenting = false;

    // Function Bindings.
    this.renderGeomDataFbos = this.renderGeomDataFbos.bind(this);
    this.requestRedraw = this.requestRedraw.bind(this);

    this.resized = new Signal();
    this.keyPressed = new Signal();
    this.sceneSet = new Signal(true);
    this.vrViewportSetup = new Signal(true);
    this.sessionClientSetup = new Signal(true);

    // Signals to abstract the user view.
    // i.e. when a user switches to VR mode, the signals
    // simply emit the new VR data.
    this.viewChanged = new Signal();
    this.redrawOccured = new Signal();

    this.setupWebGL(
      canvasDiv,
      options.webglOptions ? options.webglOptions : {}
    );

    for (const passtype in registeredPasses) {
      for (const cls of registeredPasses[passtype]) {
        this.addPass(new cls(), passtype, false);
      }
    }

    this.addViewport('main');

    // ////////////////////////////////////////////
    // WebXR
    this.__supportXR =
      options.supportXR !== undefined ? options.supportXR : true;
    this.__xrViewport = undefined;
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
              this.__xrViewport = this.__setupXRViewport();
              this.vrViewportSetup.emit(this.__xrViewport);
              resolve(this.__xrViewport);
            });
          };
          if (navigator.xr.supportsSessionMode) {
            // Old
            navigator.xr
              .supportsSessionMode('immersive-vr')
              .then(setupXRViewport)
              .catch(reason => {
                console.warn('Unable to setup XR:' + reason);
              });
          } else {
            // New
            navigator.xr
              .supportsSession('immersive-vr')
              .then(setupXRViewport)
              .catch(reason => {
                console.warn('Unable to setup XR:' + reason);
              });
          }

          // TODO:
          // navigator.xr.addEventListener('devicechange', checkForXRSupport);
        }
      }
    });
  }

  /**
   * The addShaderPreprocessorDirective method.
   * @param {string} name - The name value.
   * @param {any} value - The value param.
   */
  addShaderPreprocessorDirective(name, value) {
    if (value)
      this.__shaderDirectives[name] = '#define ' + name + ' = ' + value;
    else this.__shaderDirectives[name] = '#define ' + name;
    const directives = [];
    for (const key in this.__shaderDirectives) {
      directives.push(this.__shaderDirectives[key]);
    }
    this.__preproc.defines = directives.join('\n') + '\n';
    this.__gl.shaderopts = this.__preproc;
  }

  /**
   * The getShaderPreproc method.
   * @return {any} - The return value.
   */
  getShaderPreproc() {
    return this.__preproc;
  }

  /**
   * The getWidth method.
   * @return {any} - The return value.
   */
  getWidth() {
    return this.__glcanvas.width;
  }

  /**
   * The getHeight method.
   * @return {any} - The return value.
   */
  getHeight() {
    return this.__glcanvas.height;
  }

  // //////////////////////////////////////
  // Viewports

  /**
   * Add a viewport.
   * @param {string} name - The name of the viewport.
   * @return {GLViewport} - The return value.
   */
  addViewport(name) {
    const vp = new GLViewport(this, name, this.getWidth(), this.getHeight());
    vp.updated.connect(() => {
      this.requestRedraw();
    });

    vp.createGeomDataFbo(this.__floatGeomBuffer);

    vp.viewChanged.connect(data => {
      if (!this.__xrViewportPresenting) this.viewChanged.emit(data);
    });

    this.__viewports.push(vp);
    return vp;
  }

  /**
   * The getViewport method.
   * @param {number} index - The index value.
   * @return {GLViewport} - The return value.
   */
  getViewport(index = 0) {
    return this.__viewports[index];
  }

  /**
   * The getViewportAtPos method.
   * @param {number} offsetX - The viewport offset in the X axis.
   * @param {number} offsetY - The viewport offset in the Y axis.
   * @return {GLViewport} - The return value.
   */
  getViewportAtPos(offsetX, offsetY) {
    for (const vp of this.__viewports) {
      const x = vp.getPosX();
      const y = vp.getPosY();
      const width = vp.getWidth();
      const height = vp.getHeight();
      if (
        offsetX >= x &&
        offsetY >= y &&
        offsetX <= width + x &&
        offsetY <= height + y
      )
        return vp;
    }
    return undefined;
  }

  /**
   * The activateViewport method.
   * @param {GLViewport} vp - The viewport.
   */
  activateViewport(vp) {
    if (this.__activeViewport == vp) return;

    this.__activeViewport = vp;
  }

  /**
   * The activateViewportAtPos method.
   * @param {number} offsetX - The viewport offset in the X axis.
   * @param {number} offsetY - The viewport offset in the Y axis.
   */
  activateViewportAtPos(offsetX, offsetY) {
    if (this.__xrViewportPresenting) return;
    const vp = this.getViewportAtPos(offsetX, offsetY);
    if (vp && vp != this.__activeViewport) this.activateViewport(vp);
  }

  /**
   * The getActiveViewport method.
   * @return {any} - The return value.
   */
  getActiveViewport() {
    if (this.__xrViewportPresenting) return this.__xrViewport;
    return this.__activeViewport;
  }

  /**
   * The suspendDrawing method.
   */
  suspendDrawing() {
    this.__drawSuspensionLevel++;
  }

  /**
   * The resumeDrawing method.
   */
  resumeDrawing() {
    this.__drawSuspensionLevel--;
    if (this.__drawSuspensionLevel == 0) {
      if (this.__loadingImg) this.__glcanvasDiv.removeChild(this.__loadingImg);

      this.renderGeomDataFbos();
      this.requestRedraw();
    }
  }

  /**
   * The renderGeomDataFbos method. Frame buffer (FBO).
   */
  renderGeomDataFbos() {
    if (this.__renderGeomDataFbosRequested == true) return;

    this.__renderGeomDataFbosRequested = true;
    const onAnimationFrame = () => {
      for (const vp of this.__viewports) vp.renderGeomDataFbo();
      this.__renderGeomDataFbosRequested = false;
    };
    window.requestAnimationFrame(onAnimationFrame);
  }

  // //////////////////////////////////////
  // Scene

  /**
   * Setup the grid in the scene.
   * @param {any} gridSize - The size of the grid.
   * @param {Color} gridColor - The color of the grid.
   * @param {any} resolution - The resolution of the grid.
   * @param {any} lineThickness - The thickness of the grid lines.
   * @return {any} - The return value.
   */
  setupGrid(gridSize, gridColor, resolution, lineThickness) {
    console.warn('Deprecated Method. Please use scene.setupGrid');
    return this.__scene.setupGrid(gridSize, resolution, gridColor);
  }

  /**
   * The getScene method.
   * @return {any} - The return value.
   */
  getScene() {
    return this.__scene;
  }

  /**
   * The setScene method.
   * @param {any} scene - The scene value.
   */
  setScene(scene) {
    this.__scene = scene;
    this.addTreeItem(this.__scene.getRoot());

    if (this.__gizmoContext)
      this.__gizmoContext.setSelectionManager(scene.getSelectionManager());

    this.sceneSet.emit(this.__scene);
  }

  /**
   * Add tree items to the scene.
   * @param {any} treeItem - The tree item to add.
   */
  addTreeItem(treeItem) {
    // Note: We can have BaseItems in the tree now.
    if (!(treeItem instanceof TreeItem)) return;
    if (treeItem.isDestroyed()) {
      throw new Error('treeItem is destroyed:' + treeItem.getPath());
    }

    for (const passCbs of this.__passCallbacks) {
      const rargs = {
        continueInSubTree: true,
      };
      const handled = passCbs.itemAddedFn(treeItem, rargs);
      if (handled) {
        if (!rargs.continueInSubTree) return;
        break;
      }
    }

    // Traverse the tree adding items until we hit the leaves (which are usually GeomItems.)
    for (const childItem of treeItem.getChildren()) {
      if (childItem) this.addTreeItem(childItem);
    }

    treeItem.childAdded.connect(this.addTreeItem);
    treeItem.childRemoved.connect(this.removeTreeItem);

    this.renderGeomDataFbos();
  }

  /**
   * Remove tree items from the scene.
   * @param {any} treeItem - The tree item to remove.
   */
  removeTreeItem(treeItem) {
    // Note: We can have BaseItems in the tree now.
    if (!(treeItem instanceof TreeItem)) return;

    treeItem.childAdded.disconnect(this.addTreeItem);
    treeItem.childRemoved.disconnect(this.removeTreeItem);

    for (const passCbs of this.__passCallbacks) {
      if (!passCbs.itemRemovedFn) continue;
      const rargs = {
        continueInSubTree: true,
      };
      const handled = passCbs.itemRemovedFn(treeItem, rargs);
      if (handled) {
        if (!rargs.continueInSubTree) return;
        break;
      }
    }

    // Traverse the tree adding items till we hit the leaves (which are usually GeomItems).
    for (const childItem of treeItem.getChildren()) {
      if (childItem) this.removeTreeItem(childItem);
    }
    this.renderGeomDataFbos();
  }

  // ///////////////////////
  // Renderer Setup

  /**
   * Getter for gl.
   */
  get gl() {
    return this.__gl;
  }

  /**
   * The getGL method.
   * @return {any} - The return value.
   */
  getGL() {
    return this.__gl;
  }

  /**
   * The resizeFbos method. Frame buffer (FBO).
   * @param {any} width - The width of the frame buffer.
   * @param {any} height - The height of the frame buffer.
   */
  resizeFbos(width, height) {}

  /**
   * The __onResize method.
   * @private
   */
  __onResize() {
    if (!this.__xrViewportPresenting) {
      this.__glcanvas.width =
        this.__glcanvas.clientWidth * window.devicePixelRatio;
      this.__glcanvas.height =
        this.__glcanvas.clientHeight * window.devicePixelRatio;

      for (const vp of this.__viewports)
        vp.resize(this.__glcanvas.width, this.__glcanvas.height);

      this.resizeFbos(this.__glcanvas.width, this.__glcanvas.height);

      this.resized.emit(this.__glcanvas.width, this.__glcanvas.height);
      this.requestRedraw();
    }
  }

  /**
   * The getDiv method.
   * @return {any} - The return value.
   */
  getDiv() {
    return this.__glcanvasDiv;
  }

  /**
   * The setupWebGL method.
   * @param {any} canvasDiv - The canvasDiv value.
   * @param {any} webglOptions - The webglOptions value.
   */
  setupWebGL(canvasDiv, webglOptions) {
    this.__glcanvas = document.createElement('canvas');
    this.__glcanvas.style.position = webglOptions.canvasPosition
      ? webglOptions.canvasPosition
      : 'absolute';
    this.__glcanvas.style.left = '0px';
    this.__glcanvas.style.top = '0px';
    this.__glcanvas.style.width = '100%';
    this.__glcanvas.style.height = '100%';

    this.__glcanvasDiv = canvasDiv;
    this.__glcanvasDiv.appendChild(this.__glcanvas);

    onResize(this.__glcanvas, event => {
      this.__onResize();
    });
    this.__onResize();

    webglOptions.preserveDrawingBuffer = true;
    webglOptions.stencil = webglOptions.stencil ? webglOptions.stencil : false;
    webglOptions.alpha = webglOptions.alpha ? webglOptions.alpha : false;
    webglOptions.xrCompatible = true;
    this.__gl = create3DContext(this.__glcanvas, webglOptions);
    if (!this.__gl)
      alert('Unable to create WebGL context. WebGL not supported.');
    this.__gl.renderer = this;

    if (this.__gl.name == 'webgl2') {
      this.addShaderPreprocessorDirective('ENABLE_ES3');
    }
    if (this.__gl.floatTexturesSupported) {
      this.addShaderPreprocessorDirective('ENABLE_FLOAT_TEXTURES');
    }

    this.__gl.screenQuad = new GLScreenQuad(this.__gl);
    this.__screenQuad = this.__gl.screenQuad;

    // Note: Mobile devices don't provide much support for reading data back from float textures,
    // and checking compatibility is patchy at best.
    // Note: We are now pushing on high-end mobile devices.
    // Galaxy and above. We need this. We need to accurately determine
    // if the float buffer is not supported.
    this.__floatGeomBuffer =
      this.__gl.floatTexturesSupported && SystemDesc.browserName != 'Safari';
    this.__gl.floatGeomBuffer = this.__floatGeomBuffer;
    // Note: The following returns UNSIGNED_BYTE even if the browser supports float.
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

    // ////////////////////////////////
    // Setup event handlers
    const isValidCanvas = () => {
      return this.__glcanvas.width > 0 && this.__glcanvas.height;
    };

    const calcRendererCoords = event => {
      const rect = this.__glcanvas.getBoundingClientRect();
      event.rendererX = (event.clientX - rect.left) * window.devicePixelRatio;
      event.rendererY = (event.clientY - rect.top) * window.devicePixelRatio;
    };

    this.__glcanvas.addEventListener('mouseenter', event => {
      event.stopPropagation();
      event.undoRedoManager = this.undoRedoManager;
      if (!mouseIsDown) {
        activeGLRenderer = this;
        calcRendererCoords(event);
        // TODO: Check mouse pos.
        activeGLRenderer.activateViewportAtPos(
          event.rendererX,
          event.rendererY
        );
        mouseLeft = false;
      }
    });
    this.__glcanvas.addEventListener('mouseleave', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      event.stopPropagation();
      event.undoRedoManager = this.undoRedoManager;
      if (!mouseIsDown) {
        const vp = activeGLRenderer.getActiveViewport();
        if (vp) {
          vp.onMouseLeave(event);
          event.preventDefault();
        }
        activeGLRenderer = undefined;
      } else {
        mouseLeft = true;
      }
    });
    this.__glcanvas.addEventListener('mousedown', event => {
      event.stopPropagation();
      event.undoRedoManager = this.undoRedoManager;
      calcRendererCoords(event);
      mouseIsDown = true;
      activeGLRenderer = this;
      activeGLRenderer.activateViewportAtPos(event.rendererX, event.rendererY);
      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onMouseDown(event);
      }
      mouseLeft = false;
      return false;
    });
    document.addEventListener('mouseup', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      event.stopPropagation();
      event.undoRedoManager = this.undoRedoManager;
      // if(mouseIsDown && mouseMoveDist < 0.01)
      //     mouseClick(event);
      calcRendererCoords(event);
      mouseIsDown = false;
      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onMouseUp(event);
      }
      if (mouseLeft) {
        const vp = activeGLRenderer.getActiveViewport();
        if (vp) {
          vp.onMouseLeave(event);
          event.preventDefault();
        }
        activeGLRenderer = undefined;
      }
      return false;
    });

    // document.addEventListener('dblclick', (event)=>{
    //     event.preventDefault();
    //     event.stopPropagation();
    // });
    // document.addEventListener('click', (event)=>{
    //     event.preventDefault();
    //     event.stopPropagation();
    // });

    document.addEventListener('mousemove', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      event.preventDefault();
      event.stopPropagation();
      event.undoRedoManager = this.undoRedoManager;
      calcRendererCoords(event);
      if (!mouseIsDown)
        activeGLRenderer.activateViewportAtPos(
          event.rendererX,
          event.rendererY
        );

      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onMouseMove(event);
      }
      return false;
    });

    const onWheel = event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      if (activeGLRenderer) {
        event.stopPropagation();
        event.undoRedoManager = this.undoRedoManager;
        if (!window.addEventListener) event.preventDefault();
        this.onWheel(event);
      }
      return false;
    };
    if (window.addEventListener)
      /** DOMMouseScroll is for mozilla. */
      window.addEventListener('wheel', onWheel, { passive: true });
    else {
      /** IE/Opera. */
      window.onmousewheel = document.onmousewheel = onWheel;
    }

    window.oncontextmenu = function() {
      return false;
    };

    document.addEventListener('keypress', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      const key = String.fromCharCode(event.keyCode).toLowerCase();
      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onKeyPressed(key, event);
      }
    });

    document.addEventListener('keydown', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      const key = String.fromCharCode(event.keyCode).toLowerCase();
      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onKeyDown(key, event);
      }
    });

    document.addEventListener('keyup', event => {
      if (activeGLRenderer != this || !isValidCanvas()) return;
      const key = String.fromCharCode(event.keyCode).toLowerCase();
      const vp = activeGLRenderer.getActiveViewport();
      if (vp) {
        vp.onKeyUp(key, event);
      }
    });

    this.__glcanvas.addEventListener(
      'touchstart',
      event => {
        event.stopPropagation();
        event.undoRedoManager = this.undoRedoManager;
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i]);
        }
        this.getViewport().onTouchStart(event);
      },
      false
    );

    this.__glcanvas.addEventListener(
      'touchmove',
      event => {
        event.stopPropagation();
        event.undoRedoManager = this.undoRedoManager;
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i]);
        }
        this.getViewport().onTouchMove(event);
      },
      false
    );

    this.__glcanvas.addEventListener(
      'touchend',
      event => {
        event.stopPropagation();
        event.undoRedoManager = this.undoRedoManager;
        for (let i = 0; i < event.touches.length; i++) {
          calcRendererCoords(event.touches[i]);
        }
        this.getViewport().onTouchEnd(event);
      },
      false
    );

    this.__glcanvas.addEventListener(
      'touchcancel',
      event => {
        event.stopPropagation();
        event.undoRedoManager = this.undoRedoManager;
        this.getViewport().onTouchCancel(event);
      },
      false
    );
  }

  /**
   * The setUndoRedoManager method.
   * @param {object} undoRedoManager - The undoRedoManager state.
   */
  setUndoRedoManager(undoRedoManager) {
    this.undoRedoManager = undoRedoManager;
  }

  /**
   * The getGLCanvas method.
   * @return {any} - The return value.
   */
  getGLCanvas() {
    return this.__glcanvas;
  }

  /**
   * The getScreenQuad method.
   * @return {any} - The return value.
   */
  getScreenQuad() {
    return this.__screenQuad;
  }

  /**
   * Causes an event to occur when the mouse wheel is rolled up or down over an element.
   * @param {any} event - The event that occurs.
   */
  onWheel(event) {
    this.__viewports[0].onWheel(event);
  }

  /**
   * The frameAll method.
   * @param {number} viewportIndex - The viewportIndex value.
   */
  frameAll(viewportIndex = 0) {
    this.__viewports[viewportIndex].frameView([this.__scene.getRoot()]);
  }

  // ///////////////////////
  // Render Items Setup

  /**
   * The getOrCreateShader method.
   * @param {string} shaderName - The shader name.
   * @return {any} - The return value.
   */
  getOrCreateShader(shaderName) {
    let glshader = this.__shaders[shaderName];
    if (!glshader) {
      glshader = sgFactory.constructClass(shaderName, this.__gl);
      if (!glshader)
        console.error('Shader not registered with the SGFactory:', shaderName);
      this.__shaders[shaderName] = glshader;
    }
    return glshader;
  }

  /**
   * The addPass method.
   * @param {any} pass - The pass value.
   * @param {number} passtype - The passtype value.
   * @param {boolean} updateIndices - The updateIndices value.
   * @return {any} - The return value.
   */
  addPass(pass, passtype = 0, updateIndices = true) {
    if (!this.__passes[passtype]) this.__passes[passtype] = [];

    let index = 0;
    for (const key in this.__passes) {
      if (key == passtype) break;
      index += this.__passes[key].length;
    }
    index += this.__passes[passtype].length;

    pass.updated.connect(this.requestRedraw.bind(this));
    pass.init(this, index);
    this.__passes[passtype].push(pass);

    if (updateIndices) {
      // Now update all the  subsequent pass indices because the
      // indices after will have changed.
      let offset = 0;
      for (const key in this.__passes) {
        const passSet = this.__passes[key];
        passSet.forEach((pass, index) => {
          pass.setPassIndex(offset + index);
        });
        offset += passSet.length;
      }
    }

    this.requestRedraw();
    return index;
  }

  /**
   * The registerPass method.
   * @param {any} itemAddedFn - The itemAddedFn value.
   * @param {any} itemRemovedFn - The itemRemovedFn value.
   */
  registerPass(itemAddedFn, itemRemovedFn) {
    // insert at the beginning so it is called first.
    this.__passCallbacks.splice(0, 0, {
      itemAddedFn,
      itemRemovedFn,
    });
  }

  /**
   * The getPass method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getPass(index) {
    let offset = 0;
    for (const key in this.__passes) {
      const passSet = this.__passes[key];
      if (index - offset < passSet.length) return passSet[index - offset];
      offset += passSet.length;
    }
  }

  /**
   * The findPass method.
   * @param {any} constructor - The constructor value.
   * @return {any} - The return value.
   */
  findPass(constructor) {
    for (const key in this.__passes) {
      const passSet = this.__passes[key];
      for (const pass of passSet) {
        if (pass.constructor == constructor) return pass;
      }
    }
  }

  /**
   * The getGizmoPass method.
   * @return {any} - The return value.
   */
  getGizmoPass() {
    return this.__gizmoPass;
  }

  // ///////////////////////
  // VR Setup

  /**
   * The supportsVR method.
   * @return {any} - The return value.
   */
  supportsVR() {
    console.warn(
      'Deprecated Method. Please instead connect to the vrViewportSetup signal.'
    );
    return this.__supportXR && navigator.xr != null;
  }

  /**
   * The __setupXRViewport method.
   * @return {any} - The return value.
   * @private
   */
  __setupXRViewport() {
    // Always get the last display. Additional displays are added at the end.(e.g. [Polyfill, HMD])
    const xrvp = new VRViewport(this);

    xrvp.presentingChanged.connect(state => {
      this.__xrViewportPresenting = state;
      if (state) {
        // Let the passes know that VR is starting.
        // They can do things like optimize shaders.
        for (const key in this.__passes) {
          const passSet = this.__passes[key];
          for (const pass of passSet) {
            pass.startPresenting();
          }
        }

        xrvp.viewChanged.connect(this.viewChanged.emit);
      } else {
        xrvp.viewChanged.disconnect(this.viewChanged.emit);

        for (const key in this.__passes) {
          const passSet = this.__passes[key];
          for (const pass of passSet) {
            pass.stopPresenting();
          }
        }

        this.viewChanged.emit({
          interfaceType: 'CameraAndPointer',
          viewXfo: this.getViewport()
            .getCamera()
            .getGlobalXfo(),
        });

        this.resizeFbos(this.__glcanvas.width, this.__glcanvas.height);
        this.requestRedraw();
      }
    });
    return xrvp;
  }

  /**
   * The getVRViewport method.
   * @return {any} - The return value.
   */
  getVRViewport() {
    return this.__xrViewport;
  }

  /**
   * The getXRViewport method.
   * @return {any} - The return value.
   */
  getXRViewport() {
    return this.__xrViewportPromise;
  }

  /**
   * The isXRViewportPresenting method.
   * @return {any} - The return value.
   */
  isXRViewportPresenting() {
    return this.__xrViewportPresenting;
  }

  // //////////////////////////
  // Rendering

  /**
   * The isContinuouslyDrawing method.
   * @return {any} - The return value.
   */
  isContinuouslyDrawing() {
    return this.__continuousDrawing;
  }

  /**
   * The startContinuousDrawing method.
   */
  startContinuousDrawing() {
    if (this.isContinuouslyDrawing() || this.__xrViewportPresenting) return;

    const onAnimationFrame = () => {
      if (this.__continuousDrawing && !this.__xrViewportPresenting)
        window.requestAnimationFrame(onAnimationFrame);
      for (const vp of this.__viewports) vp.draw();
    };

    this.__continuousDrawing = true;
    window.requestAnimationFrame(onAnimationFrame);
  }

  /**
   * The stopContinuousDrawing method.
   */
  stopContinuousDrawing() {
    this.__continuousDrawing = false;
  }

  /**
   * The toggleContinuousDrawing method.
   */
  toggleContinuousDrawing() {
    if (!this.__continuousDrawing) {
      this.startContinuousDrawing();
    } else {
      this.stopContinuousDrawing();
    }
  }

  /**
   * The drawItemChanged method.
   */
  drawItemChanged() {
    for (const vp of this.__viewports) vp.invalidateGeomDataBuffer();
    this.requestRedraw();
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
      this.__xrViewportPresenting
    )
      return false;

    const onAnimationFrame = () => {
      this.__redrawRequested = false;
      for (const vp of this.__viewports) {
        vp.draw();
      }
    };
    window.requestAnimationFrame(onAnimationFrame);
    this.__redrawRequested = true;
    return true;
  }

  /**
   * The bindGLBaseRenderer method.
   * @param {any} renderstate - The renderstate value.
   */
  bindGLBaseRenderer(renderstate) {
    renderstate.shaderopts = this.__preproc;

    const gl = this.__gl;
    if (!renderstate.viewports || renderstate.viewports.length == 1) {
      renderstate.bindRendererUnifs = unifs => {
        {
          const unif = unifs.cameraMatrix;
          if (unif) {
            gl.uniformMatrix4fv(
              unif.location,
              false,
              renderstate.cameraMatrix.asArray()
            );
          }
        }

        const vp = renderstate.viewports[0];
        {
          const unif = unifs.viewMatrix;
          if (unif) {
            gl.uniformMatrix4fv(unif.location, false, vp.viewMatrix.asArray());
          }
        }
        {
          const unif = unifs.projectionMatrix;
          if (unif) {
            gl.uniformMatrix4fv(
              unif.location,
              false,
              vp.projectionMatrix.asArray()
            );
          }
        }
        {
          const unif = unifs.eye;
          if (unif) {
            // Left or right eye, when rendering sterio VR.
            gl.uniform1i(unif.location, 0);
          }
        }
      };
      renderstate.bindViewports = (unifs, cb) => cb();
    } else {
      renderstate.bindRendererUnifs = unifs => {
        // Note: the camera matrix should be the head position instead
        // of the eye position. The inverse(viewMatrix) can be used
        // when we want the eye pos.
        {
          const unif = unifs.cameraMatrix;
          if (unif) {
            gl.uniformMatrix4fv(
              unif.location,
              false,
              renderstate.cameraMatrix.asArray()
            );
          }
        }
      };

      renderstate.bindViewports = (unifs, cb) => {
        renderstate.viewports.forEach((vp, index) => {
          gl.viewport(...vp.region);
          {
            const unif = unifs.viewMatrix;
            if (unif) {
              gl.uniformMatrix4fv(
                unif.location,
                false,
                vp.viewMatrix.asArray()
              );
            }
          }
          {
            const unif = unifs.projectionMatrix;
            if (unif) {
              gl.uniformMatrix4fv(
                unif.location,
                false,
                vp.projectionMatrix.asArray()
              );
            }
          }
          {
            const unif = unifs.eye;
            if (unif) {
              // Left or right eye, when rendering sterio VR.
              gl.uniform1i(unif.location, index);
            }
          }
          cb();
        });
      };
    }
  }

  /**
   * The drawScene method.
   * @param {any} renderstate - The renderstate value.
   */
  drawScene(renderstate) {
    // Bind already called by GLRenderer.
    for (const key in this.__passes) {
      const passSet = this.__passes[key];
      for (const pass of passSet) {
        if (pass.enabled) pass.draw(renderstate);
      }
    }
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlightedGeoms(renderstate) {
    this.bindGLBaseRenderer(renderstate);
    for (const key in this.__passes) {
      const passSet = this.__passes[key];
      for (const pass of passSet) {
        if (pass.enabled) pass.drawHighlightedGeoms(renderstate);
      }
    }
  }

  /**
   * The drawSceneGeomData method.
   * @param {any} renderstate - The renderstate value.
   */
  drawSceneGeomData(renderstate) {
    this.bindGLBaseRenderer(renderstate);
    for (const key in this.__passes) {
      const passSet = this.__passes[key];
      for (const pass of passSet) {
        if (pass.enabled) pass.drawGeomData(renderstate);
      }
    }
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * The registerPass method.
   * @param {any} cls - The cls value.
   * @param {any} passtype - The passtype value.
   */
  static registerPass(cls, passtype) {
    if (!registeredPasses[passtype]) registeredPasses[passtype] = [];
    registeredPasses[passtype].push(cls);
  }
}

export { GLBaseRenderer };
