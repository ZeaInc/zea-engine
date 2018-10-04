import {
    Color
} from '../Math';
import {
    Signal
} from '../Utilities';

import '../SceneTree/GeomItem.js';

// This class abstracts the rendering of a collection of geometries to screen.
class GLGeomItem {
    constructor(gl, geomItem, glGeom, callbacks ) {
        this.gl = gl;
        this.geomItem = geomItem;
        this.glGeom = glGeom;

        // console.log("GLGeomItem", geomItem.getName(), geomItem.getNumPaths())
        // for(let i=0; i<geomItem.getNumPaths(); i++)
        //     console.log(geomItem.getGeomXfo(i))

        this.visible = true;//this.geomItem.getVisible();
        this.culled = false;

        this.color = geomItem.color ? geomItem.color : new Color(1, 0, 0, 1);
        this.wireColor = [0.2, 0.2, 0.2, 1.0];
        this.lightmapName = geomItem.getLightmapName();

        this.transformChanged = new Signal();
        this.updated = new Signal();
        this.destructing = new Signal();
        this.drawItemsChanged = new Signal();


        /////////////////////////////////////////////
        // Draw Item Indices.
        this.__callbacks = callbacks
        this.__drawItemIndices = [];
        this.__drawItemIndexToPathIndex = {};
        this.__geomDatas = [];
        const materialId = 0;
        const geomId = 0;
        for(let i=0; i<this.geomItem.getNumPaths(); i++) {
            const drawItemIndex = this.__callbacks.allocDrawItemIndex(i);
            this.__drawItemIndices.push(drawItemIndex);

            const lightmapCoordsOffset = this.geomItem.getLightmapCoordsOffset(i);
            this.__geomDatas.push([lightmapCoordsOffset.x, lightmapCoordsOffset.y, materialId, geomId]);
        }

        this.geomItem.pathAdded.connect((pathIndex)=>{
            const drawItemIndex = this.__callbacks.allocDrawItemIndex(pathIndex);
            this.__drawItemIndices.splice(pathIndex, 0, drawItemIndex);

            const lightmapCoordsOffset = this.geomItem.getLightmapCoordsOffset(pathIndex);
            this.__geomDatas.splice(pathIndex, 0, [lightmapCoordsOffset.x, lightmapCoordsOffset.y, materialId, geomId]);

            this.drawItemsChanged.emit(1, 0);
        });
        this.geomItem.pathRemoved.connect((pathIndex)=>{
            this.__callbacks.releaseDrawItemIndex(this.__drawItemIndices[pathIndex])
            this.__drawItemIndices.splice(pathIndex, 1);
            this.__geomDatas.splice(pathIndex, 1);
            
            this.drawItemsChanged.emit(0, 1);
        })

        this.modelMatrixArray = [];
        const updateXfo = (index, mode) => {
            // console.log("updateXfo", index)
            this.__callbacks.dirtyDrawItem(this.__drawItemIndices[index])
        };
        this.geomItem.geomXfoChanged.connect(updateXfo);

        // const updateSelection = (val) => {
        //     if (val)
        //         this.highlight();
        //     else
        //         this.unhighlight();
        // }

        // this.updateVisibility = this.updateVisibility.bind(this);
        // this.geomItem.visibilityChanged.connect(this.updateVisibility);
        // this.geomItem.selectedChanged.connect(updateSelection);

        this.glGeom.updated.connect(() => this.updated.emit() );


        const destroy = () => {

            for(let i=0; i<this.__drawItemIndices.length; i++) {
                this.__callbacks.releaseDrawItemIndex(this.__drawItemIndices[i])
            }

            this.geomItem.visibilityChanged.disconnect(this.updateVisibility);
            this.geomItem.globalXfoChanged.disconnect(updateXfo);
            this.geomItem.selectedChanged.disconnect(updateSelection);
            this.geomItem.destructing.disconnect(destroy);
            this.destructing.emit(this);
        }
        this.geomItem.destructing.connect(destroy);
    }

    getGeomItem() {
        return this.geomItem;
    }

    getGLGeom() {
        return this.glGeom;
    }

    getDrawItemCount() {
        return this.__drawItemIndices.length;
    }

    getDrawItemIndices() {
        return this.__drawItemIndices;
    }

    getVisible() {
        return this.geomItem.getVisible();
    }

    updateVisibility() {
        let geomVisible = this.geomItem.getVisible();
        let visible = geomVisible && !this.culled;
        if (this.visible != visible) {
            this.visible = visible;
            this.drawItemsChanged.emit();
            this.updated.emit();
        }
    }

    setCullState(culled) {
        this.culled = culled;
        this.updateVisibility();
    }

    updateGeomMatrix(pathIndex) {
        this.modelMatrixArray[pathIndex] = this.geomItem.getGeomXfo(pathIndex).toMat4().asArray();
    }

    bind(renderstate, pathIndex) {

        const gl = this.gl;
        const unifs = renderstate.unifs;

        if (!gl.floatTexturesSupported) {
            let modelMatrixunif = unifs.modelMatrix;
            if (modelMatrixunif) {
                gl.uniformMatrix4fv(modelMatrixunif.location, false, this.modelMatrixArray[pathIndex]);
            }
            let drawItemDataunif = unifs.drawItemData;
            if (drawItemDataunif) {
                gl.uniform4f(drawItemDataunif.location, this.geomData);
            }
        }

        const unif = unifs.transformIndex;
        if (unif) {
            gl.uniform1i(unif.location, this.__drawItemIndices[pathIndex]);
        }

        if (renderstate.lightmaps && unifs.lightmap) {
            if (renderstate.boundLightmap != this.lightmapName) {
                const gllightmap = renderstate.lightmaps[this.lightmapName];
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

        return true;
    }


};

export {
    GLGeomItem
};
// export default GLGeomItem;