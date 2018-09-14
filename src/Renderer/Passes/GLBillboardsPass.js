import {
    Vec3, 
    Vec4
} from '../../Math';
import {
    BillboardItem
} from '../../SceneTree';
import {
    BillboardShader
} from '../Shaders/BillboardShader.js';
import {
    GLPass, PassType
} from '../GLPass.js';
import {
    GLShader
} from '../GLShader.js';
import {
    ImageAtlas
} from '../ImageAtlas.js';
import {
    GLTexture2D
} from '../GLTexture2D.js';
import {
    generateShaderGeomBinding
} from '../GeomShaderBinding.js';
import { GLRenderer } from '../GLRenderer.js';


const pixelsPerItem = 5; // The number of pixels per draw item.

class GLBillboardsPass extends GLPass {
    constructor() {
        super();
    }
    
    init(gl, collector, passIndex) {
        super.init(gl, collector, passIndex);

        this.__billboards = [];
        this.__threshold = 0.0;
        this.__updateRequested = false;

        this.__collector.renderTreeUpdated.connect(()=> this.__updateBillboards());

        this.__prevSortCameraPos = new Vec3();

        this.__atlas = new ImageAtlas(gl, 'Billboards', 'RGBA', 'UNSIGNED_BYTE', [1, 1, 1, 0]);
        this.__atlas.loaded.connect(this.updated.emit);
        this.__atlas.updated.connect(this.updated.emit);

        collector.registerSceneItemFilter((treeItem, rargs)=>{
            if(treeItem instanceof BillboardItem) {
                this.addBillboard(treeItem);
                return true;
            }
        });
    }

    /////////////////////////////////////
    // Bind to Render Tree

    filterRenderTree() {}

    __requestUpdate(){
        if(!this.__updateRequested) {
            this.__updateRequested = true;
            setTimeout(()=>{
              this.__updateBillboards();  
            }, 100);
        }
    }

    addBillboard(billboard) {

        const image = billboard.getParameter('image').getValue();
        if(!image) {
            billboard.getParameter('image').valueChanged.connect(()=> this.addBillboard(billboard) );
            return;
        }
        const index = this.__billboards.length;
        this.__billboards.push({
            billboard,
            index,
            imageIndex: this.__atlas.addSubImage(image)
        });

        billboard.visibilityChanged.connect(() => {
            this.__updateBillboard(index);
            this.updated.emit();
        });
        image.updated.connect(() => {
            throw("TODO: update the atlas:" + index);
            // const image = billboard.getParameter('image').getValue();
            // const imageIndex = this.__atlas.addSubImage(image)
            // this.__billboards[index].image = image;
            // this.__billboards[index].imageIndex = imageIndex;
            // this.__updateBillboard(index);
        });
        billboard.getParameter('alpha').valueChanged.connect(() => {
            this.__updateBillboard(index);
            this.updated.emit();
        });

        billboard.destructing.connect(this.removeBillboardItem.bind(this));
        this.__requestUpdate();
    }

    removeBillboardItem(billboard) {
        const index = this.__billboards.indexOf(billboard);
        billboard.destructing.disconnect(this.removeBillboardItem.bind(this));
        this.__billboards.splice(index, 1);
        this.__requestUpdate();
    }


