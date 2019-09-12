import { BaseGeom, SAVE_FLAG_SKIP_GEOMDATA } from './BaseGeom.js';

class Lines extends BaseGeom {
  constructor() {
    super();
    this.__indices = new Uint32Array();
    this.__segmentAttributes = new Map();
    this.lineThickness = 0.0;
  }

  getIndices() {
    return this.__indices;
  }

  getNumSegments() {
    return this.__indices.length / 2;
  }

  setNumSegments(count) {
    const indices = new Uint32Array(count * 2);
    // indices.set(this.__indices)
    // for (let i=0;i<this.__indices.length; i++) {
    //     indices[i] = this.__indices[i];
    // }
    this.__indices = indices;
  }

  setSegment(index, p0, p1) {
    if (index >= this.__indices.length / 2)
      throw 'Invalid line index:' +
        index +
        '. Num Segments:' +
        this.__indices.length / 2;
    this.__indices[index * 2 + 0] = p0;
    this.__indices[index * 2 + 1] = p1;
  }

  getSegmentVertexIndex(line, linevertex) {
    const numLines = this.numLines;
    if (line < numLines) return this.__indices[line * 2 + linevertex];
  }

  addSegmentAttribute(name, dataType, count = undefined) {
    const attr = new Attribute(
      dataType,
      count != undefined ? count : this.polygonCount
    );
    this.__segmentAttributes.set(name, attr);
    return attr;
  }

  hasSegmentAttribute(name) {
    return this.__segmentAttributes.has(name);
  }

  getSegmentAttribute(name) {
    return this.__segmentAttributes.get(name);
  }

  // ////////////////////////////////////////
  // Memory

  genBuffers() {
    const buffers = super.genBuffers();

    let indices;
    if (buffers.numVertices < Math.pow(2, 8)) {
      indices = new Uint8Array(this.__indices.length);
      this.__indices.forEach((value, index) => {
        indices[index] = value;
      });
    } else if (buffers.numVertices < Math.pow(2, 16)) {
      indices = new Uint16Array(this.__indices.length);
      this.__indices.forEach((value, index) => {
        indices[index] = value;
      });
    } else {
      indices = this.__indices;
    }
    buffers.indices = indices;
    return buffers;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (!(flags & SAVE_FLAG_SKIP_GEOMDATA)) {
      j.indices = Array.from(this.__indices);
    }
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    this.__indices = Uint32Array.from(j.indices);
  }
}

export { Lines };
// export default Lines;
