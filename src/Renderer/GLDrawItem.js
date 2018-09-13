import {
    Color
} from '../Math';
import {
    Signal
} from '../Utilities';

import '../SceneTree/GeomItem.js';

// This class abstracts the rendering of a collection of geometries to screen.
class GLDrawItem {
    constructor(gl, geomItem, glGeom, id, flags = null) {
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

        this.updateVisibility = this.updateVisibility.bind(this);
        this.destroy = this.destroy.bind(this);

        this.__dirtySubIndices = [];
        this.modelMatrixArray = [];
        if (!gl.floatTexturesSupported) {
            this.updateXfo = (index, mode) => {
                this.__dirtySubIndices.push(index)
            };
        } else {
            this.updateXfo = (index, mode) => {
                this.__dirtySubIndices.push(index)
                this.transformChanged.emit();
            };
        }

        this.updateSelection = (val) => {
            if (val)
                this.highlight();
            else
                this.unhighlight();
        }

        this.geomItem.geomXfoChanged.connect(this.updateXfo);
        this.geomItem.visibilityChanged.connect(this.updateVisibility);
        this.geomItem.selectedChanged.connect(this.updateSelection);
        this.geomItem.destructing.connect(this.destroy);

        this.glGeom.updated.connect(() => {
            this.updated.emit();
        });



        let lightmapCoordsOffset = this.geomItem.getLightmapCoordsOffset();
        let materialId = 0;
        let geomId = 0;
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


    destroy() {
        this.geomItem.visibilityChanged.disconnect(this.updateVisibility);
        this.geomItem.globalXfoChanged.disconnect(this.updateXfo);
        this.geomItem.selectedChanged.disconnect(this.updateSelection);
        this.geomItem.destructing.disconnect(this.destroy);
        this.destructing.emit(this);
    }
};

export {
    GLDrawItem
};
// export default GLDrawItem;