import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'
import './drawItemTexture.js'

shaderLibrary.setShaderModule(
  'modelMatrix.glsl',
  `

#ifdef ENABLE_FLOAT_TEXTURES

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

#else

uniform mat4 modelMatrix;

mat4 getModelMatrix(int id) {
    return modelMatrix;
}

#endif


`
)
