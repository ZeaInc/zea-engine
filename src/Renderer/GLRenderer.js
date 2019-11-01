import { SystemDesc } from '../BrowserDetection.js';
import { Signal } from '../Utilities';
import { Vec3 } from '../Math';
import { Plane, BaseImage, ProceduralSky, LightmapMixer } from '../SceneTree';
import { GLFbo } from './GLFbo.js';
import { GLHDRImage } from './GLHDRImage.js';
import { GLLightmapMixer } from './GLLightmapMixer.js';
import { GLEnvMap } from './GLEnvMap.js';
import { GLProceduralSky } from './GLProceduralSky.js';
import { GLBaseRenderer } from './GLBaseRenderer.js';
import { GLTexture2D } from './GLTexture2D.js';
import {
  BackgroundImageShader,
  OctahedralEnvMapShader,
  LatLongEnvMapShader,
  SterioLatLongEnvMapShader,
  DualFishEyeToLatLongBackgroundShader,
} from './Shaders/EnvMapShader.js';
import { generateShaderGeomBinding } from './GeomShaderBinding.js';

// import {
//     PostProcessing
// } from './Shaders/PostProcessing.js';
import { OutlinesShader } from './Shaders/OutlinesShader.js';
import { GLMesh } from './GLMesh.js';

/** Class representing a GL renderer.
 * @extends GLBaseRenderer
 */
class GLRenderer extends GLBaseRenderer {
  /**
   * Create a GL renderer.
   * @param {any} canvasDiv - The canvasDiv value.
   * @param {any} options - The options value.
   */
  constructor(canvasDiv, options = {}) {
    super(canvasDiv, options, {
      antialias: true,
      depth: true,
    });

    // ///////////////////////
    // Renderer Setup
    this.__exposure = 1.0;
    this.__tonemap = true;
    this.__gamma = 2.2;

    this.__glEnvMap = undefined;
    this.__glBackgroundMap = undefined;
    this.envMapAssigned = new Signal(true);

    this.__glLightmaps = {};
    this.__displayEnvironment = true;
    this.__debugMode = 0;
    this.__debugLightmaps = false;
    this._planeDist = 0.0;
    this.__cutPlaneNormal = new Vec3(1, 0, 0);

    const gl = this.__gl;

    this.__debugTextures = [undefined];

    this.addShaderPreprocessorDirective('ENABLE_INLINE_GAMMACORRECTION');

    if (!options.disableLightmaps)
      this.addShaderPreprocessorDirective('ENABLE_LIGHTMAPS');
    if (!options.disableTextures)
      this.addShaderPreprocessorDirective('ENABLE_TEXTURES');

    if (!SystemDesc.isMobileDevice) {
      if (!options.disableSpecular)
        this.addShaderPreprocessorDirective('ENABLE_SPECULAR');
      // this.addShaderPreprocessorDirective('ENABLE_DEBUGGING_LIGHTMAPS');
    }

    this.__outlineShader = new OutlinesShader(gl);
    this.quad = new GLMesh(gl, new Plane(1, 1));

    // this.__glshaderScreenPostProcess = new PostProcessing(gl);

    this.createSelectedGeomsFbo();
  }

  /**
   * The __bindEnvMap method.
   * @param {any} env - The env value.
   * @private
   */
  __bindEnvMap(env) {
    if (env instanceof ProceduralSky) {
      this.__glEnvMap = new GLProceduralSky(this.__gl, env);
    } else if (env instanceof BaseImage) {
      this.__glEnvMap = env.getMetadata('gltexture');
      if (!this.__glEnvMap) {
        if (env.type === 'FLOAT') {
          this.addShaderPreprocessorDirective('ENABLE_SPECULAR');
          this.__glEnvMap = new GLEnvMap(this, env, this.__preproc);
        } else if (env.isStreamAtlas()) {
          this.__glEnvMap = new GLImageStream(this.__gl, env);
        } else {
          this.__glEnvMap = new GLTexture2D(this.__gl, env);
        }
      }
    } else {
      console.warn('Unsupported EnvMap:' + env);
      return;
    }
    this.__glEnvMap.ready.connect(this.requestRedraw);
    this.__glEnvMap.updated.connect(this.requestRedraw);

    this.envMapAssigned.emit(this.__glEnvMap);
  }

  /**
   * The getGLEnvMap method.
   * @return {any} - The return value.
   */
  getGLEnvMap() {
    return this.__glEnvMap;
  }

