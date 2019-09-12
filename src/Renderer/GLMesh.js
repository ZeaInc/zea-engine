import { Vec3 } from '../Math/Vec3';
import { GLGeom } from './GLGeom.js';
import '../SceneTree/Geometry/Mesh.js';

class GLMesh extends GLGeom {
  constructor(gl, mesh) {
    super(gl, mesh);
    this.genBuffers();
  }

  getNumTriangles() {
    return this.__numTriangles;
  }

  // /////////////////////////////////////
  // Buffers

  genBuffers() {
    super.genBuffers();

    const gl = this.__gl;

    const geomBuffers = this.__geom.genBuffers();
    const indices = geomBuffers.indices;
    this.__numTriIndices = geomBuffers.indices.length;
    if (indices instanceof Uint8Array)
      this.__indexDataType = this.__gl.UNSIGNED_BYTE;
    if (indices instanceof Uint16Array)
      this.__indexDataType = this.__gl.UNSIGNED_SHORT;
    if (indices instanceof Uint32Array)
      this.__indexDataType = this.__gl.UNSIGNED_INT;

    this.__numTriangles = indices.length / 3;
    this.__numRenderVerts = geomBuffers.numRenderVerts;

    this.__indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geomBuffers.indices, gl.STATIC_DRAW);

    // Create some vertex attribute buffers
    // const debugAttrValues = false;
    // let maxIndex;
    // if (debugAttrValues)
    //   maxIndex = Math.max(...indices);
    for (const attrName in geomBuffers.attrBuffers) {
      const attrData = geomBuffers.attrBuffers[attrName];

      const attrBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW);

      this.__glattrbuffers[attrName] = {
        buffer: attrBuffer,
        dimension: attrData.dimension,
        normalized: attrData.normalized,
      };

      if (attrName == 'textureCoords')
        this.__glattrbuffers['texCoords'] = this.__glattrbuffers[
          'textureCoords'
        ];
    }
  }

  updateBuffers(opts) {
    const gl = this.__gl;

    const geomBuffers = this.__geom.genBuffers({ includeIndices: false });
    for (const attrName in geomBuffers.attrBuffers) {
      const attrData = geomBuffers.attrBuffers[attrName];
      const glattr = this.__glattrbuffers[attrName];
      gl.bindBuffer(gl.ARRAY_BUFFER, glattr.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW);
    }
  }

  getNumUnSplitVerts() {
    return this.__geom.vertices.length;
  }

  getNumSplitVerts() {
    return this.__numRenderVerts;
  }

  // ////////////////////////////////
  // Wireframes

  generateWireframesVAO() {
    if (!this.__vao) return false;

    if (!this.__geom.edgeVerts) this.__geom.genTopologyInfo();

    // generate the wireframes VAO.
    // It can share buffers with the regular VAO, but provide a different index buffer.
    if (this.__wireframesVao)
      this.__ext.deleteVertexArrayOES(this.__wireframesVao);
    this.__wireframesVao = this.__ext.createVertexArrayOES();
    this.__ext.bindVertexArrayOES(this.__wireframesVao);

    const gl = this.__gl;
    const wireframeIndexBuffer = gl.createBuffer();
    const wireframeIndices = Uint32Array.from(this.__geom.edgeVerts);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireframeIndices, gl.STATIC_DRAW);

    const positionsBuffer = this.__glattrbuffers['positions'].buffer;
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

    this.__numWireIndices = wireframeIndices.length;
    this.__ext.bindVertexArrayOES(null); // Note: is this necessary?
  }

  bindWireframeVAO(renderstate) {
    if (this.__wireframesVao == undefined) return false;
    this.__ext.bindVertexArrayOES(this.__wireframesVao);
    return true;
  }

  unbindWireframeVAO() {
    this.__ext.bindVertexArrayOES(null); // Note: is this necessary?
  }

  // Draw an item to screen.
  drawWireframe() {
    if (this.__wireframesVao)
      this.__gl.drawElements(
        this.__gl.LINES,
        this.__numWireIndices,
        this.__gl.UNSIGNED_INT,
        0
      );
  }

  // ////////////////////////////////
  // Hard Edges

  generateHardEdgesVAO() {
    if (!this.__vao) return false;

    if (!this.__geom.edgeVerts) this.__geom.generateHardEdgesFlags();

    // generate the wireframes VAO.
    // It can share buffers with the regular VAO, but provide a different index buffer.
    if (this.__hardEdgesVao)
      this.__ext.deleteVertexArrayOES(this.__hardEdgesVao);
    this.__hardEdgesVao = this.__ext.createVertexArrayOES();
    this.__ext.bindVertexArrayOES(this.__hardEdgesVao);

    const gl = this.__gl;
    const hardEdgeIndexBuffer = gl.createBuffer();
    const hardEdgeIndices = Uint32Array.from(
      this.__geom.computeHardEdgesIndices()
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hardEdgeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, hardEdgeIndices, gl.STATIC_DRAW);

    const positionsBuffer = this.__glattrbuffers['positions'].buffer;
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

    this.__numEdgeIndices = hardEdgeIndices.length;
    this.__ext.bindVertexArrayOES(null); // Note: is this necessary?
  }

  bindHardEdgesVAO(renderstate) {
    if (this.__hardEdgesVao == undefined) return false;
    this.__ext.bindVertexArrayOES(this.__hardEdgesVao);
    return true;
  }

  unbindHardEdgesVAO() {
    this.__ext.bindVertexArrayOES(null); // Note: is this necessary?
  }

  // Draw an item to screen.
  drawHardEdges() {
    if (this.__hardEdgesVao)
      this.__gl.drawElements(
        this.__gl.LINES,
        this.__numEdgeIndices,
        this.__gl.UNSIGNED_INT,
        0
      );
  }

  // ////////////////////////////////
  // Drawing Mesh Points.

  drawPoints() {
    this.__gl.drawArrays(this.__gl.POINTS, 0, this.__geom.numVertices());
  }

  // ////////////////////////////////
  // Regular Drawing.

  // Draw an item to screen.
  draw() {
    this.__gl.drawElements(
      this.__gl.TRIANGLES,
      this.__numTriIndices,
      this.__indexDataType,
      0
    );
  }

  drawInstanced(instanceCount) {
    this.__gl.drawElementsInstanced(
      this.__gl.TRIANGLES,
      this.__numTriIndices,
      this.__indexDataType,
      0,
      instanceCount
    );
  }

  destroy() {
    super.destroy();
    const gl = this.__gl;
    gl.deleteBuffer(this.__indexBuffer);
    this.__indexBuffer = undefined;
    // if (this.__wireframesVao)
    //     gl.deleteVertexArray(this.__wireframesVao);
    // if (this.__hardEdgesVao)
    //     gl.deleteVertexArray(this.__hardEdgesVao);
  }
}

export { GLMesh };
// export default GLMesh;
