
#ifdef ENABLE_FLOAT_TEXTURES
import 'GLSLUtils.glsl'
import 'transpose.glsl'
mat4 getMatrix(sampler2D texture, int textureSize, int index) {
  // Unpack 3 x 4 matrix columns into a 4 x 4 matrix.
  vec4 col0 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 1);
  vec4 col1 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 2);
  vec4 col2 = fetchTexel(texture, textureSize, (index * pixelsPerItem) + 3);
  mat4 result = transpose(mat4(col0, col1, col2, vec4(0.0, 0.0, 0.0, 1.0)));
  return result;
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


