import { shaderLibrary } from '../../ShaderLibrary.js'

import './ImageAtlas.js'

shaderLibrary.setShaderModule(
  'utils/imagePyramid.glsl',
  `

<%include file="utils/imageAtlas.glsl"/>

vec4 sampleImagePyramid(vec2 uv, float lod, in sampler2D atlasLayout, in sampler2D atlasImage, in vec4 atlasDesc){
  if (lod < 0.00001 || lod > 0.9999) {
    float imageIndex = lod * (atlasDesc.z-1.0);
    int imageId0 = int(imageIndex);
    return sampleSubImage(uv, imageId0, atlasLayout, atlasImage, atlasDesc);
  } else {
    float imageIndex = lod * (atlasDesc.z-1.0);
    int imageId0 = int(floor(imageIndex));
    int imageId1 = imageId0+1;
    float blend = fract(imageIndex);
    vec4 c0 = sampleSubImage(uv, imageId0, atlasLayout, atlasImage, atlasDesc);
    vec4 c1 = sampleSubImage(uv, imageId1, atlasLayout, atlasImage, atlasDesc);
    return mix(c0, c1, blend);
  } 
}


`
)
