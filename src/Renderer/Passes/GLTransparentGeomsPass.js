import { Vec3 } from '../../Math/Vec3';
import { PassType } from './GLPass.js';
import { GLStandardGeomsPass } from './GLStandardGeomsPass.js';
import { GLRenderer } from '../GLRenderer.js';

class GLTransparentGeomsPass extends GLStandardGeomsPass {
  constructor() {
    super();
  }

  init(renderer, passIndex) {
    super.init(renderer, passIndex);

    this.transparentItems = [];
    this.freeList = [];
    this.visibleItems = [];
    this.prevSortCameraPos = new Vec3(999, 999, 999);
    this.resort = false;
  }

  filterGeomItem(geomItem) {
    const shaderClass = geomItem.getMaterial().getShaderClass();
    if (shaderClass) {
      if (!shaderClass.isTransparent()) return false;
      if (shaderClass.isOverlay()) return false;
      return true;
    }
    return false;
  }

  addGeomItem(geomItem) {
    const material = geomItem.getMaterial();
    const glshader = this.addShader(material);
    const glmaterial = this.addMaterial(material);
    const glgeomitem = super.addGeomItem(geomItem);

    const visibilityChangedId = geomItem.visibilityChanged.connect(visible => {
      if (visible) {
        this.visibleItems.push(item);
      } else {
        const index = this.visibleItems.indexOf(item);
        this.visibleItems.splice(index, 1);
      }
    });
    const geomXfoChangedId = geomItem.geomXfoChanged.connect(() => {
      this.resort = true;
    });

    const item = {
      glshader,
      glmaterial,
      glgeomitem,
      visibilityChangedId,
      geomXfoChangedId,
    };
    let itemindex;
    if (this.freeList.length > 0) itemindex = this.freeList.pop();
    else itemindex = this.transparentItems.length;
    this.transparentItems[itemindex] = item;
    geomItem.setMetadata('itemIndex', itemindex);
    if (geomItem.getVisible()) {
      this.visibleItems.push(item);
    }

    // force a resort.
    this.resort = true;
  }

  removeGeomItem(geomItem) {
    if (!super.removeGeomItem(geomItem)) return;

    const itemindex = geomItem.getMetadata('itemIndex');
    const item = this.transparentItems[itemindex];
    this.transparentItems[itemindex] = null;
    this.freeList.push(itemindex);

    const visibleindex = this.visibleItems.indexOf(item);
    if (visibleindex != -1) this.visibleItems.splice(visibleindex, 1);
  }

  sortItems(viewPos) {
    for (const transparentItem of this.visibleItems)
      transparentItem.dist = transparentItem.glgeomitem.geomItem
        .getGeomXfo()
        .tr.distanceTo(viewPos);
    this.visibleItems.sort((a, b) =>
      a.dist > b.dist ? -1 : a.dist < b.dist ? 1 : 0
    );
    this.prevSortCameraPos = viewPos;
    this.resort = false;
  }

  _drawItems(renderstate) {
    const gl = this.__gl;
    let currentglShader;
    let currentglMaterial;
    let currentglGeom;
    for (const transparentItem of this.visibleItems) {
      const glshader = transparentItem.glmaterial.getGLShader();
      if (currentglShader != transparentItem.glshader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, transparentItem.glshader)) {
          continue;
        }
        currentglShader = transparentItem.glshader;
      }

      if (currentglMaterial != transparentItem.glmaterial) {
        if (!transparentItem.glmaterial.bind(renderstate)) {
          continue;
        }
        currentglMaterial = transparentItem.glmaterial;
      }

      const glgeomitem = transparentItem.glgeomitem;
      if (currentglGeom != glgeomitem.glGeom) {
        currentglGeom = glgeomitem.glGeom;
        if (!currentglGeom.bind(renderstate)) {
          continue;
        }
      }

      if (glgeomitem.bind(renderstate)) {
        // Specify an non-instanced draw to the shader
        if (renderstate.unifs.instancedDraw) {
          gl.uniform1i(renderstate.unifs.instancedDraw.location, 0);
          gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location);
        }

        renderstate.bindViewports(renderstate.unifs, () => {
          currentglGeom.draw(renderstate);
        });
      }
    }

    if (currentglGeom) currentglGeom.unbind(renderstate);
  }

  draw(renderstate) {
    if (this.visibleItems.length == 0) return;

    if (this.newItemsReadyForLoading()) this.finalize();

    const gl = this.__gl;

    const viewPos = renderstate.viewXfo.tr;
    // TODO: Avoid sorting if the camera did not movemore than 30cm
    if (this.resort || viewPos.distanceTo(this.prevSortCameraPos) > 0.3)
      this.sortItems(viewPos);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    // Complex transparent surfaces require mutiple passes.
    // First the multiply pass tints the background color, simulating
    // light passing through the surface, and then the add layer
    // adds new color to the backbuffer to simulate light bouncing off
    // the surface.

    // TODO: Optimise this system.
    // After depth sorting, we should split the items into 2 groups.
    // Multipy items, and Add  items. (Many items will be in both)
    // Then we can simply check if we have any multiply items here
    // before rendering all items.

    renderstate.pass = 'MULTIPLY';
    gl.blendFunc(gl.DST_COLOR, gl.ZERO); // For multiply, select this.
    this._drawItems(renderstate);

    renderstate.pass = 'ADD';
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add
    this._drawItems(renderstate);

    gl.disable(gl.BLEND);
  }
}

GLRenderer.registerPass(GLTransparentGeomsPass, PassType.TRANSPARENT);

export { GLTransparentGeomsPass };