  /**
   * The getEnvMapTex method.
   * @return {any} - The return value.
   */
  getEnvMapTex() {
    console.warn('Deprecated Function');
    return this.__glEnvMap;
  }

  /**
   * The setScene method.
   * @param {any} scene - The scene value.
   */
  setScene(scene) {
    super.setScene(scene);

    if (scene.getEnvMap() != undefined) {
      this.__bindEnvMap(scene.getEnvMap());
    }
    this.__scene.envMapChanged.connect(this.__bindEnvMap.bind(this));

    // Note: The difference bween an EnvMap and a BackgroundMap, is that
    // An EnvMap must be HDR, and can be convolved for reflections.
    // A Background map can be simply an image.
    if (scene.getBackgroundMap() != undefined) {
      const gl = this.__gl;
      const backgroundMap = scene.getBackgroundMap();
      this.__glBackgroundMap = backgroundMap.getMetadata('gltexture');
      if (!this.__glBackgroundMap) {
        if (backgroundMap.type === 'FLOAT') {
          this.__glBackgroundMap = new GLHDRImage(gl, backgroundMap);
        } else {
          this.__glBackgroundMap = new GLTexture2D(gl, backgroundMap);
        }
      }
      this.__glBackgroundMap.ready.connect(this.requestRedraw);
      this.__glBackgroundMap.updated.connect(this.requestRedraw);
      if (!this.__backgroundMapShader) {
        if (!gl.__quadVertexIdsBuffer) gl.setupInstancedQuad();
        switch (backgroundMap.getMapping()) {
          case 'octahedral':
            this.__backgroundMapShader = new OctahedralEnvMapShader(gl);
            break;
          case 'latlong':
            this.__backgroundMapShader = new LatLongEnvMapShader(gl);
            break;
          case 'steriolatlong':
            this.__backgroundMapShader = new SterioLatLongEnvMapShader(gl);
            break;
          case 'dualfisheye':
            this.__backgroundMapShader = new DualFishEyeToLatLongBackgroundShader(
              gl
            );
            break;
          case 'uv':
          default:
            this.__backgroundMapShader = new BackgroundImageShader(gl);
            break;
        }
        const shaderComp = this.__backgroundMapShader.compileForTarget();
        this.__backgroundMapShaderBinding = generateShaderGeomBinding(
          gl,
          shaderComp.attrs,
          gl.__quadattrbuffers,
          gl.__quadIndexBuffer
        );
      }
    }

    const lightMaps = scene.getLightMaps();
    const addLightmap = (name, lightmap) => {
      let gllightmap;
      if (lightmap instanceof LightmapMixer)
        gllightmap = new GLLightmapMixer(this.__gl, lightmap);
      else {
        gllightmap = lightmap.image.getMetadata('gltexture');
        if (!gllightmap) {
          gllightmap = new GLHDRImage(this.__gl, lightmap.image);
        }
      }
      gllightmap.updated.connect(data => {
        this.requestRedraw();
      });
      this.__glLightmaps[name] = {
        atlasSize: lightmap.atlasSize,
        glimage: gllightmap,
      };
    };
    for (const name in lightMaps) {
      addLightmap(name, lightMaps[name]);
    }
    scene.lightmapAdded.connect(addLightmap);
  }

  /**
   * The addViewport method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  addViewport(name) {
    const vp = super.addViewport(name);
    // vp.createOffscreenFbo();
    return vp;
  }

  /**
   * The onKeyPressed method.
   * @param {any} key - The key value.
   * @param {any} event - The event value.
   */
  onKeyPressed(key, event) {
    switch (key) {
      case 'b':
        this.__displayEnvironment = !this.__displayEnvironment;
        this.requestRedraw();
        break;
      default:
        super.onKeyPressed(key, event);
    }
  }

  // //////////////////////////
  // GUI

  /**
   * Getter for exposure.
   */
  get exposure() {
    return this.__exposure;
  }

  /**
   * Setter for exposure.
   * @param {number} val - The val value.
   */
  set exposure(val) {
    this.__exposure = val;
    this.requestRedraw();
  }

  /**
   * Getter for gamma.
   */
  get gamma() {
    return this.__gamma;
  }

  /**
   * Setter for gamma.
   * @param {number} val - The val value.
   */
  set gamma(val) {
    this.__gamma = val;
    this.requestRedraw();
  }

