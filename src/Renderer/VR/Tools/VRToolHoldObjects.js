import {
    Color,
    Quat,
    Xfo,
    Mat4
} from '../../../Math';
import {
    Cuboid,
    GeomItem,
    Material
} from '../../../SceneTree';

import {
    GLTexture2D
} from '../../GLTexture2D.js';

import {
    GLFbo
} from '../../GLFbo.js';

import { VRTool } from '../VRTool.js'

class VRToolHoldObjects extends VRTool {
    constructor(vrStage, vrHead, vrControllers) {
        super();

        this.__vrStage = vrStage;
        this.__vrHead = vrHead;
        this.__vrControllers = vrControllers;

        this.__color = new Color(0, 1, 0);
        // this.__SelVolume = new Cuboid(0.06, 0.06, 0.06);
        // this.__mat = new Material('mat0', 'FlatSurfaceShader');
        // this.__mat.baseColor = new Color(1, 0, 0);

        this.__projMatrix = new Mat4();
        this.__projMatrix.setOrthographicMatrix(-0.015, 0.015, -0.015, 0.015, 0.0, 0.03);
        this.createGeomDataFbo();

        this.__pressedButtonCount = 0;

        this.__heldObjectCount = 0;
        this.__heldGeomItems = [];
        this.__heldGeomItemIds = []; // controller id to held goem id.
        this.__heldGeomItemRefs = [];
        this.__heldGeomItemOffsets = [];

        let bindController = (id, vrController) => {

            // let geomItem = new GeomItem('SelVolume', this.__SelVolume, this.__mat);
            // geomItem.getLocalXfo().tr.set(0.0, 0, -0.03);
            // geomItem.setSelectable(false);
            // vrController.getTreeItem().addChild(geomItem);

            vrController.buttonPressed.connect(() => {
                if(!this.__active)
                    return;
                this.__pressedButtonCount++;

                let geomItem = this.getGeomItemAtController(id, vrController);
                if(geomItem){
                    let gidx = this.__heldGeomItems.indexOf(geomItem);
                    if(gidx == -1){
                        gidx = this.__heldGeomItems.length;
                        this.__heldObjectCount++;
                        this.__heldGeomItems.push(geomItem);
                        this.__heldGeomItemRefs[gidx] = [id];
                        this.__heldGeomItemIds[id] = gidx;
                    }
                    else{
                        this.__heldGeomItemIds[id] = gidx;
                        this.__heldGeomItemRefs[gidx].push(id);
                    }
                    this.initAction();
                }
            });

            vrController.buttonReleased.connect(() => {
                if(!this.__active)
                    return;
                this.__pressedButtonCount--;
                if(this.__heldGeomItemIds[id] !== undefined){
                    let gidx = this.__heldGeomItemIds[id];
                    let refs = this.__heldGeomItemRefs[gidx]
                    refs.splice(refs.indexOf(id), 1);
                    if(refs.length == 0){
                        this.__heldObjectCount--;
                        this.__heldGeomItems[gidx] = undefined;
                    }
                    this.__heldGeomItemIds[id] = undefined;
                    this.initAction();
                }
            });

            if(this.__active)
                vrController.setTipColor(this.__color);
        }
        for(let i =0; i<this.__vrControllers.length; i++) {
            bindController(i, this.__vrControllers[i]);
        }
        vrStage.controllerAdded.connect(bindController);
    }

    activateTool() {
        super.activateTool();
        for(let vrController of this.__vrControllers)
            vrController.setTipColor(this.__color);
    }

    createGeomDataFbo() {
        let gl = this.__vrStage.getRenderer().gl;
        this.__geomDataBuffer = new GLTexture2D(gl, {
            type: 'FLOAT',
            format: 'RGBA',
            filter: 'NEAREST',
            width: 1,
            height: 1,
        });
        this.__geomDataBufferFbo = new GLFbo(gl, this.__geomDataBuffer, true);
        this.__geomDataBufferFbo.setClearColor([0, 0, 0, 0]);
    }

    getGeomItemAtController(id, vrController) {
        let renderer = this.__vrStage.getRenderer();
        let gl = renderer.gl;
        let xfo = vrController.getTipGlobalXfo();

        this.__geomDataBufferFbo.bindAndClear();
        gl.viewport(0, 0, 1, 1);

        const renderstate = {
            viewMatrix: xfo.inverse().toMat4(),
            projectionMatrix: this.__projMatrix,
            isOrthographic: true,
            materialCount: 0,
            drawCalls: 0,
            drawCount: 0
        };

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);

        renderer.getGeomDataPass().draw(renderstate);

        gl.finish();

        let pixels = new Float32Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixels);

        this.__geomDataBufferFbo.unbind();

        let geomItemId = Math.round(pixels[0]);
        return renderer.getCollector().getGeomItemAndPathIndex(geomItemId);
    }

    computeGrabXfo(refs){
        let grabXfo;
        if(refs.length == 1) {
            grabXfo = this.__vrControllers[refs[0]].getTipGlobalXfo();
        }
        else if(refs.length == 2) {
            let xfo0 = this.__vrControllers[refs[0]].getTipGlobalXfo();
            let xfo1 = this.__vrControllers[refs[1]].getTipGlobalXfo();

            grabXfo = new Xfo();
            grabXfo.tr = xfo0.tr.lerp(xfo1.tr, 0.5);
            grabXfo.ori = xfo0.ori.lerp(xfo1.ori, 0.5);

            let vec0 = xfo1.tr.subtract(xfo0.tr);
            vec0.normalizeInPlace();
            let vec1 = grabXfo.ori.getXaxis();
            if(vec0.dot(vec1) < 0.0)
                vec0 = vec0.negate();
            
            let angle = vec0.angleTo(vec1);
            if(angle > 0){
                let axis = vec1.cross(vec0);
                axis.normalizeInPlace();
                let align = new Quat();
                align.setFromAxisAndAngle(axis, angle);
                grabXfo.ori = align.multiply(grabXfo.ori);
            }
        }
        return grabXfo;
    }

    initAction() {
        
        for (let i=0;i < this.__heldGeomItems.length; i++){
            let heldGeom = this.__heldGeomItems[i];
            if(!heldGeom)
                continue;
            let grabXfo = this.computeGrabXfo(this.__heldGeomItemRefs[i]);
            this.__heldGeomItemOffsets[i] = grabXfo.inverse().multiply(heldGeom.getGlobalXfo());
        }
    }

    evalTool() {

        for (let i=0;i < this.__heldGeomItems.length; i++){
            let heldGeom = this.__heldGeomItems[i];
            if(!heldGeom)
                continue;
            let grabXfo = this.computeGrabXfo(this.__heldGeomItemRefs[i]);
            heldGeom.setGlobalXfo(grabXfo.multiply(this.__heldGeomItemOffsets[i]));
        }
    }


};

export {
    VRToolHoldObjects
};