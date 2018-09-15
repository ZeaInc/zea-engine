import '../SceneTree/GeomItem.js';


import {
    Signal
} from '../Utilities';

// This class abstracts the rendering of a collection of geometries to screen.
class GLDrawItemSet {
    constructor(gl, glgeom) {
        this.gl = gl;
        this.glgeom = glgeom;
        this.glgeomitems = [];
        this.instancedIdsArray = null;
        this.instancedIdsBuffer = null;
        this.instancedIdsBufferDirty = true;
        this.drawCount = 0; // The number of visible drawn geoms.
        // this.inverted = false;

        this.drawCountChanged = new Signal();
    }

    getGLGeom() {
        return this.glgeom;
    }

    //  Note: used by patternade to iterate over times.
    getGLDrawItems() {
        return this.glgeomitems;
    }

    // isInverted() {
    //     return this.inverted;
    // }


    addGLGeomItem(glgeomitem) {
        let index = this.glgeomitems.length;
        this.glgeomitems.push(glgeomitem);
        if (glgeomitem.visible) {
            let drawItemCount = glgeomitem.getDrawItemCount()
            this.drawCount += drawItemCount;
            this.drawCountChanged.emit(drawItemCount);
        }

        if (this.glgeomitems.length == 1) {
            // this.inverted = glgeomitem.isInverted();
            this.lightmapName = glgeomitem.getGeomItem().getLightmapName();
        }

        // TODO: per-path visibility.
        glgeomitem.drawItemsChanged.connect((added, removed) => {
            const change = (added - removed)
            this.drawCount += change;
            this.drawCountChanged.emit(change);
            this.instancedIdsBufferDirty = true;
        });

        glgeomitem.destructing.connect(() => {
            this.glgeomitems.splice(index, 1);
        });

        this.instancedIdsBufferDirty = true;
    }