  /**
   * Getter for displayEnvironment.
   */
  get displayEnvironment() {
    return this.__displayEnvironment;
  }

  /**
   * Setter for displayEnvironment.
   * @param {number} val - The val value.
   */
  set displayEnvironment(val) {
    this.__displayEnvironment = val;
    this.requestRedraw();
  }

  /**
   * Getter for planeDist.
   */
  get planeDist() {
    return this._planeDist;
  }

  /**
   * Setter for planeDist.
   * @param {number} val - The val value.
   */
  set planeDist(val) {
    this._planeDist = val;
    this.requestRedraw();
  }

  /**
   * Getter for cutPlaneNormal.
   */
  get cutPlaneNormal() {
    return this.__cutPlaneNormal;
  }

  /**
   * Setter for cutPlaneNormal.
   * @param {number} val - The val value.
   */
  set cutPlaneNormal(val) {
    this.__cutPlaneNormal = val;
    this.requestRedraw();
  }

  // //////////////////////////
  // Fbos

  /**
   * The resizeFbos method.
   * @param {any} width - The width value.
   * @param {any} height - The height value.
   */
  resizeFbos(width, height) {
    super.resizeFbos();
    if (this.__fbo) {
      this.__fbo.colorTexture.resize(width, height);
    }
    if (this.__highlightedGeomsBufferFbo) {
      this.__highlightedGeomsBuffer.resize(width, height);
    }
  }

  // //////////////////////////
  // SelectedGeomsBuffer

  /**
   * The createSelectedGeomsFbo method.
   */
  createSelectedGeomsFbo() {
    const gl = this.__gl;
    this.__highlightedGeomsBuffer = new GLTexture2D(gl, {
      type: 'UNSIGNED_BYTE',
      format: 'RGBA',
      filter: 'NEAREST',
      width: this.__glcanvas.width <= 1 ? 1 : this.__glcanvas.width,
      height: this.__glcanvas.height <= 1 ? 1 : this.__glcanvas.height,
    });
    this.__highlightedGeomsBufferFbo = new GLFbo(
      gl,
      this.__highlightedGeomsBuffer,
      true
    );
    this.__highlightedGeomsBufferFbo.setClearColor([0, 0, 0, 0]);
  }

  /**
   * The getFbo method.
   * @return {any} - The return value.
   */
  getFbo() {
    return this.__fbo;
  }

  /**
   * The createOffscreenFbo method.
   * @param {any} format - The format value.
   */
  createOffscreenFbo(format = 'RGB') {
    const targetWidth = this.__glcanvas.width;
    const targetHeight = this.__glcanvas.height;

    const gl = this.__gl;
    this.__fwBuffer = new GLTexture2D(gl, {
      type: 'FLOAT',
      format,
      filter: 'NEAREST',
      width: targetWidth,
      height: targetHeight,
    });
    this.__fbo = new GLFbo(gl, this.__fwBuffer, true);
    this.__fbo.setClearColor(this.__backgroundColor.asArray());
  }

  // //////////////////////////
  // Rendering

  /**
   * The drawBackground method.
   * @param {any} renderstate - The renderstate value.
   */
  drawBackground(renderstate) {
    if (this.__glBackgroundMap) {
      if (!this.__glBackgroundMap.isLoaded()) return;
      const gl = this.__gl;
      gl.depthMask(false);
      this.__backgroundMapShader.bind(renderstate);
      const unifs = renderstate.unifs;
      this.__glBackgroundMap.bindToUniform(renderstate, unifs.backgroundImage);
      this.__backgroundMapShaderBinding.bind(renderstate);
      gl.drawQuad();
    } else if (
      this.__glEnvMap &&
      this.__glEnvMap.draw /* Note: video env maps cannot be drawn directly.*/
    ) {
      this.__glEnvMap.draw(renderstate);
    }
  }

