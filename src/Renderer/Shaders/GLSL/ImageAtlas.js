import { shaderLibrary } from '../../ShaderLibrary.js';

import './glslutils.js';

shaderLibrary.setShaderModule(
  'utils/imageAtlas.glsl',
  `

// Note: On mobile, I can't seem to pass around a stuct containing sampler2D.
// I have to unpack the struct and pass its members. :(
// struct ImageAtlas {
//     sampler2D layout;
//     sampler2D image;
//     vec4 desc;
// };



vec4 getSubImageLayout(int index, in sampler2D atlasLayout, in vec4 atlasDesc){
    return fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
}

vec2 calcSubImageTexCoords(vec2 texCoord, int index, in sampler2D atlasLayout, in vec4 atlasDesc){
    vec4 layoutData = fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
    return (texCoord * layoutData.zw) + layoutData.xy;
}

vec4 sampleSubImage(vec2 texCoord, int index, in sampler2D atlasLayout, in sampler2D atlasImage, in vec4 atlasDesc){
    vec4 layoutData = fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
    return texture2D(atlasImage, (texCoord * layoutData.zw) + layoutData.xy);
}

`
);
