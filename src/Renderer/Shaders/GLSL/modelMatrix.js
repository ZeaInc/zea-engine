import { shaderLibrary } from '../../ShaderLibrary.js';

import './glslutils.js';

shaderLibrary.setShaderModule(
  'modelMatrix.glsl',
  `

#ifdef ENABLE_FLOAT_TEXTURES

uniform sampler2D instancesTexture;
uniform int instancesTextureSize;

attribute float instancedIds;    // instanced attribute..
uniform int transformIndex;
uniform int instancedDraw;

<%include file="GLSLUtils.glsl"/>

const int pixelsPerItem = 6;

vec4 getInstanceData(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 0);
}

mat4 getMatrix(sampler2D texture, int textureSize, int index) {
    // Unpack 3 x 4 matix columns into a 4 x 4 matrix.
    vec4 col0 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 1);
    vec4 col1 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 2);
    vec4 col2 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 3);
    mat4 result = mat4(col0, col1, col2, vec4(0.0, 0.0, 0.0, 1.0));
    return transpose(result);
    // return mat4(1.0);
}

mat4 getModelMatrix(int id) {
    return getMatrix(instancesTexture, instancesTextureSize, id);
}

vec4 getHighlightColor(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}

vec4 getCutaway(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}


int getId() {
    if(instancedDraw == 0){
       return transformIndex;
    }
    else{
       return int(instancedIds);
    }
}

vec4 getInstanceData() {
    return getInstanceData(getId());
}

mat4 getModelMatrix() {
    return getModelMatrix(getId());
}

vec4 getHighlightColor() {
    return getHighlightColor(getId());
}

vec4 getCutaway() {
    return getCutaway(getId());
}



#else

uniform mat4 modelMatrix;
uniform int transformIndex;
uniform vec4 drawItemData;
uniform vec4 highlightColor;

mat4 getModelMatrix() {
    return modelMatrix;
}

vec4 getInstanceData() {
    return drawItemData;
}

vec4 getHighlightColor() {
    return highlightColor;
}

int getId() {
    return transformIndex;
}

#endif


`
);
