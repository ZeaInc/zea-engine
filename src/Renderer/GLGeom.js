import { Signal } from '../Utilities';
import { generateShaderGeomBinding } from './GeomShaderBinding.js';

class GLGeom {
  constructor(gl, geom) {
    this.__gl = gl;
    this.__geom = geom;
    this.__glattrs = {};

    this.__glattrbuffers = {};
    this.__shaderBindings = {};
    this.destructing = new Signal();
    this.updated = new Signal();

    const updateBuffers = opts => {
      this.updateBuffers(opts);
      this.updated.emit();
    };
    this.__geom.geomDataChanged.connect(updateBuffers);

    const regenBuffers = opts => {
      this.clearShaderBindings();
      this.updateBuffers(opts);
      this.updated.emit();
    };
    this.__geom.geomDataTopologyChanged.connect(regenBuffers);

    this.__geom.destructing.connect(() => {
      this.destroy();
    });
  }

  getGeom() {
    return this.__geom;
  }

  // /////////////////////////////////////
  // Buffers

  genBuffers() {}

  updateBuffers(opts) {}

  // /////////////////////////////////////
  // Binding

  bind(renderstate) {
    if (this.__destroyed) throw 'Error binding a destroyed geom';

    let shaderBinding = this.__shaderBindings[renderstate.shaderkey];
    if (!shaderBinding) {
      const gl = this.__gl;
      shaderBinding = generateShaderGeomBinding(
        gl,
        renderstate.attrs,
        this.__glattrbuffers,
        this.__indexBuffer
      );
      this.__shaderBindings[renderstate.shaderkey] = shaderBinding;
    }
    shaderBinding.bind(renderstate);
    return true;
  }

  unbind(renderstate) {
    // Unbinding a geom is important as it puts back some important
    // GL state. (vertexAttribDivisor)
    const shaderBinding = this.__shaderBindings[renderstate.shaderkey];
    if (shaderBinding) {
      shaderBinding.unbind(renderstate);
    }
  }

  // /////////////////////////////////////
  // Drawing
  // Draw an item to screen.
  draw() {
    throw 'Not implemented. Implement this method in a derived class.';
  }

  drawInstanced(instanceCount) {
    throw 'Not implemented. Implement this method in a derived class.';
  }

  bindAndDraw(renderstate) {
    this.bind(renderstate);
    this.draw(renderstate);
  }

  clearShaderBindings() {
    for (const shaderkey in this.__shaderBindings) {
      const shaderBinding = this.__shaderBindings[shaderkey];
      shaderBinding.destroy();
    }
    this.__shaderBindings = {};
  }

  destroy() {
    this.__geom.deleteMetadata('glgeom');

    this.clearShaderBindings();

    const gl = this.__gl;
    for (const attrName in this.__glattrbuffers) {
      gl.deleteBuffer(this.__glattrbuffers[attrName].buffer);
    }
    this.__glattrs = {};

    this.__shaderBindings = {};
    this.__destroyed = true;
    this.destructing.emit(this);
  }
}

export { GLGeom };
// export default GLGeom;
