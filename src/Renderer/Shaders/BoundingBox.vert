
precision highp float;

attribute vec4 positions;
instancedattribute float instanceIds;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 cameraMatrix;

import 'GLSLUtils.glsl'

#ifdef ENABLE_FLOAT_TEXTURES


import 'transpose.glsl'

uniform sampler2D instancesTexture;
uniform int instancesTextureSize;


const int cols_per_instance = 6;

mat4 getMatrix(sampler2D texture, int textureSize, int index) {
  // Unpack 3 x 4 matix columns into a 4 x 4 matrix.
  vec4 col0 = fetchTexel(texture, textureSize, (index * cols_per_instance) + 0);
  vec4 col1 = fetchTexel(texture, textureSize, (index * cols_per_instance) + 1);
  vec4 col2 = fetchTexel(texture, textureSize, (index * cols_per_instance) + 2);
  mat4 result = mat4(col0, col1, col2, vec4(0.0, 0.0, 0.0, 1.0));
  return transpose(result);
  // return mat4(1.0);
}

mat4 getModelMatrix(int id) {
  return getMatrix(instancesTexture, instancesTextureSize, id);
}
vec4 getInstanceData(int id, int row) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * cols_per_instance) + row);
}


#else

uniform mat4 modelMatrix;
uniform vec4 row3;
uniform vec4 row4;
uniform vec4 row5;

#endif


/* VS Outputs */
varying vec4 v_color;

void main(void) {

#ifdef ENABLE_FLOAT_TEXTURES

  int instanceID = int(instanceIds);

  mat4 modelMatrix = getModelMatrix(instanceID);
  vec4 row3 = getInstanceData(instanceID, 3);
  vec4 row4 = getInstanceData(instanceID, 4);
  vec4 row5 = getInstanceData(instanceID, 5);

#else

#endif

  v_color = row5;

  vec4 pos = positions;
  if (pos.x < 0.0) pos.x = row3.x;
  else if (pos.x > 0.0) pos.x = row4.x;
  if (pos.y < 0.0) pos.y = row3.y;
  else if (pos.y > 0.0) pos.y = row4.y;
  if (pos.z < 0.0) pos.z = row3.z;
  else if (pos.z > 0.0) pos.z = row4.z;

  // Use cross platform bit flags methods
  bool drawOnTop = false;//testFlag(flags, 8); // flag = 1 << 3

  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix;// * modelMatrix;
  gl_Position = modelViewProjectionMatrix * pos;

  // Use cross platform bit flags methods
  if (drawOnTop) {
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, 0.5);
  }
}
