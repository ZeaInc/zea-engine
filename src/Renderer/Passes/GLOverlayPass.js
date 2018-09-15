import { GLPass, PassType } from '../GLPass.js';
import { GLShaderMaterials } from '../GLCollector.js';
import {
    GeomDataShader
} from '../Shaders/GeomDataShader.js';
import { GLRenderer } from '../GLRenderer.js';

class GLOverlayPass extends GLPass {
    constructor() {
        super();
    }

    init(gl, collector, passIndex) {
        super.init(gl, collector, passIndex);
        this.__geomdatashader = new GeomDataShader(gl);
    }

    /////////////////////////////////////
    // Bind to Render Tree
    filterRenderTree() {
        const allglshaderMaterials = this.__collector.getGLShaderMaterials();
        this.__glshadermaterials = [];
        for (let glshaderkey in allglshaderMaterials) {
            const glshaderMaterials = allglshaderMaterials[glshaderkey];
            if (!glshaderMaterials.getGLShader().isOverlay())
                continue;
            this.__glshadermaterials.push(glshaderMaterials);
        }
    }

    bindShader(renderstate, glshader){
        if(super.bindShader(renderstate, glshader)){
            return true;
        }
        return false;
    }

    draw(renderstate) {

        const gl = this.__gl;
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);

        renderstate.pass = 'ADD';
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add

        super.draw(renderstate);

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

    getGeomItemAndDist(geomData) {

        let itemId, dist;
        const gl = this.__gl;
        if (gl.floatGeomBuffer) {
            itemId = geomData[1];
            dist = geomData[3];
        } else {
            itemId = geomData[0] + (geomData[1] << 8);
            dist = Math.decode16BitFloatFrom2xUInt8([geomData[2], geomData[3]]);
        }

        const geomItemAndPathIndex = this.__collector.getGeomItemAndPathIndex(itemId);
        if (geomItemAndPathIndex) {
            geomItemAndPathIndex.dist = dist;
            return geomItemAndPathIndex;
        }
    }

    drawGeomData(renderstate){

        const gl = this.__gl;
        gl.disable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);

        if(!this.__geomdatashader.bind(renderstate, this.constructor.name))
            return false;

        if(!this.__collector.bind(renderstate))
            return false;

        {
            let unif = renderstate.unifs.floatGeomBuffer;
            if (unif){
                gl.uniform1i(unif.location, gl.floatGeomBuffer ? 1 : 0);
            }
        }
        {
            let unif = renderstate.unifs.passId;
            if (unif){
                gl.uniform1i(unif.location, this.__passIndex);
            }
        }

        super.drawGeomData(renderstate);
    }
};

GLRenderer.registerPass(GLOverlayPass, PassType.OVERLAY);

export {
    GLOverlayPass
};