    //////////////////////////////////////
    // Instance Ids
    genBuffers() {
        const gl = this.gl;
        this.instancedIdsArray = new Float32Array(this.drawCount);
        this.instancedIdsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instancedIdsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instancedIdsArray, gl.STATIC_DRAW);
        this.instancedIdsBuffer.name = 'transformIds';
    }

    // The culling system will specify a subset of the total number of items for
    // drawing. 
    updateInstanceIDsBuffer() {
        const gl = this.gl;
        if (!gl.floatTexturesSupported) {
            this.drawnItems = [];
            for (let i = 0; i < this.glgeomitems.length; i++) {
                const drawItemIndices = this.glgeomitems[i].getDrawItemIndices();
                for (let drawItemIndex of drawItemIndices) {
                    this.drawnItems.push(drawItemIndex);
                    this.lastVisible = drawItemIndex;
                }
            }
            this.instancedIdsBufferDirty = false;
            return;
        }
        if (this.instancedIdsBuffer && this.glgeomitems.length != this.instancedIdsArray.length) {
            this.gl.deleteBuffer(this.instancedIdsBuffer);
            this.instancedIdsBuffer = null;
        }
        if (!this.instancedIdsBuffer) {
            this.genBuffers();
        }

        // Collect all visible geom ids into the instanceIds array.
        // Note: the draw count can be less than the number of instances
        // we re-use the same buffer and simply invoke fewer draw calls.
        let offset = 0;
        for (let i = 0; i < this.glgeomitems.length; i++) {
            const drawItemIndices = this.glgeomitems[i].getDrawItemIndices();
            for (let drawItemIndex of drawItemIndices) {
                this.instancedIdsArray[offset] = drawItemIndex;
                offset++;
                this.lastVisible = i;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instancedIdsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instancedIdsArray, gl.STATIC_DRAW);

        this.instancedIdsBufferDirty = false;
    }

    getDrawCount() {
        return this.drawCount;
    }

    //////////////////////////////////////
    // Drawing

    drawSingle(renderstate, extrAttrBuffers, index = 0) {

        const gl = this.gl;
        const unifs = renderstate.unifs;
        this.glgeom.bind(renderstate, extrAttrBuffers);
        if (this.glgeomitems[index].bind(renderstate)) {
            // Specify an non-instanced draw to the shader
            if (renderstate.unifs.instancedDraw) {
                gl.uniform1i(renderstate.unifs.instancedDraw.location, 0);
                gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location);
            }
            this.glgeom.draw(renderstate);
        }
    }

    draw(renderstate, extrAttrBuffers) {
        if (this.drawCount == 0) {
            return;
        }
        if (this.instancedIdsBufferDirty) {
            this.updateInstanceIDsBuffer();
        }

        const gl = this.gl;
        const unifs = renderstate.unifs;

        if (renderstate.lightmaps && unifs.lightmap) {
            if (renderstate.boundLightmap != this.lightmapName) {
                let gllightmap = renderstate.lightmaps[this.lightmapName];
                if (gllightmap && gllightmap.glimage.isLoaded()) {
                    gllightmap.glimage.bindToUniform(renderstate, unifs.lightmap);
                    gl.uniform2fv(unifs.lightmapSize.location, gllightmap.atlasSize.asArray());
                    if (unifs.lightmapConnected) {
                        gl.uniform1i(unifs.lightmapConnected.location, true);
                    }
                    renderstate.boundLightmap = this.lightmapName;
                } else {
                    // disable lightmaps. Revert to default lighting.
                    if (unifs.lightmapConnected) {
                        gl.uniform1i(unifs.lightmapConnected.location, false);
                    }
                }
            }
        }

        // Lazy unbinding. We can have situations where we have many materials
        // all bound to the same geom. e.g. lots of billboards
        // We can avoid the expensive re-binding of geoms with a simple check. 
        if (renderstate.glgeom != this.glgeom) {
            this.glgeom.bind(renderstate, extrAttrBuffers);
            renderstate.glgeom = this.glgeom;
        }

        // renderstate.drawCalls++;
        // renderstate.drawCount+=this.drawCount;
        // The set has a transform id stored in the texture.
        // Each set as at least one transform, but might have many...
        // if (!renderstate.glgeom.renderableInstanced()) {
        //     // return;
        //     if (this.glgeomitems[this.lastVisible].bind(renderstate)) {
        //         // console.log("draw:"+ this.glgeomitems[this.lastVisible].getId());
        //         // Specify an non-instanced draw to the shader
        //         if (renderstate.unifs.instancedDraw) {
        //             gl.uniform1i(renderstate.unifs.instancedDraw.location, 0);
        //             gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location);
        //         }
        //         this.glgeom.draw(renderstate);
        //     }
        //     return;
        // }
        // // return;

        if (!gl.floatTexturesSupported || !gl.drawElementsInstanced || !renderstate.glgeom.renderableInstanced()) {
            if (renderstate.unifs.instancedDraw) {
                gl.uniform1i(renderstate.unifs.instancedDraw.location, 0);
                gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location);
            }
            for (let i = 0; i < this.glgeomitems.length; i++) {
                const drawItemIndices = this.glgeomitems[i].getDrawItemIndices();
                for (let i=0; i < drawItemIndices; i++) {
                    this.glgeomitems[i].bind(renderstate, i);
                    this.glgeom.draw(renderstate);
                }
            }
        } else {
            // console.log("draw:"+ this.instancedIdsArray);

            if (renderstate.attrs.instancedIds) {

                // Specify an instanced draw to the shader so it knows how
                // to retrieve the modelmatrix.
                gl.uniform1i(renderstate.unifs.instancedDraw.location, 1);

                // The instanced transform ids are bound as an instanced attribute.
                let location = renderstate.attrs.instancedIds.location;
                gl.enableVertexAttribArray(location);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.instancedIdsBuffer);
                gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 1 * 4, 0);
                gl.vertexAttribDivisor(location, 1); // This makes it instanced
            }


            this.glgeom.drawInstanced(this.drawCount);
        }


    }
};

export {
    GLDrawItemSet
};