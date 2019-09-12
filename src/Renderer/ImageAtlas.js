import { Vec2, Vec4, Rect2 } from '../Math';

import { Async, GrowingPacker } from '../Utilities';

import { BaseImage } from '../SceneTree';
import { shaderLibrary } from './ShaderLibrary';
import { GLShader } from './GLShader.js';
import { GLTexture2D } from './GLTexture2D.js';
import { GLFbo } from './GLFbo.js';
import { generateShaderGeomBinding } from './GeomShaderBinding.js';

class AtlasLayoutShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'AtlasLayoutShader.vertexShader',
      `

precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

uniform vec2 pos;
uniform vec2 size;
uniform vec2 srctextureDim;
const int border = 2;

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID();
  v_texCoord = position+0.5;
  gl_Position = vec4(vec2(-1.0, -1.0) + (pos * 2.0) + (v_texCoord * size * 2.0), 0.0, 1.0);

  vec2 borderVec2 = vec2(float(border), float(border));
  v_texCoord *= (srctextureDim + (borderVec2 * 2.0)) / srctextureDim;
  v_texCoord -= borderVec2 / srctextureDim;
}

`
    );
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'AtlasLayoutShader.fragmentShader',
      `
precision highp float;

uniform sampler2D srctexture;
uniform vec2 srctextureDim;
uniform bool alphaFromLuminance;
uniform bool invert;

/* VS Outputs */
varying vec2 v_texCoord;

float luminanceFromRGB(vec3 rgb) {
  return 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b;
}

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
  vec2 pixelCoord = v_texCoord*srctextureDim;
  vec2 uv = v_texCoord;

  // Wrap X coords
  if(pixelCoord.x < 0.0){
    uv.x += 1.0/srctextureDim.x;
    uv.y = 1.0 - uv.y;
  }
  else if(pixelCoord.x > srctextureDim.x){
    uv.x -= 1.0/srctextureDim.x;
    uv.y = 1.0 - uv.y;
  }

  // Wrap Y coords
  if(pixelCoord.y < 0.0){
    uv.y += 1.0/srctextureDim.y;
    uv.x = 1.0 - uv.x;
  }
  else if(pixelCoord.y > srctextureDim.y){
    uv.y -= 1.0/srctextureDim.y;
    uv.x = 1.0 - uv.x;
  }

  vec4 texel = texture2D(srctexture, uv);

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  // TODO: check why we pre-multiply alphas here.
  // fragColor = vec4(texel.rgb/texel.a, texel.a);

  if(alphaFromLuminance) {
    fragColor = vec4(texel.rgb, luminanceFromRGB(texel.rgb));
  }
  else {
    fragColor = texel;
  }
  
  if(invert) {
    fragColor = vec4(1.0) - fragColor;
  }

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}

`
    );
  }
}

import './Shaders/GLSL/ImageAtlas.js';

class ImageAtlas extends GLTexture2D {
  constructor(
    gl,
    name,
    format = 'RGBA',
    type = 'FLOAT',
    clearColor = [0, 0, 0, 0]
  ) {
    super(gl);
    this.__name = name;
    this.__formatParam = format;
    this.__typeParam = type;
    this.__clearColor = clearColor;
    this.__subImages = [];
    this.__layoutNeedsRegeneration = false;
    this.__async = new Async();
    this.loaded = this.__async.ready;
  }

  isLoaded() {
    return this.__async.count == 0;
  }

  getMainImage() {
    return this.super;
  }

  addSubImage(subImage) {
    const index = this.__subImages.length;
    if (subImage instanceof BaseImage) {
      const gltexture = new GLTexture2D(this.__gl, subImage);
      if (!subImage.isLoaded()) {
        this.__async.incAsyncCount();
        subImage.loaded.connect(() => {
          this.__async.decAsyncCount();
        });
      }
      subImage.setMetadata('ImageAtlas_index', index);
      gltexture.addRef(this);
      this.__subImages.push(gltexture);
    } else {
      subImage.addRef(this); // subImage is a GLTexture2D
      this.__subImages.push(subImage);
    }

    this.__layoutNeedsRegeneration = true;
    return this.__subImages.length - 1;
  }

  removeSubImage(subImage) {
    let index;
    if (subImage instanceof BaseImage) {
      index = subImage.getMetadata('ImageAtlas_index');
    } else {
      index = this.__subImages.indexOf(subImage);
    }
    const gltexture = this.__subImages[index];
    gltexture.removeRef(this);

    this.__subImages.splice(index, 1);

    this.__layoutNeedsRegeneration = true;
  }

  getSubImage(index) {
    return this.__subImages[index];
  }

  numSubImages() {
    if (this.__layout) return this.__layout.length;
    return this.__subImages.length;
  }

