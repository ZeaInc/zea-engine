import { Vec3 } from '../../Math/Vec3';
import { Cuboid } from '../../SceneTree/Geometry/Shapes/Cuboid';
import { Cone } from '../../SceneTree/Geometry/Shapes/Cone';
import { TreeItem } from '../../SceneTree/TreeItem';
import { GeomItem } from '../../SceneTree/GeomItem';
import { GLMesh } from '../GLMesh.js';
import { GLGeomItem } from '../GLGeomItem.js';
import { Gizmo } from './Gizmo.js';

class LinearTranslationGizmo extends Gizmo {
    constructor(gl, context, name, color, xfo) {
        super(color);

        this.__context = context;
        this.__treeItem = new TreeItem('LinearTranslationGizmo'+name);
        this.__treeItem.setLocalXfo(xfo);
        context.treeItem.addChild(this.__treeItem);

        let tailGeom = new Cuboid(0.02, 1.0, 0.02);
        tailGeom.moveVertices(new Vec3(0,0.7,0));
        let tailGeomItem = new GeomItem('tail', tailGeom);
        let tailGeomglGeom = new GLMesh(gl, tailGeom);
        let tailGeomglDrawItem = new GLGeomItem(gl, tailGeomItem, tailGeomglGeom);

        this.__treeItem.addChild(tailGeomItem);

        let headGeom = new Cone(0.07, 0.3, 24);
        headGeom.moveVertices(new Vec3(0,1.10,0));
        let headGeomItem = new GeomItem('head', headGeom);
        let headGeomglGeom = new GLMesh(gl, headGeom);
        let headGeomglDrawItem = new GLGeomItem(gl, headGeomItem, headGeomglGeom);

        this.__treeItem.addChild(headGeomItem);

        this.__addDrawItem(tailGeomglDrawItem);
        this.__addDrawItem(headGeomglDrawItem);

        // Generate the proxy geom that we use to render the data buffer. 
        let proxyGeom = new Cuboid(0.25, 1.3, 0.25);
        proxyGeom.moveVertices(new Vec3(0,0.65,0));
        let proxyGeomItem = new GeomItem('proxy', proxyGeom);
        let proxyGeomglGeom = new GLMesh(gl, proxyGeom);
        let proxyGeomglDrawItem = new GLGeomItem(gl, proxyGeomItem, proxyGeomglGeom);

        this.__treeItem.addChild(proxyGeomItem);

        // this.__addDrawItem(proxyGeomglDrawItem);
        this.__setProxyItem(proxyGeomglDrawItem);
    };

    onDragStart(event, mousePos, viewport) {

        this.manipRay = new Ray(this.__treeItem.getGlobalXfo().tr, this.__treeItem.getGlobalXfo().ori.getYaxis());
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);

        this.mouseDownDist = this.manipRay.intersectRayVector(mouseRay)[0];
        this.__context.beginManipulation();
    };

    onDrag(event, mousePos, viewport) {
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);

        let dist = this.manipRay.intersectRayVector(mouseRay)[0];
        let delta = (dist - this.mouseDownDist);
        this.__context.translate(this.manipRay.dir.scale(delta));
    };

    onDragEnd(event, mousePos, viewport) {
        this.__context.endManipulation();
    };

};

export {
    LinearTranslationGizmo
};
// export default LinearTranslationGizmo;