import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'

shaderLibrary.setShaderModule(
  'drawItemId.glsl',
  `


#ifdef ENABLE_MULTI_DRAW

uniform sampler2D drawIdsTexture;

#ifdef EMULATE_MULTI_DRAW

uniform int drawId;
int getDrawItemId() {
  ivec2 drawIdsTextureSize = textureSize(drawIdsTexture, 0);
  ivec2 drawIdsArrayCoords = ivec2(drawId % drawIdsTextureSize.x, drawId / drawIdsTextureSize.x);
  return int(texelFetch(drawIdsTexture, drawIdsArrayCoords, 0).r + 0.5);
}

#else // EMULATE_MULTI_DRAW
int getDrawItemId() {
  ivec2 drawIdsTextureSize = textureSize(drawIdsTexture, 0);
  ivec2 drawIdsArrayCoords = ivec2(gl_DrawID % drawIdsTextureSize.x, gl_DrawID / drawIdsTextureSize.x);
  return int(texelFetch(drawIdsTexture, drawIdsArrayCoords, 0).r + 0.5);
}
#endif // EMULATE_MULTI_DRAW

#else // ENABLE_MULTI_DRAW

uniform int drawItemId;

#ifdef ENABLE_FLOAT_TEXTURES

attribute float instancedIds;    // instanced attribute..
uniform int instancedDraw;

int getDrawItemId() {
  if(instancedDraw == 0){
    return drawItemId;
  }
  else{
    return int(instancedIds);
  }
}


#else

int getDrawItemId() {
  return drawItemId;
}

#endif // ENABLE_FLOAT_TEXTURES
#endif // ENABLE_MULTI_DRAW

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
