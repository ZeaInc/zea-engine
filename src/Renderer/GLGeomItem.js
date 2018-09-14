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
        this.id = id;
        this.flags = flags;
        this.visible = this.geomItem.getVisible();
        this.culled = false;

        this.color = geomItem.color ? geomItem.color : new Color(1, 0, 0, 1);
        this.wireColor = [0.2, 0.2, 0.2, 1.0];
        this.lightmapName = geomItem.getLightmapName();

        this.transformChanged = new Signal();
        this.updated = new Signal();
        this.destructing = new Signal();
        this.visibilityChanged = new Signal();


        /////////////////////////////////////////////
        // Draw Item Indices.
        this.__callbacks = callbacks
        this.__drawItemIndices = [];
        for(let i=0; i<this.geomItem.getNumPaths(); i++) {
            this.__drawItemIndices.push(this.__callbacks.addDrawItem())
        }
        this.geomItem.pathAdded.connect((pathIndex)=>{
            this.__drawItemIndices.splice(pathIndex, 0, this.__callbacks.addDrawItem());
        }
        this.geomItem.pathRemoved.connect((pathIndex)=>{
            this.__callbacks.releaseDrawItem(this.__drawItemIndices[pathIndex])
            this.__drawItemIndices.splice(index, 1);
        }

        this.modelMatrixArray = [];
        const updateXfo = (index, mode) => {
            this.__callbacks.dirtyDrawItem(this.__drawItemIndices[index])
        };

        const updateSelection = (val) => {
            if (val)
                this.highlight();
            else
                this.unhighlight();
        }

        this.updateVisibility = this.updateVisibility.bind(this);
        this.geomItem.geomXfoChanged.connect(updateXfo);
        this.geomItem.visibilityChanged.connect(this.updateVisibility);
        this.geomItem.selectedChanged.connect(updateSelection);
        this.geomItem.destructing.connect(destroy);

        this.glGeom.updated.connect(() => this.updated.emit() );


        const destroy = () => {

            for(let i=0; i<this.__drawItemIndices.length; i++) {
                this.__callbacks.releaseDrawItem(this.__drawItemIndices[i])
            }

            this.geomItem.visibilityChanged.disconnect(this.updateVisibility);
            this.geomItem.globalXfoChanged.disconnect(updateXfo);
            this.geomItem.selectedChanged.disconnect(updateSelection);
            this.geomItem.destructing.disconnect(destroy);
            this.destructing.emit(this);
        }

        const lightmapCoordsOffset = this.geomItem.getLightmapCoordsOffset();
        const materialId = 0;
        const geomId = 0;
        this.geomData = [lightmapCoordsOffset.x, lightmapCoordsOffset.y, materialId, geomId];
    }

    getGeomItem() {
        return this.geomItem;
    }

    getGLGeom() {
        return this.glGeom;
    }

    getDirtySubIndices() {
        return this.__dirtySubIndices;
    }

    getVisible() {
        return this.geomItem.getVisible();
    }

    // isInverted(){
    //     return this.inverted;
    // }

    // TODO: this system isn't super nice.
    // Maybe all GeomItems should be assigned a color. (Currently only GizmoITem has a color)
    getColor() {
        return this.color;
    }

    setColor(val) {
        this.color = val;
    }

    getId() {
        return this.id;
    }

    getFlags() {
        return this.flags;
    }

    highlight() {
        this.wireColor = [1.0, 1.0, 1.0, 1.0];
        // Note: not connnected
        //this.updated.emit();
    }

    unhighlight() {
        this.wireColor = [0.2, 0.2, 0.2, 1.0];
        // Note: not connnected
        //this.updated.emit();
    }

    updateVisibility() {
        let geomVisible = this.geomItem.getVisible();
        let visible = geomVisible && !this.culled;
        if (this.visible != visible) {
            this.visible = visible;
            this.visibilityChanged.emit(visible);
            this.updated.emit();
        }
    }

    setCullState(culled) {
        this.culled = culled;
        this.updateVisibility();
    }

    updateGeomMatries() {
        // Pull on the GeomXfo param. This will trigger the lazy evaluation of the operators in the scene.
        for (let index of this.__dirtySubIndices) {
            this.modelMatrixArray[index] = this.geomItem.getGeomXfo().toMat4().asArray();
        }
    }

    getGeomMatrixArray(index) {
        return this.modelMatrixArray[index];
    }

    bind(renderstate) {

        const gl = this.gl;
        const unifs = renderstate.unifs;

        if (!gl.floatTexturesSupported) {
            let modelMatrixunif = unifs.modelMatrix;
            if (modelMatrixunif) {
                gl.uniformMatrix4fv(modelMatrixunif.location, false, this.modelMatrixArray);
            }
            let drawItemDataunif = unifs.drawItemData;
            if (drawItemDataunif) {
                gl.uniform4f(drawItemDataunif.location, this.geomData);
            }
        }

        let unif = unifs.transformIndex;
        if (unif) {
            gl.uniform1i(unif.location, this.id);
        }

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

        return true;
    }


};

export {
    GLGeomItem
};
// export default GLGeomItem;