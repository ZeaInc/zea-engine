import { Vec2 } from '../../../Math/Vec2';
import { Vec3 } from '../../../Math/Vec3';
import { Mesh } from '../Mesh.js';

/** A class for generating a plane geometry.
 * @extends Mesh
 */
class Plane extends Mesh {
  /**
   * Create a plane.
   * @param {number} x - The length of the plane along the X axis.
   * @param {number} y - The length of the plane along the Y axis.
   * @param {number} xDivisions - The number of divisions along the X axis.
   * @param {number} yDivisions - The number of divisions along the Y axis.
   * @param {boolean} addNormals - The addNormals value.
   * @param {boolean} addTextureCoords - The addTextureCoords value.
   */
  constructor(
    x = 1.0,
    y = 1.0,
    xDivisions = 1,
    yDivisions = 1,
    addNormals = true,
    addTextureCoords = true
  ) {
    super();

    if (isNaN(x) || isNaN(y) || isNaN(xDivisions) || isNaN(yDivisions))
      throw new Error('Invalid geom args');

    this.__x = x;
    this.__y = y;
    this.__xDivisions = xDivisions;
    this.__yDivisions = yDivisions;
    if (addNormals) this.addVertexAttribute('normals', Vec3);
    if (addTextureCoords) this.addVertexAttribute('texCoords', Vec2);
    this.__rebuild();
  }

  /**
   * Getter for x.
   * Is deprectated. Please use "getX".
   * @return {number} - Returns the length.
   */
  get x() {
    console.warn("getter is deprectated. Please use 'getX'");
    return this.getX();
  }

  /**
   * Setter for x.
   * Is deprectated. Please use "setX".
   * @param {number} val - The length along the X axis.
   */
  set x(val) {
    console.warn("getter is deprectated. Please use 'setX'");
    this.setX(val);
  }

  /**
   * Getter for y.
   * Is deprectated. Please use "getY".
   * @return {number} - Returns the length.
   */
  get y() {
    console.warn("getter is deprectated. Please use 'getY'");
    return this.getY();
  }

  /**
   * Setter for y.
   * Is deprectated. Please use "setY".
   * @param {number} val - The length along the Y axis.
   */
  set y(val) {
    console.warn("getter is deprectated. Please use 'setY'");
    this.setY(val);
  }

  /**
   * Getter for the length of the plane along the X axis.
   * @return {number} - Returns the length.
   */
  getX() {
    return this.__x;
  }

  /**
   * Setter for the length of the plane along the X axis.
   * @param {number} val - The length along the X axis.
   */
  setX(val) {
    this.__x = val;
    this.__resize();
  }

  /**
   * Getter for the length of the plane along the Y axis.
   * @return {number} - Returns the length.
   */
  getY() {
    return this.__y;
  }

  /**
   * Setter for the length of the plane along the Y axis.
   * @param {number} val - The length along the Y axis.
   */
  setY(val) {
    this.__y = val;
    this.__resize();
  }

  /**
   * Setter for the size of the plane.
   * @param {number} x - The length along the X axis.
   * @param {number} y - The length along the Z axis.
   */
  setSize(x, y) {
    this.__x = x;
    this.__y = y;
    this.__resize();
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    this.setNumVertices((this.__xDivisions + 1) * (this.__yDivisions + 1));
    this.setFaceCounts([0, this.__xDivisions * this.__yDivisions]);

    let quadId = 0;
    for (let i = 0; i < this.__yDivisions; i++) {
      for (let j = 0; j < this.__xDivisions; j++) {
        const v0 = (this.__xDivisions + 1) * (i + 1) + j;
        const v1 = (this.__xDivisions + 1) * (i + 1) + (j + 1);
        const v2 = (this.__xDivisions + 1) * i + (j + 1);
        const v3 = (this.__xDivisions + 1) * i + j;
        this.setFaceVertexIndices(quadId, v0, v1, v2, v3);
        quadId = quadId + 1;
      }
    }

    let voff = 0;
    const normals = this.getVertexAttribute('normals');
    if (normals) {
      for (let i = 0; i <= this.__yDivisions; i++) {
        for (let j = 0; j <= this.__xDivisions; j++) {
          normals.getValueRef(voff).set(0, 0, 1);
          voff++;
        }
      }
    }

    voff = 0;
    const texCoords = this.getVertexAttribute('texCoords');
    if (texCoords) {
      for (let i = 0; i <= this.__yDivisions; i++) {
        const y = i / this.__yDivisions;
        for (let j = 0; j <= this.__xDivisions; j++) {
          const x = j / this.__xDivisions;
          texCoords.getValueRef(voff).set(x, y);
          voff++;
        }
      }
    }

    this.__resize();
  }

  /**
   * The __resize method.
   * @private
   */
  __resize() {
    let voff = 0;
    for (let i = 0; i <= this.__yDivisions; i++) {
      const y = (i / this.__yDivisions - 0.5) * this.__y;
      for (let j = 0; j <= this.__xDivisions; j++) {
        const x = (j / this.__xDivisions - 0.5) * this.__x;
        this.getVertex(voff).set(x, y, 0.0);
        voff++;
      }
    }

    this.setBoundingBoxDirty();
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @return {object} - Returns the json object.
   */
  toJSON() {
    const json = super.toJSON();
    json['x'] = this.__x;
    json['y'] = this.__y;
    json['xDivisions'] = this.__xDivisions;
    json['yDivisions'] = this.__yDivisions;
    return json;
  }
}

export { Plane };