  generateAtlasLayout() {
    const border = 2;

    // We must lay out the sub images in order of size.
    // else the paker might have trouble.
    const blocks = [];
    this.__subImages.forEach((subImage, index) => {
      blocks.push({
        w: subImage.width + border * 2,
        h: subImage.height + border * 2,
        area: subImage.width * subImage.height,
        index,
      });
    });

    blocks.sort((a, b) => (a.area > b.area ? -1 : a.area < b.area ? 1 : 0));

    const packer = new GrowingPacker();
    packer.fit(blocks);

    this.__layout = [];
    blocks.forEach((block, index) => {
      const subImage = this.__subImages[block.index];
      if (block.fit) {
        this.__layout[block.index] = {
          pos: new Vec2(block.fit.x + border, block.fit.y + border),
          size: new Vec2(block.w, block.h),
        };
      } else {
        console.warn('Unable to fit image');
      }
    });

    const width = packer.root.w;
    const height = packer.root.h;

    // console.log(this.__name + " Atlas Texture size:" + width.toFixed() + ", " + height.toFixed());

    // Note: only RGBA Float textures can be rendered to on Firefox.(Not RGB)
    this.configure({
      width,
      height,
      format:
        this.__typeParam == 'FLOAT' && this.__formatParam == 'RGB'
          ? 'RGBA'
          : this.__formatParam,
      type: this.__typeParam,
      filter: 'LINEAR',
    });

    const gl = this.__gl;
    this.__fbo = new GLFbo(gl, this);
    this.__fbo.setClearColor(this.__clearColor);

    if (!gl.__quadVertexIdsBuffer) gl.setupInstancedQuad();

    if (!gl.__atlasLayoutShader) {
      gl.__atlasLayoutShader = new AtlasLayoutShader(gl);
      const shaderComp = gl.__atlasLayoutShader.compileForTarget('ImageAtlas');
      gl.__atlasLayoutShaderBinding = generateShaderGeomBinding(
        gl,
        shaderComp.attrs,
        gl.__quadattrbuffers,
        gl.__quadIndexBuffer
      );
    }

    const pixelsPerItem = 1;
    let size = Math.round(
      Math.sqrt(this.__layout.length * pixelsPerItem) + 0.5
    );
    // Only support power 2 textures. Else we get strange corruption on some GPUs
    // in some scenes.
    size = Math.nextPow2(size);
    // Size should be a multiple of pixelsPerItem, so each geom item is always contiguous
    // in memory. (makes updating a lot easier. See __updateItemInstanceData below)
    if (size % pixelsPerItem != 0)
      size += pixelsPerItem - (size % pixelsPerItem);

    if (!gl.floatTexturesSupported) {
      this.__layoutVec4s = [];
      this.__layout.forEach((layoutItem, index) => {
        this.__layoutVec4s[index] = [
          layoutItem.pos.x / width,
          layoutItem.pos.y / height,
          layoutItem.size.x / width,
          layoutItem.size.y / height,
        ];
      });
    } else {
      const dataArray = new Float32Array(
        size * size * 4
      ); /* each pixel has 4 floats*/
      for (let i = 0; i < this.__layout.length; i++) {
        const layoutItem = this.__layout[i];
        const vec4 = Vec4.createFromFloat32Buffer(dataArray.buffer, i * 4);
        vec4.set(
          layoutItem.pos.x / width,
          layoutItem.pos.y / height,
          layoutItem.size.x / width,
          layoutItem.size.y / height
        );
      }
      if (
        !this.__atlasLayoutTexture ||
        this.__atlasLayoutTexture.width != size ||
        this.__atlasLayoutTexture.height != size
      ) {
        if (this.__atlasLayoutTexture) this.__atlasLayoutTexture.destroy();
        this.__atlasLayoutTexture = new GLTexture2D(gl, {
          format: 'RGBA',
          type: 'FLOAT',
          filter: 'NEAREST',
          wrap: 'CLAMP_TO_EDGE',
          mipMapped: false,
          width: size,
          height: size,
          data: dataArray,
        });
      } else {
        this.__atlasLayoutTexture.bufferData(dataArray, size, size);
      }
    }

    this.__layoutNeedsRegeneration = false;
  }

  getLayoutData(index) {
    return this.__layoutVec4s[index];
  }

  renderAtlas(cleanup = false, off = 0) {
    if (this.__layoutNeedsRegeneration) {
      this.generateAtlasLayout();
    }
    if (!this.__fbo) return;
    this.__fbo.bindAndClear();

    const gl = this.__gl;
    const renderstate = {};
    gl.__atlasLayoutShader.bind(renderstate, 'ImageAtlas');
    gl.__atlasLayoutShaderBinding.bind(renderstate);
    const scl = new Vec2(1.0 / this.width, 1.0 / this.height);

    const unifs = renderstate.unifs;
    for (let j = off; j < this.__subImages.length; j++) {
      const image = this.__subImages[j];

      const layoutItem = this.__layout[j];
      image.bindToUniform(renderstate, unifs.srctexture);
      gl.uniform2fv(unifs.pos.location, layoutItem.pos.multiply(scl).asArray());
      gl.uniform2fv(
        unifs.size.location,
        layoutItem.size.multiply(scl).asArray()
      );
      gl.uniform2f(unifs.srctextureDim.location, image.width, image.height);
      gl.uniform1i(unifs.alphaFromLuminance.location, image.alphaFromLuminance);
      gl.uniform1i(unifs.invert.location, image.invert);
      gl.drawQuad();
    }

    if (cleanup) {
      this.cleanup();
    }

    this.__fbo.unbind();
    this.updated.emit();
  }

  isReady() {
    return this.__atlasLayoutTexture != undefined;
  }

  bindToUniform(renderstate, unif) {
    if (!this.__atlasLayoutTexture) return false;

    super.bindToUniform(renderstate, unif);

    const unifs = renderstate.unifs;
    const atlasLayoutUnif = unifs[unif.name + '_layout'];
    if (atlasLayoutUnif)
      this.__atlasLayoutTexture.bindToUniform(renderstate, atlasLayoutUnif);

    const atlasDescUnif = unifs[unif.name + '_desc'];
    if (atlasDescUnif)
      this.__gl.uniform4f(
        atlasDescUnif.location,
        this.width,
        this.height,
        this.__atlasLayoutTexture.width,
        0.0
      );

    return true;
  }

  cleanup() {
    for (const image of this.__subImages) {
      image.destroy();
    }
    if (this.__fbo) this.__fbo.destroy();
    this.__subImages = [];
    this.__fbo = null;
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}

export { ImageAtlas };
// export default ImageAtlas;
