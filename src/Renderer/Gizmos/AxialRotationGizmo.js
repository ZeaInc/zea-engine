import { Ray } from '../../Math/Ray';
import { Cylinder } from '../../SceneTree/Geometry/Shapes/Cylinder';
import { TreeItem } from '../../SceneTree/TreeItem'
import { GeomItem } from '../../SceneTree/GeomItem'
import { GLMesh } from '../GLMesh.js';
import { GLGeomItem } from '../GLGeomItem.js';
import { Gizmo } from './Gizmo.js';

class AxialRotationGizmo extends Gizmo {
    constructor(gl, context, name, color, xfo) {
        super(color);

        this.__context = context;
        this.__treeItem = new TreeItem('AxialRotationGizmo'+name);
        this.__treeItem.setLocalXfo(xfo);
        context.treeItem.addChild(this.__treeItem);

        // let geom = new Circle(1.0, 32);
        let geom = new Cylinder(1.0, 0.04, 32, 2, false)
        let geomItem = new GeomItem('circle', geom);
        let geomglGeom = new GLMesh(gl, geom);
        let geomglGeomItem = new GLGeomItem(gl, geomItem, geomglGeom);
        this.__treeItem.addChild(geomItem);

        this.__addDrawItem(geomglGeomItem);

        // // Generate the proxy geom that we use to render the data buffer. 
        // let proxyGeom = new Torus(0.1, 1.0, 32);
        let proxyGeom = new Cylinder(1.0, 0.2, 32, 2, false)
        let proxyGeomItem = new GeomItem('proxy', proxyGeom);
        let proxyGeomglGeom = new GLMesh(gl, proxyGeom);
        let proxyGeomglGeomItem = new GLGeomItem(gl, proxyGeomItem, proxyGeomglGeom);
        this.__treeItem.addChild(proxyGeomItem);

        // this.__addDrawItem(proxyGeomglGeomItem);
        this.__setProxyItem(proxyGeomglGeomItem);
    }

    onDragStart(event, mousePos, viewport) {
        this.manipRay = new Ray(this.__treeItem.getGlobalXfo().tr, this.__treeItem.getGlobalXfo().ori.getYaxis());
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);

        let dist = mouseRay.intersectRayPlane(this.manipRay);
        let intersectionPos = mouseRay.start.add(mouseRay.dir.scale(dist));
        let intersectionTangent = intersectionPos.subtract(this.manipRay.start).cross(this.manipRay.dir).normalize();
        this.sliderRay = new Ray(intersectionPos, intersectionTangent);
        this.mouseDownDist = this.sliderRay.intersectRayVector(mouseRay)[0];

        this.__context.beginManipulation();
    }

    onDrag(event, mousePos, viewport) {
        let mouseRay = viewport.calcRayFromScreenPos(mousePos);
        let dist = this.sliderRay.intersectRayVector(mouseRay)[0];
        let delta = (dist - this.mouseDownDist);
        this.__context.rotate(this.manipRay.dir, -delta);
    }

    onDragEnd(event, mousePos, viewport) {
        this.__context.endManipulation();
    }

};

export {
    AxialRotationGizmo
};
// export default AxialRotationGizmo;