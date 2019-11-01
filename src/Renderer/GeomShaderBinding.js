/** Class representing a geom shader binding. */
class GeomShaderBinding {
  /**
   * Create a geom shader binding.
   * @param {any} gl - The gl value.
   * @param {any} shaderAttrs - The shader attributes.
   * @param {any} glattrbuffers - The glattrbuffers value.
   * @param {any} indexBuffer - The index buffer.
   */
  constructor(gl, shaderAttrs, glattrbuffers, indexBuffer) {
    this.__gl = gl;
    this.__shaderAttrs = shaderAttrs;
    this.__glattrbuffers = glattrbuffers;
    this.__indexBuffer = indexBuffer;
  }

  /**
   * The bind method.
   * @param {any} renderstate - The render state.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    const gl = this.__gl;

    for (const attrName in this.__shaderAttrs) {
      if (attrName == 'instancedIds') continue;
      const attrDesc = this.__shaderAttrs[attrName];
      const location = attrDesc.location;
      if (location == -1) continue;
      const glattrbuffer = this.__glattrbuffers[attrName];
      if (!glattrbuffer) {
        gl.disableVertexAttribArray(location);
        continue;
      }

      const dataType =
        glattrbuffer.dataType != undefined ? glattrbuffer.dataType : gl.FLOAT;
      const dimension = glattrbuffer.dimension;
      const stride = glattrbuffer.dimension * gl.sizeInBytes(dataType);
      const offset =
        glattrbuffer.offset != undefined
          ? glattrbuffer.offset * dimension * gl.sizeInBytes(dataType)
          : 0;
      const normalized = glattrbuffer.normalized == true;
      const instanced = attrDesc.instanced;

      gl.enableVertexAttribArray(location);
      gl.bindBuffer(gl.ARRAY_BUFFER, glattrbuffer.buffer);
      gl.vertexAttribPointer(
        location,
        dimension,
        dataType,
        normalized,
        stride,
        offset
      );

      if (gl.vertexAttribDivisor) {
        if (instanced == true) {
          gl.vertexAttribDivisor(location, 1); // This makes it instanced
        } else {
          gl.vertexAttribDivisor(location, 0); // This makes it not-instanced
        }
      }

      // console.log("Binding :" + attrName + " to attr:" + location + " count:" + glattrbuffer.count + " dimension:" + dimension  + " stride:" + stride  + " offset:" + offset + " normalized:" + normalized + " instanced:" + instanced);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);

    return true;
  }

  /**
   * The unbind method.
   */
  unbind() {
    const gl = this.__gl;
    for (const attrName in this.__shaderAttrs) {
      const attrDesc = this.__shaderAttrs[attrName];
      const location = attrDesc.location;
      if (location == -1) continue;
      gl.disableVertexAttribArray(location);
      gl.vertexAttribDivisor(location, 0); // This makes it not-instanced

      // console.log("Binding :" + attrName + " to attr:" + location + " count:" + glattrbuffer.count + " dimension:" + dimension  + " stride:" + stride  + " offset:" + offset + " normalized:" + normalized + " instanced:" + instanced);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {}
}

/** Class representing vertex array objects (VAO) geom shader binding. */
class VAOGeomShaderBinding {
  /**
   * Create VAO geom shader binding.
   * @param {any} gl - The gl value.
   * @param {any} shaderAttrs - The shaderAttrs value.
   * @param {any} glattrbuffers - The glattrbuffers value.
   * @param {any} indexBuffer - The indexBuffer value.
   */
  constructor(gl, shaderAttrs, glattrbuffers, indexBuffer) {
    this.__gl = gl;
    this.__vao = gl.createVertexArray();
    gl.bindVertexArray(this.__vao);

    for (const attrName in shaderAttrs) {
      if (attrName == 'instancedIds') continue;

      const attrDesc = shaderAttrs[attrName];
      const location = attrDesc.location;
      if (location == -1) continue;
      const glattrbuffer = glattrbuffers[attrName];
      if (!glattrbuffer) {
        // console.warn("glattrbuffer missing:" + attrName + " location:" + location);
        gl.disableVertexAttribArray(location);
        continue;
      }

      const dataType =
        glattrbuffer.dataType != undefined ? glattrbuffer.dataType : gl.FLOAT;
      const dimension = glattrbuffer.dimension;
      const stride = glattrbuffer.dimension * gl.sizeInBytes(dataType);
      const offset =
        glattrbuffer.offset != undefined
          ? glattrbuffer.offset * dimension * gl.sizeInBytes(dataType)
          : 0;
      const normalized = glattrbuffer.normalized == true;
      const instanced = attrDesc.instanced;

      gl.enableVertexAttribArray(location);
      gl.bindBuffer(gl.ARRAY_BUFFER, glattrbuffer.buffer);
      gl.vertexAttribPointer(
        location,
        dimension,
        dataType,
        normalized,
        stride,
        offset
      );
      if (instanced) {
        gl.vertexAttribDivisor(location, 1); // This makes it instanced
      } else {
        gl.vertexAttribDivisor(location, 0); // This makes it not-instanced
      }

      // console.log("Binding :" + attrName + " to attr:" + location + " count:" + glattrbuffer.count + " dimension:" + dimension  + " stride:" + stride  + " offset:" + offset + " normalized:" + normalized + " instanced:" + instanced);
    }

    this.__indexBuffer = indexBuffer;
  }

  /**
   * The bind method.
   * @param {any} renderstate - The render state.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    this.__gl.bindVertexArray(this.__vao);
    if (this.__indexBuffer)
      this.__gl.bindBuffer(this.__gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
    return true;
  }

  /**
   * The unbind method.
   */
  unbind() {
    const gl = this.__gl;
    for (const attrName in this.__shaderAttrs) {
      const attrDesc = this.__shaderAttrs[attrName];
      const location = attrDesc.location;
      if (location == -1) continue;
      gl.disableVertexAttribArray(location);
      gl.vertexAttribDivisor(location, 0); // This makes it not-instanced

      // console.log("Unbinding :" + attrName + " to attr:" + location + " count:" + glattrbuffer.count + " dimension:" + dimension  + " stride:" + stride  + " offset:" + offset + " normalized:" + normalized + " instanced:" + instanced);
    }

    this.__gl.bindVertexArray(null);
    if (this.__indexBuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    this.__gl.deleteVertexArray(this.__vao);
  }
}

function generateShaderGeomBinding(
  gl,
  shaderAttrs,
  glattrbuffers,
  indexBuffer
) {
  if (gl.createVertexArray == null) {
    return new GeomShaderBinding(gl, shaderAttrs, glattrbuffers, indexBuffer);
  } else {
    return new VAOGeomShaderBinding(
      gl,
      shaderAttrs,
      glattrbuffers,
      indexBuffer
    );
  }
}

export { generateShaderGeomBinding };
