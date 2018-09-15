import { Vec3 } from '../../Math/Vec3';
import { Ray } from '../../Math/Ray';
import { Cuboid } from '../../SceneTree/Geometry/Shapes/Cuboid';
import { TreeItem } from '../../SceneTree/TreeItem';
import { GeomItem } from '../../SceneTree/GeomItem';
import { GLMesh } from '../GLMesh.js';
import { GLGeomItem } from '../GLGeomItem.js';
import { Gizmo } from './Gizmo.js';

class PlanarTranslationGizmo extends Gizmo {
    constructor(gl, context, name, color, xfo) {
        super(color);

        this.__context = context;
        this.__treeItem = new TreeItem('PlanarTranslationGizmo'+name);
        this.__treeItem.setLocalXfo(xfo);
        context.treeItem.addChild(this.__treeItem);

        let geom = new Cuboid(0.2, 0.02, 0.2);
        geom.moveVertices(new Vec3(0.5,0.0,0.5));
        let geomItem = new GeomItem('tail', geom);
        let geomglGeom = new GLMesh(gl, geom);
        let geomglGeomItem = new GLGeomItem(gl, geomItem, geomglGeom);

        this.__treeItem.addChild(geomItem);

        this.__addDrawItem(geomglGeomItem);

        this.__setProxyItem(geomglGeomItem);
    };

    onDragStart(event, mousePos, viewport) {

        this.manipRay = new Ray(this.__treeItem.getGlobalXfo().tr, this.__treeItem.getGlobalXfo().ori.getYaxis());
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);

        let dist = mouseRay.intersectRayPlane(this.manipRay);
        this.__mouseDownPos = mouseRay.start.add(mouseRay.dir.scale(dist));
        this.__context.beginManipulation();
    };

    onDrag(event, mousePos, viewport) {
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);
        let dist = mouseRay.intersectRayPlane(this.manipRay);
        let intersectionPos = mouseRay.start.add(mouseRay.dir.scale(dist));

        let delta = intersectionPos.subtract(this.__mouseDownPos);
        this.__context.translate(delta);
    };

    onDragEnd(event, mousePos, viewport) {
        this.__context.endManipulation();
    };

};

export {
    PlanarTranslationGizmo
};
// export default PlanarTranslationGizmo;