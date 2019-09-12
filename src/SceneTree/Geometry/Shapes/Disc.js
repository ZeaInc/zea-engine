import { Vec2 } from '../../../Math/Vec2';
import { Vec3 } from '../../../Math/Vec3';
import { Mesh } from '../Mesh.js';

import { BooleanParameter, NumberParameter } from '../../Parameters';
import { sgFactory } from '../../SGFactory.js';

class Disc extends Mesh {
  constructor(radius = 0.5, sides = 32) {
    super();

    if (isNaN(radius) || isNaN(sides)) throw 'Invalid geom args';

    this.__radiusParam = this.addParameter(
      new NumberParameter('radius', radius)
    );
    this.__sidesParam = this.addParameter(
      new NumberParameter('sides', sides >= 3 ? sides : 3, [3, 200], 1)
    );

    this.addVertexAttribute('texCoords', Vec2);
    this.addVertexAttribute('normals', Vec3);
    this.__rebuild();
  }

  get radius() {
    return this.__radius;
  }

  set radius(val) {
    this.__radius = val;
    this.__resize();
  }

  set sides(val) {
    this.__sides = val >= 3 ? val : 3;
    this.__rebuild();
  }

  __rebuild() {
    const nbSides = this.__sidesParam.getValue();

    this.setNumVertices(nbSides + 1);
    this.setFaceCounts([nbSides]);

    // ////////////////////////////
    // Set Vertex Positions
    this.getVertex(0).set(0.0, 0.0, 0.0);

    // ////////////////////////////
    // build the topology
    for (let j = 0; j < nbSides; j++) {
      const v1 = (j % nbSides) + 1;
      const v2 = ((j + 1) % nbSides) + 1;
      this.setFaceVertexIndices(j, 0, v1, v2);
    }

    // ////////////////////////////
    // setNormals
    const normals = this.getVertexAttribute('normals');
    // Now set the attrbute values
    const normal = new Vec3(0, 0, 1);
    normals.setValue(0, normal);
    for (let i = 0; i < nbSides; i++) {
      normals.setValue(i + 1, normal);
    }

    // ////////////////////////////
    // setUVs
    const texCoords = this.getVertexAttribute('texCoords');
    texCoords.getValueRef(0).set(0.5, 0.5);
    for (let i = 0; i < nbSides; i++) {
      const phi = (i / nbSides) * 2.0 * Math.PI;
      texCoords
        .getValueRef(i + 1)
        .set(Math.sin(phi) * 0.5 + 0.5, Math.cos(phi) * 0.5 + 0.5);
    }

    this.setBoundingBoxDirty();
    this.__resize(-1);
  }

  __resize(mode) {
    const nbSides = this.__sidesParam.getValue();
    const radius = this.__radiusParam.getValue();
    for (let i = 0; i < nbSides; i++) {
      const phi = (i / nbSides) * 2.0 * Math.PI;
      this.getVertex(i + 1).set(
        Math.sin(phi) * radius,
        Math.cos(phi) * radius,
        0.0
      );
    }
    this.setBoundingBoxDirty();
  }

  toJSON() {
    const json = super.toJSON();
    json['radius'] = this.__radius;
    return json;
  }
}

sgFactory.registerClass('Disc', Disc);

export { Disc };
