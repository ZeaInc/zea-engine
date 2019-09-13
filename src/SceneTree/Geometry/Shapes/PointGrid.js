import { Vec2 } from '../../../Math/Vec2';
import { Vec3 } from '../../../Math/Vec3';
import { Points } from '../Points.js';

class PointGrid extends Points {
  constructor(
    x = 1.0,
    y = 1.0,
    xDivisions = 1,
    yDivisions = 1,
    addTextureCoords = false
  ) {
    super();

    if (isNaN(x) || isNaN(y) || isNaN(xDivisions) || isNaN(yDivisions))
      throw 'Invalid geom args';

    this.__x = x;
    this.__y = y;
    this.__xDivisions = xDivisions;
    this.__yDivisions = yDivisions;
    if (addTextureCoords) this.addVertexAttribute('texCoords', Vec2);
    this.__rebuild();
  }

  get x() {
    console.warn("getter is deprectated. Please use 'getX'");
    return this.getX();
  }

  set x(val) {
    console.warn("getter is deprectated. Please use 'setX'");
    this.setX(val);
  }

  get y() {
    console.warn("getter is deprectated. Please use 'getY'");
    return this.getY();
  }

  set y(val) {
    console.warn("getter is deprectated. Please use 'setY'");
    this.setY(val);
  }

  getX() {
    return this.__x;
  }

  setX(val) {
    this.__x = val;
    this.__resize();
  }

  getY() {
    return this.__y;
  }

  setY(val) {
    this.__y = val;
    this.__resize();
  }

  setSize(x, y) {
    this.__x = x;
    this.__y = y;
    this.__resize();
  }

  __rebuild() {
    this.setNumVertices(this.__xDivisions * this.__yDivisions);

    const texCoords = this.getVertexAttribute('texCoords');
    if (texCoords) {
      for (let i = 0; i < this.__yDivisions; i++) {
        const y = i / (this.__yDivisions - 1);
        for (let j = 0; j < this.__xDivisions; j++) {
          const x = j / (this.__xDivisions - 1);
          texCoords.getValueRef(i * this.__xDivisions + j).set(x, y);
        }
      }
    }

    this.__resize();
  }

  __resize() {
    for (let i = 0; i < this.__yDivisions; i++) {
      const y = (i / (this.__yDivisions - 1) - 0.5) * this.__y;
      for (let j = 0; j < this.__xDivisions; j++) {
        const x = (j / (this.__xDivisions - 1) - 0.5) * this.__x;
        this.getVertex(i * this.__xDivisions + j).set(x, y, 0.0);
      }
    }
    this.setBoundingBoxDirty();
  }

  toJSON() {
    const json = super.toJSON();
    json['x'] = this.__x;
    json['y'] = this.__y;
    json['xDivisions'] = this.__xDivisions;
    json['yDivisions'] = this.__yDivisions;
    return json;
  }
}

export { PointGrid };
// export default PointGrid;
