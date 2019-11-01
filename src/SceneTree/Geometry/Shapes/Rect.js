import { Lines } from '../Lines.js';
import { NumberParameter } from '../../Parameters/NumberParameter.js';
import { sgFactory } from '../../SGFactory.js';

/** A class for generating a rectangle shape.
 * @extends Lines
 */
class Rect extends Lines {
  /**
   * Create a rect.
   * @param {number} x - The length of the rect along the X axis.
   * @param {number} y - The length of the rect along the Y axis.
   */
  constructor(x = 1.0, y = 1.0) {
    super();

    if (isNaN(x) || isNaN(y)) throw new Error('Invalid geom args');

    this.__x = this.addParameter(new NumberParameter('x', x));
    this.__x.valueChanged.connect(this.__resize.bind(this));
    this.__y = this.addParameter(new NumberParameter('y', y));
    this.__y.valueChanged.connect(this.__resize.bind(this));
    this.__rebuild();
  }

  /**
   * Getter for the length of the rect along the X axis.
   * @return {number} - Returns the length.
   */
  get x() {
    return this.__x.getValue();
  }

  /**
   * Setter for the length of the rect along the X axis.
   * @param {number} val - The length along the X axis.
   */
  set x(val) {
    this.__x.setValue(val);
  }

  /**
   * Getter for the length of the rect along the Y axis.
   * @return {number} - Returns the length.
   */
  get y() {
    return this.__y.getValue();
  }

  /**
   * Setter for the length of the rect along the U axis.
   * @param {number} val - The length along the Y axis.
   */
  set y(val) {
    this.__y.setValue(val);
  }

  /**
   * Setter for the size of the rect.
   * @param {number} x - The length along the X axis.
   * @param {number} y - The length along the Y axis.
   */
  setSize(x, y) {
    this.__x.setValue(x, -1);
    this.__y.setValue(y, -1);
    this.__resize();
  }

  /**
   * The __rebuild method.
   * @private
   */
  __rebuild() {
    this.setNumVertices(4);
    this.setNumSegments(4);
    this.setSegment(0, 0, 1);
    this.setSegment(1, 1, 2);
    this.setSegment(2, 2, 3);
    this.setSegment(3, 3, 0);
    this.__resize(-1);
    this.geomDataTopologyChanged.emit();
  }

  /**
   * The __resize method.
   * @param {number} mode - The mode value.
   * @private
   */
  __resize(mode) {
    const x = this.__x.getValue();
    const y = this.__y.getValue();

    this.getVertex(0).set(-0.5 * x, -0.5 * y, 0.0);
    this.getVertex(1).set(0.5 * x, -0.5 * y, 0.0);
    this.getVertex(2).set(0.5 * x, 0.5 * y, 0.0);
    this.getVertex(3).set(-0.5 * x, 0.5 * y, 0.0);
    this.setBoundingBoxDirty();
    if (mode != -1) this.geomDataChanged.emit();
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @return {object} - Returns the json object.
   */
  toJSON() {
    const json = super.toJSON();
    json['x'] = this.__x;
    json['y'] = this.__y;
    return json;
  }
}
sgFactory.registerClass('Rect', Rect);

export { Rect };
