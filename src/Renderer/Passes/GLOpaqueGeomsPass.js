import { GLPass, PassType } from '../GLPass.js';
import { GLShaderMaterials } from '../GLCollector.js';
import { GLRenderer } from '../GLRenderer.js';
import {
    GeomDataShader
} from '../Shaders/GeomDataShader.js';

class GLOpaqueGeomsPass extends GLPass {
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
            if (glshaderMaterials.getGLShader().isTransparent())
                continue;
            if (glshaderMaterials.getGLShader().isOverlay())
                continue;
            if (glshaderMaterials.getGLShader().getPassFilter) {
                const passFilter = glshaderMaterials.getGLShader().getPassFilter();
                if( passFilter.indexOf('GLOpaqueGeomsPass') == -1)
                    continue;
            }
            this.__glshadermaterials.push(glshaderMaterials);
        }
    }

    bindShader(renderstate, glshader){
        if(super.bindShader(renderstate, glshader)){
            // const unifs = renderstate.unifs;
            // if ('debugLightmapTexelSize' in unifs)
            //     this.__gl.uniform1f(unifs.debugLightmapTexelSize.location, renderstate.debugLightmaps);
            // if ('cutawayEnabled' in unifs){
            //     this.__gl.uniform1f(unifs.planeDist.location, renderstate.planeDist);
            //     this.__gl.uniform3fv(unifs.planeNormal.location, renderstate.planeNormal.asArray());
            // }
            return true;
        }
        return false;
    }

    draw(renderstate) {
        const gl = this.__gl;
        // TODO: disable cull face when rendering cross sections.
        // gl.enable(gl.CULL_FACE);
        gl.disable(gl.CULL_FACE);
        
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);

        super.draw(renderstate);
    }

    getGeomItemAndDist(geomData) {

        let itemId, dist;
        const gl = this.__gl;
        if (gl.floatGeomBuffer) {
            itemId = Math.round(geomData[1]);
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

GLRenderer.registerPass(GLOpaqueGeomsPass, PassType.OPAQUE);

export {
    GLOpaqueGeomsPass
};