    __populateBillboardDataArray(billboardData, index, dataArray) {
        const billboard = billboardData.billboard;
        const mat4 = billboard.getGlobalXfo().toMat4();
        const scale = billboard.getParameter('scale').getValue();
        let flags = 0;
        if(billboard.getParameter('alignedToCamera').getValue())
            flags |= 1<<2;
        const alpha = billboard.getParameter('alpha').getValue();
        const color = billboard.getParameter('color').getValue();

        const offset = index * pixelsPerItem * 4;
        const col0 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset);
        const col1 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 4);
        const col2 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 8);
        const col3 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 12);
        col0.set(mat4.xAxis.x, mat4.yAxis.x, mat4.zAxis.x, mat4.translation.x);
        col1.set(mat4.xAxis.y, mat4.yAxis.y, mat4.zAxis.y, mat4.translation.y);
        col2.set(mat4.xAxis.z, mat4.yAxis.z, mat4.zAxis.z, mat4.translation.z);
        col3.set(scale, flags, billboardData.imageIndex, alpha);

        const col4 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 16);
        col4.set(color.r, color.g, color.b, color.a);
    }

    __updateBillboards() {
        if (!this.__updateRequested)
            return;

        // Note: When the camera moves, this array is sorted and re-upload.
        this.__indexArray = new Float32Array(this.__billboards.length);
        for (let i = 0; i < this.__billboards.length; i++) {
            this.__indexArray[i] = this.__billboards[i].index;
        }

        const gl = this.__gl;
        if(!this.__glshader) {
            if (!gl.__quadVertexIdsBuffer) {
                gl.setupInstancedQuad();
            }
            this.__glshader = new BillboardShader(gl);
            let shaderComp = this.__glshader.compileForTarget('GLBillboardsPass', this.__collector.getRenderer().getShaderPreproc());
            this.__shaderBinding = generateShaderGeomBinding(gl, shaderComp.attrs, gl.__quadattrbuffers, gl.__quadIndexBuffer);
        }

        const doIt = ()=>{

            // Note: Currently the atlas destroys all the source images
            // after loading them(to save memory). This means we can't
            // re-render the atlas. If re-rendering is needed, add an age
            this.__atlas.renderAtlas();

            if(!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
                this.__modelMatrixArray = [];
                this.__billboardDataArray = [];
                this.__tintColorArray = [];
                this.__billboards.forEach((billboardData, index)=>{

                    const billboard = billboardData.billboard;
                    const mat4 = billboard.getGlobalXfo().toMat4();
                    const scale = billboard.getParameter('scale').getValue();
                    const flags = billboard.getParameter('flags').getValue();
                    const alpha = billboard.getParameter('alpha').getValue();
                    const color = billboard.getParameter('color').getValue();

                    this.__modelMatrixArray[index] = mat4.asArray();
                    this.__billboardDataArray[index] = [scale, flags, billboardData.imageIndex, alpha];
                    this.__tintColorArray[index] = [color.r, color.g, color.b, color.a];
                });
                this.__updateRequested = false;
                return;
            }


            let size = Math.round(Math.sqrt(this.__billboards.length * pixelsPerItem) + 0.5);
            // Note: the following few lines need a cleanup. 
            // We should be using power of 2 textures. The problem is that pot texture sizes don't
            // align with the 6 pixels per draw item. So we need to upload a slightly bigger teture
            // but upload the 'usable' size.

            // Only support power 2 textures. Else we get strange corruption on some GPUs
            // in some scenes.
            // Size should be a multiple of pixelsPerItem, so each geom item is always contiguous
            // in memory. (makes updating a lot easier. See __updateItemInstanceData below)
            // size = Math.nextPow2(size);

            if((size % pixelsPerItem) != 0)
                size += pixelsPerItem - (size % pixelsPerItem);

            this.__width = size;
            // if((this.__width % pixelsPerItem) != 0)
            //     this.__width -= (this.__width % pixelsPerItem);

            if (!this.__drawItemsTexture) {
                this.__drawItemsTexture = new GLTexture2D(gl, {
                    format: 'RGBA',
                    type: 'FLOAT',
                    width: size,
                    height: size,
                    filter: 'NEAREST',
                    wrap: 'CLAMP_TO_EDGE',
                    mipMapped: false
                });
            } else {
                this.__drawItemsTexture.resize(size, size);
            }

            for (let i = 0; i < this.__billboards.length; i++) {
                this.__updateBillboard(i);
            }


            this.__instanceIdsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.__indexArray, gl.STATIC_DRAW);

            this.__updateRequested = false;
        };

        if (this.__atlas.isLoaded()) {
            doIt();
        } else {
            this.__atlas.loaded.connect(doIt)
        }
    }

    __updateBillboard(index) {
        if (!this.__drawItemsTexture)
            return;

        const billboardData = this.__billboards[index];
        const gl = this.__gl;

        const dataArray = new Float32Array(pixelsPerItem * 4);
        this.__populateBillboardDataArray(billboardData, 0, dataArray);

        gl.bindTexture(gl.TEXTURE_2D, this.__drawItemsTexture.glTex);
        const xoffset = (index * pixelsPerItem) % this.__width;
        const yoffset = Math.floor((index * pixelsPerItem) / this.__width);

        const width = pixelsPerItem;
        const height = 1;
        // console.log("xoffset:" + xoffset + " yoffset:" + yoffset +" width:" + width + " dataArray:" + dataArray.length);
        // gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, gl.FLOAT, dataArray);

        const type = this.__drawItemsTexture.getType();
        const format = this.__drawItemsTexture.getFormat();

        if (type == 'FLOAT') {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl[format], gl[type], dataArray);
        } else {
            const unit16s = Math.convertFloat32ArrayToUInt16Array(dataArray);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl[format], gl[type], unit16s);
        }

    }

    sort(cameraPos) {
        for (let billboardData of this.__billboards) {
            billboardData.dist = billboardData.billboard.getGlobalXfo().tr.distanceTo(cameraPos);
        }
        this.__indexArray.sort((a, b) => (this.__billboards[a].dist > this.__billboards[b].dist) ? -1 : ((this.__billboards[a].dist < this.__billboards[b].dist) ? 1 : 0));

        const gl = this.__gl;
        if(gl.floatTexturesSupported && this.__instanceIdsBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.__indexArray, gl.STATIC_DRAW);
        }
    }


    draw(renderstate) {

        if(this.__billboards.length == 0 || !this.__atlas.isReady())
            return;



        const gl = this.__gl;

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let cameraPos = renderstate.cameraMatrix.translation;
        let dist = cameraPos.distanceTo(this.__prevSortCameraPos);
        // Avoid sorting if the camera did not move more than 3 meters.
        if (dist > this.__threshold) {
            this.sort(cameraPos);
            this.__prevSortCameraPos = cameraPos.clone();
            if(this.__billboards.length == 1)
                this.__threshold = 9999;
            else {
                const v0 = this.__billboards[this.__indexArray[0]].billboard.getGlobalXfo().tr;
                const v1 = this.__billboards[this.__indexArray[0]].billboard.getGlobalXfo().tr;
                this.__threshold = v0.distanceTo(v1)
            }

        }

        this.__glshader.bind(renderstate);
        this.__shaderBinding.bind(renderstate);

        const unifs = renderstate.unifs;
        this.__atlas.bindToUniform(renderstate, unifs.atlasBillboards);

        if(!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
            const len = this.__indexArray.length;
            for (let i = 0; i < len; i++) {
                // this.__drawItems[i].bind(renderstate);
                // this.__glgeom.draw();

                gl.uniformMatrix4fv(unifs.modelMatrix.location, false, this.__modelMatrixArray[i]);
                gl.uniform4fv(unifs.billboardData.location, this.__billboardDataArray[i]);
                gl.uniform4fv(unifs.tintColor.location, this.__tintColorArray[i]);
                gl.uniform4fv(unifs.layoutData.location, this.__atlas.getLayoutData(this.__billboards[i].imageIndex));
                ;
                gl.drawQuad();
            };
        }
        else
        {
            this.__drawItemsTexture.bindToUniform(renderstate, unifs.instancesTexture);
            gl.uniform1i(unifs.instancesTextureSize.location, this.__width);


            {
                // The instance transform ids are bound as an instanced attribute.
                let location = renderstate.attrs.instanceIds.location;
                gl.enableVertexAttribArray(location);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer);
                gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 4, 0);
                gl.vertexAttribDivisor(location, 1); // This makes it instanced
            }


            gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, this.__billboards.length);
        }

        gl.disable(gl.BLEND);
    }
};

GLRenderer.registerPass(GLBillboardsPass, PassType.TRANSPARENT);

export {
    GLBillboardsPass
};
// export default GLBillboardsPass;