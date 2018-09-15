import { Vec3 } from '../../Math/Vec3';
import { GLPass, PassType } from '../GLPass.js';
import { GLShaderMaterials } from '../GLCollector.js';
import { GLRenderer } from '../GLRenderer.js';

class GLTransparentGeomsPass extends GLPass {
    constructor() {
        super();
    }

    
    init(gl, collector, passIndex) {
        super.init(gl, collector, passIndex);

        this.drawItems = [];
        this.visibleItems = [];
        this.prevSortCameraPos = new Vec3(999,999,999);
        this.resort = false;
    }


    __addDrawItem(glshader, glmaterial, glGeom, glgeomitem){

        const indices = [];

        for(let i=0; i<glgeomitem.geomItem.getNumPaths(); i++) {
            indices.push(this.drawItems.length);
            this.drawItems.push({
                glshader,
                glmaterial,
                glGeom,
                glgeomitem,
                pathIndex: i
            });
        }
        glgeomitem.drawItemsChanged.connect((added, removed)=>{
            // if(visible) 
            //     this.drawItems.push(item);
            // else {
            //     const index = this.drawItems.indexOf(item);
            //     this.drawItems.splice(index, 1);
            // }
        });
        glgeomitem.getGeomItem().geomXfoChanged.connect((pathIndex)=>{
            this.resort = true;
        });
    }

    /////////////////////////////////////
    // Bind to Render Tree
    filterRenderTree() {
        let allglshaderMaterials = this.__collector.getGLShaderMaterials();

        this.drawItems = [];
        for (let glshaderkey in allglshaderMaterials) {
            let glshaderMaterials = allglshaderMaterials[glshaderkey];
            if (!glshaderMaterials.glshader.isTransparent())
                continue;
            const glshader = glshaderMaterials.glshader;
            const glmaterialDrawItemSets = glshaderMaterials.glmaterialDrawItemSets;
            for (let glmaterialDrawItemSet of glmaterialDrawItemSets) {
                const glmaterial = glmaterialDrawItemSet.glmaterial;
                const gldrawitemsets = glmaterialDrawItemSet.getDrawItemSets();
                for (let gldrawitemset of gldrawitemsets) {
                    // Now we must unpack the drawItemSet into individual draw items.
                    const glGeom = gldrawitemset.glgeom;
                    for (let glgeomitem of gldrawitemset.glgeomitems) {
                        this.__addDrawItem(glshader, glmaterial, glGeom, glgeomitem);
                    }
                }
            }
        }
        // force a resort.
        this.resort = true;
    }

    sortItems(viewPos) {
        for (let drawItem of this.drawItems) {
            drawItem.dist = drawItem.glgeomitem.geomItem.getGeomXfo(drawItem.pathIndex).tr.distanceTo(viewPos);
        }
        this.drawItems.sort((a, b) => (a.dist > b.dist) ? -1 : ((a.dist < b.dist) ? 1 : 0));
        this.prevSortCameraPos = viewPos;
        this.resort = false;
    }

    _drawItems(renderstate){
        const gl = this.__gl;
        let currentglShader;
        let currentglMaterial;
        let currentglGeom;
        for (let transparentItem of this.drawItems) {
            const glgeomitem = transparentItem.glgeomitem;

            if (currentglShader != transparentItem.glshader) {
                // Some passes, like the depth pass, bind custom uniforms.
                if (!this.bindShader(renderstate, transparentItem.glshader)){
                    continue;
                }
                currentglShader = transparentItem.glshader;
            }
            if (currentglMaterial != transparentItem.glmaterial) {
                if (!transparentItem.glmaterial.bind(renderstate)){
                    continue;
                }
                currentglMaterial = transparentItem.glmaterial;
            }

            if (currentglGeom != transparentItem.glGeom) {
                currentglGeom = transparentItem.glGeom;
                if (!currentglGeom.bind(renderstate)){
                    continue;
                }
            }

            if (glgeomitem.bind(renderstate, transparentItem.pathIndex)) {
                // Specify an non-instanced draw to the shader
                if (renderstate.unifs.instancedDraw) {
                    gl.uniform1i(renderstate.unifs.instancedDraw.location, 0);
                    gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location);
                }
                currentglGeom.draw(renderstate);
            }
        }

        if(currentglGeom)
            currentglGeom.unbind();
    }

    draw(renderstate) {
        if(this.drawItems.length ==0)
            return;
        
        const gl = this.__gl;

        const viewPos = renderstate.viewXfo.tr;
        // TODO: Avoid sorting if the camera did not movemore than 30cm
        if(this.resort || viewPos.distanceTo(this.prevSortCameraPos) > 0.3)
            this.sortItems(viewPos);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
        
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        // Complex transparent surfaces require mutiple passes.
        // First the multiply pass tints the background color, simulating
        // light passing through the surface, and then the add layer
        // adds new color to the backbuffer to simulate light bouncing off
        // the surface.
        
        renderstate.pass = 'MULTIPLY';
        gl.blendFunc(gl.DST_COLOR, gl.ZERO);// For multiply, select this.
        this._drawItems(renderstate);

        renderstate.pass = 'ADD';
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // For add
        this._drawItems(renderstate);



        gl.disable(gl.BLEND);
    }
};

GLRenderer.registerPass(GLTransparentGeomsPass, PassType.TRANSPARENT);

export {
    GLTransparentGeomsPass
};