  /**
   * The bindGLRenderer method.
   * @param {any} renderstate - The renderstate value.
   */
  bindGLRenderer(renderstate) {
    super.bindGLBaseRenderer(renderstate);

    renderstate.envMap = this.__glEnvMap;
    renderstate.exposure = this.__exposure;
    renderstate.gamma = this.__gamma;
    renderstate.lightmaps = this.__glLightmaps;
    renderstate.boundLightmap = undefined;
    // renderstate.debugLightmaps = this.__debugLightmaps;
    // renderstate.planeDist = this._planeDist;
    // renderstate.planeNormal = this.__cutPlaneNormal;

    const gl = this.__gl;
    const bindGLBaseRendererUnifs = renderstate.bindRendererUnifs;
    renderstate.bindRendererUnifs = unifs => {
      bindGLBaseRendererUnifs(unifs);

      if (this.__glEnvMap) {
        const envMapPyramid = unifs.envMapPyramid;
        if (envMapPyramid && this.__glEnvMap.bindProbeToUniform) {
          this.__glEnvMap.bindProbeToUniform(renderstate, envMapPyramid);
        } else {
          // Bind the env map src 2d image to the env map param
          const { envMapTex, envMapTexType } = unifs;
          if (envMapTex) {
            this.__glEnvMap.bindToUniform(renderstate, envMapTex, {
              textureTypeUnif: envMapTexType,
            });
          }
        }
      }
      {
        const unif = unifs.exposure;
        if (unif) {
          gl.uniform1f(unif.location, this.__exposure);
        }
      }
      {
        const unif = unifs.gamma;
        if (unif) {
          gl.uniform1f(unif.location, this.__gamma);
        }
      }
    };
  }

  /**
   * The drawScene method.
   * @param {any} renderstate - The renderstate value.
   */
  drawScene(renderstate) {
    this.bindGLRenderer(renderstate);

    if (this.__displayEnvironment) this.drawBackground(renderstate);

    super.drawScene(renderstate);
    // console.log("Draw Calls:" + renderstate['drawCalls']);

    if (this.__highlightedGeomsBufferFbo) {
      const gl = this.__gl;

      this.__highlightedGeomsBufferFbo.bindForWriting(renderstate);
      this.__highlightedGeomsBufferFbo.clear();

      // We need to explicitly clear the depth buffer,
      // It seems that sometimes the function above does
      // not do the trick.
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.depthMask(true);

      this.drawHighlightedGeoms(renderstate);

      // Unbind and restore the bound fbo
      this.__highlightedGeomsBufferFbo.unbindForWriting(renderstate);

      // Now render the outlines to the entire screen.
      gl.viewport(...renderstate.region);

      // Turn this on to debug the hilight data buffer.
      // {
      //   gl.screenQuad.bindShader(renderstate);
      //   gl.screenQuad.draw(renderstate, this.__highlightedGeomsBuffer);
      // }

      this.__outlineShader.bind(renderstate);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add

      const unifs = renderstate.unifs;
      this.__highlightedGeomsBuffer.bindToUniform(
        renderstate,
        unifs.highlightDataTexture
      );
      gl.uniform2f(
        unifs.highlightDataTextureSize.location,
        renderstate.region[2],
        renderstate.region[3]
      );
      this.quad.bindAndDraw(renderstate);

      gl.disable(gl.BLEND);
    }

    // /////////////////////////////////////
    // // Post processing.
    // if (this.__fbo) {
    //     const gl = this.__gl;

    //     // Bind the default framebuffer
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //     gl.viewport(...this.region);
    //     // gl.disable(gl.SCISSOR_TEST);

    //     // this.__glshaderScreenPostProcess.bind(renderstate);

    //     // const unifs = renderstate.unifs;
    //     // if ('antialiase' in unifs)
    //     //     gl.uniform1i(unifs.antialiase.location, this.__antialiase ? 1 : 0);
    //     // if ('textureSize' in unifs)
    //     //     gl.uniform2fv(unifs.textureSize.location, fbo.size);
    //     // if ('gamma' in unifs)
    //     //     gl.uniform1f(unifs.gamma.location, this.__gamma);
    //     // if ('exposure' in unifs)
    //     //     gl.uniform1f(unifs.exposure.location, this.__exposure);
    //     // if ('tonemap' in unifs)
    //     //     gl.uniform1i(unifs.tonemap.location, this.__tonemap ? 1 : 0);

    //     gl.screenQuad.bindShader(renderstate);
    //     gl.screenQuad.draw(renderstate, this.__fbo.colorTexture);

    //     // Note: if the texture is left bound, and no textures are bound to slot 0 befor rendering
    //     // more goem int he next frame then the fbo color tex is being read from and written to
    //     // at the same time. (baaaad).
    //     // Note: any textures bound at all avoids this issue, and it only comes up when we have no env
    //     // map, background or textures params in the scene. When it does happen it can be a bitch to
    //     // track down.
    //     gl.bindTexture(gl.TEXTURE_2D, null);
    // }

    this.redrawOccured.emit();
  }
}

export { GLRenderer };
