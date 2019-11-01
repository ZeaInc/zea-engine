import { BaseGeom, SAVE_FLAG_SKIP_GEOMDATA } from './BaseGeom.js';

/** Class representing lines.
 * @extends BaseGeom
 */
class Lines extends BaseGeom {
  /**
   * Create lines.
   */
  constructor() {
    super();
    this.__indices = new Uint32Array();
    this.__segmentAttributes = new Map();
    this.lineThickness = 0.0;
  }

  /**
   * The getIndices method.
   * @return {any} - The return value.
   */
  getIndices() {
    return this.__indices;
  }

  /**
   * Getter for the number of segments.
   * @return {number} - Returns the number of segments.
   */
  getNumSegments() {
    return this.__indices.length / 2;
  }

  /**
   * Getter for the number of segments.
   * @param {number} count - The count value.
   */
  setNumSegments(count) {
    const indices = new Uint32Array(count * 2);
    // indices.set(this.__indices)
    // for (let i=0;i<this.__indices.length; i++) {
    //     indices[i] = this.__indices[i];
    // }
    this.__indices = indices;
  }

  /**
   * The setSegment method.
   * @param {number} index - The index value.
   * @param {any} p0 - The p0 value.
   * @param {any} p1 - The p1 value.
   */
  setSegment(index, p0, p1) {
    if (index >= this.__indices.length / 2)
      throw new Error(
        'Invalid line index:' +
          index +
          '. Num Segments:' +
          this.__indices.length / 2
      );
    this.__indices[index * 2 + 0] = p0;
    this.__indices[index * 2 + 1] = p1;
  }

  /**
   * The getSegmentVertexIndex method.
   * @param {any} line - The line value.
   * @param {any} linevertex - The linevertex value.
   * @return {any} - The return value.
   */
  getSegmentVertexIndex(line, linevertex) {
    const numLines = this.numLines;
    if (line < numLines) return this.__indices[line * 2 + linevertex];
  }

  /**
   * The addSegmentAttribute method.
   * @param {string} name - The name value.
   * @param {any} dataType - The dataType value.
   * @param {number} count - The count value.
   * @return {any} - The return value.
   */
  addSegmentAttribute(name, dataType, count = undefined) {
    const attr = new Attribute(
      dataType,
      count != undefined ? count : this.polygonCount
    );
    this.__segmentAttributes.set(name, attr);
    return attr;
  }

  /**
   * The hasSegmentAttribute method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  hasSegmentAttribute(name) {
    return this.__segmentAttributes.has(name);
  }

  /**
   * The getSegmentAttribute method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  getSegmentAttribute(name) {
    return this.__segmentAttributes.get(name);
  }

  // ////////////////////////////////////////
  // Memory

  /**
   * The genBuffers method.
   * @return {any} - The return value.
   */
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

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (!(flags & SAVE_FLAG_SKIP_GEOMDATA)) {
      j.indices = Array.from(this.__indices);
    }
    return j;
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    this.__indices = Uint32Array.from(j.indices);
  }
}

export { Lines };
