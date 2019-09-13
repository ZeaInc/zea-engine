import { Signal } from '../Utilities';
import { BaseItem } from '../SceneTree';
import { MaterialShaderBinding } from './MaterialShaderBinding.js';

class GLMaterial /* extends BaseItem why do we inherit base item here?*/ {
  constructor(gl, material, glshader) {
    // super(name);
    this.__gl = gl;
    this.__material = material;
    this.__glshader = glshader;

    this.updated = new Signal();
    this.destructing = new Signal();

    this.__material.destructing.connect(() => {
      this.destructing.emit(this); // Note: propagate this signal so the GLPass can remove the item.
    });

    this.__shaderBindings = {};
  }

  getMaterial() {
    return this.__material;
  }

  getGLShader() {
    return this.__glshader;
  }

  generateShaderBinding() {
    const params = this.__material.getParameters();
    for (const param of params) {
      bindParam(gl, param);
    }
  }

  bind(renderstate, warnMissingUnifs) {
    // console.log("Material:" + this.__material.getName());
    this.__boundTexturesBeforeMaterial = renderstate.boundTextures;

    let shaderBinding = this.__shaderBindings[renderstate.shaderkey];
    if (!shaderBinding) {
      const gl = this.__gl;
      shaderBinding = new MaterialShaderBinding(
        gl,
        this,
        renderstate.unifs,
        warnMissingUnifs
      );
      this.__shaderBindings[renderstate.shaderkey] = shaderBinding;
    }
    return shaderBinding.bind(renderstate);

    return true;
  }

  unbind(renderstate) {
    // Enable texture units to be re-used by resetting the count back
    // to what it was.
    renderstate.boundTextures = this.__boundTexturesBeforeMaterial;
  }
}

export { GLMaterial };
// export default GLMaterial;
