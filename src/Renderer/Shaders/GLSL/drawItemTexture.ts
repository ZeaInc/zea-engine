import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'

shaderLibrary.setShaderModule(
  'drawItemId.glsl',
  `

#ifdef ENABLE_FLOAT_TEXTURES

attribute float instancedIds;    // instanced attribute..
uniform int instancedDraw;
uniform int transformIndex;

int getDrawItemId() {
    if(instancedDraw == 0){
       return transformIndex;
    }
    else{
       return int(instancedIds);
    }
}


#else

uniform int transformIndex;

int getDrawItemId() {
    return transformIndex;
}

#endif

`
)

shaderLibrary.setShaderModule(
  'drawItemTexture.glsl',
  `
<%include file="GLSLUtils.glsl"/>
  

#ifdef ENABLE_FLOAT_TEXTURES

uniform sampler2D instancesTexture;
uniform highp int instancesTextureSize;

const int pixelsPerItem = 6;

vec4 getInstanceData(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 0);
}

#else

uniform vec4 drawItemData;

vec4 getInstanceData(int id) {
    return drawItemData;
}

#endif


`
)
