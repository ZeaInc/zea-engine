import { GLPass, PassType } from './GLPass.js';
import { GLOpaqueGeomsPass } from './GLOpaqueGeomsPass.js';
import { GLRenderer } from '../GLRenderer.js';

class GLOverlayPass extends GLOpaqueGeomsPass {
  constructor() {
    super();
  }

  init(renderer, passIndex) {
    super.init(renderer, passIndex);
  }

  // ///////////////////////////////////
  // Bind to Render Tree
  filterGeomItem(geomItem) {
    const shaderClass = geomItem.getMaterial().getShaderClass();
    if (shaderClass) {
      if (shaderClass.isOverlay()) return true;
    }
    return false;
  }

  draw(renderstate) {
    if (this.newItemsReadyForLoading()) this.finalize();

    const gl = this.__gl;

    // Clear the depth buffer so handls are always drawn over the top.
    gl.clear(gl.DEPTH_BUFFER_BIT);

    if (false)
      // 2-sided rendering.
      gl.disable(gl.CULL_FACE);
    // 2-sided rendering.
    else {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
    }
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);

    renderstate.pass = 'ADD';
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add

    this.__traverseTreeAndDraw(renderstate);

    gl.disable(gl.BLEND);
    // gl.enable(gl.DEPTH_TEST);
  }

  drawGeomData(renderstate) {
    const gl = this.__gl;

    // Clear the depth buffer so handls are always drawn over the top.
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);

    renderstate.pass = 'ADD';
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add

    super.drawGeomData(renderstate);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }
}

GLRenderer.registerPass(GLOverlayPass, PassType.OVERLAY);

export { GLOverlayPass };
