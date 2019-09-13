import { Vec2 } from '../../../Math/Vec2';
import { Vec3 } from '../../../Math/Vec3';
import { Mesh } from '../Mesh.js';

class Torus extends Mesh {
  constructor(innerRadius = 0.5, outerRadius = 1.0, detail = 32) {
    super();

    if (isNaN(innerRadius) || isNaN(outerRadius) || isNaN(detail))
      throw 'Invalid geom args';

    this.__innerRadius = innerRadius;
    this.__outerRadius = outerRadius;
    this.__detail = detail >= 3 ? detail : 3;

    this.addVertexAttribute('texCoords', Vec2);
    this.addVertexAttribute('normals', Vec3);
    this.__rebuild();
  }

  get innerRadius() {
    return this.__innerRadius;
  }

  set innerRadius(val) {
    this.__innerRadius = val;
    this.__resize();
  }

  get outerRadius() {
    return this.__outerRadius;
  }

  set outerRadius(val) {
    this.__outerRadius = val;
    this.__resize();
  }

  get detail() {
    return this.__detail;
  }

  set detail(val) {
    this.__detail = val >= 3 ? val : 3;
    this.__rebuild();
  }

  __rebuild() {
    const nbSlices = this.__detail;
    const nbLoops = this.__detail * 2;
    const numVertices = nbSlices * nbLoops;

    this.setNumVertices(numVertices);
    this.setFaceCounts([0, nbSlices * nbLoops]);

    // ////////////////////////////
    // Set Vertex Positions

    const normals = this.getVertexAttribute('normals');
    let vertex = 0;
    for (let i = 0; i < nbLoops; i++) {
      const theta = (i / nbLoops) * 2.0 * Math.PI;
      const ctheta = Math.cos(theta);
      const stheta = Math.sin(theta);

      for (let j = 0; j < nbSlices; j++) {
        const phi = (j / nbSlices) * 2.0 * Math.PI;

        const sphi = Math.sin(phi);
        const cphi = Math.cos(phi);
        const d = this.__outerRadius + cphi * this.__innerRadius;

        // Set positions and normals at the same time.
        this.getVertex(vertex).set(
          ctheta * d,
          stheta * d,
          this.__innerRadius * sphi
        );
        normals.getValueRef(vertex).set(ctheta * cphi, stheta * cphi, sphi);
        vertex++;
      }
    }

    // ////////////////////////////
    // build the topology and texCoords
    const texCoords = this.getVertexAttribute('texCoords');
    let faceIndex = 0;
    for (let i = 0; i < nbLoops; i++) {
      for (let j = 0; j < nbSlices; j++) {
        const ip = (i + 1) % nbLoops;
        const jp = (j + 1) % nbSlices;
        const v0 = nbSlices * i + j;
        const v1 = nbSlices * i + jp;
        const v2 = nbSlices * ip + jp;
        const v3 = nbSlices * ip + j;
        this.setFaceVertexIndices(faceIndex, v0, v1, v2, v3);

        texCoords.setFaceVertexValue(
          faceIndex,
          0,
          new Vec2(i / nbLoops, j / nbLoops)
        );
        texCoords.setFaceVertexValue(
          faceIndex,
          1,
          new Vec2(i / nbLoops, (j + 1) / nbLoops)
        );
        texCoords.setFaceVertexValue(
          faceIndex,
          2,
          new Vec2((i + 1) / nbLoops, (j + 1) / nbLoops)
        );
        texCoords.setFaceVertexValue(
          faceIndex,
          3,
          new Vec2((i + 1) / nbLoops, j / nbLoops)
        );
        faceIndex++;
      }
    }

    this.setBoundingBoxDirty();
  }

  __resize() {
    const nbSlices = this.__detail;
    const nbLoops = this.__detail * 2;
    const numVertices = nbSlices * nbLoops;

    // ////////////////////////////
    // Set Vertex Positions

    const normals = this.getVertexAttribute('normals');
    const vertex = 0;
    for (let i = 0; i < nbLoops; i++) {
      const theta = (i / nbLoops) * 2.0 * Math.PI;
      const ctheta = Math.cos(theta);
      const stheta = Math.sin(theta);

      for (let j = 0; j < nbSlices; j++) {
        const phi = (j / nbSlices) * 2.0 * Math.PI;

        const sphi = Math.sin(phi);
        const cphi = Math.cos(phi);
        const d = this.__outerRadius + cphi * this.__innerRadius;

        // Set positions and normals at the same time.
        this.getVertex(vertex).set(
          ctheta * d,
          stheta * d,
          this.__innerRadius * sphi
        );
        index++;
      }
    }

    this.setBoundingBoxDirty();
  }

  toJSON() {
    const json = super.toJSON();
    json['x'] = this.__x;
    json['y'] = this.__y;
    json['z'] = this.__z;
    return json;
  }
}

export { Torus };
// export default Torus;
