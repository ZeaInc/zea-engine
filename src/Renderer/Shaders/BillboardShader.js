import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/materialparams.js'

class BillboardShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage(
      'VERTEX_SHADER',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 cameraMatrix;

<%include file="GLSLUtils.glsl"/>

#ifdef ENABLE_FLOAT_TEXTURES

// A sorted attribute of instance Ids so we draw from back to front.
instancedattribute float instanceIds;

<%include file="stack-gl/transpose.glsl"/>
<%include file="utils/imageAtlas.glsl"/>

uniform sampler2D atlasBillboards_layout;
uniform vec4 atlasBillboards_desc;

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
vec4 getInstanceData(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * cols_per_instance) + 3);
}
vec4 getPivot(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * cols_per_instance) + 4);
}

vec4 getTintColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * cols_per_instance) + 5);
}


#else

uniform vec4 atlasBillboards_desc;

uniform mat4 modelMatrix;
uniform vec2 pivot;
uniform vec4 billboardData;
uniform vec4 tintColor;
uniform vec4 layoutData;

#endif

uniform int inVR;

mat4 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  // vec3 rr = vec3(sin(roll), 0.0, cos(roll));
  vec3 rr = vec3(0.0, 0.0, 1.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(rr, ww));
  vec3 vv = normalize(cross(ww, uu));

  return mat4(vec4(uu, 0.0), vec4(vv, 0.0), vec4(ww, 0.0), vec4(origin, 1.0));
}

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

/* VS Outputs */
varying vec2 v_texCoord;
varying float v_alpha;
varying vec4 v_tint;

void main(void) {

#ifdef ENABLE_FLOAT_TEXTURES

  int instanceID = int(instanceIds);

  mat4 modelMatrix = getModelMatrix(instanceID);
  vec2 pivot = getPivot(instanceID).xy;
  vec4 billboardData = getInstanceData(instanceID);
  vec4 layoutData = fetchTexel(atlasBillboards_layout, int(atlasBillboards_desc.z), int(billboardData.z));
  v_tint = getTintColor(instanceID);

#else

  v_tint = tintColor;

#endif

  vec2 quadVertex = getQuadVertexPositionFromID();
  
  vec2 pos = quadVertex + vec2(0.5, 0.0) - pivot;
  v_texCoord = vec2(quadVertex.x, -quadVertex.y) + 0.5;
  v_alpha = billboardData.w;
  v_texCoord *= layoutData.zw;
  v_texCoord += layoutData.xy;

  float scl = billboardData.x;
  float width = layoutData.z * atlasBillboards_desc.x * scl;
  float height = layoutData.w * atlasBillboards_desc.y * scl;
  int flags = int(billboardData.y);

  // Use cross platform bit flags methods
  bool alignedToCamera = testFlag(flags, 4); // flag = 1<<2
  bool drawOnTop = testFlag(flags, 8); // flag = 1 << 3
  bool fixedSizeOnscreen = testFlag(flags, 16); // flag = 1 << 4

  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  float sc = 1.0;
  if(fixedSizeOnscreen) {
    float dist = modelViewMatrix[3][2];
    sc = abs(dist); // Note: items in front of the camera will have a negative value here.
  }
  
  mat4 modelViewProjectionMatrix;
  if(alignedToCamera){
    if (inVR == 0) {
      gl_Position = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      gl_Position += vec4(pos.x * width * sc, (pos.y + 0.5) * height * sc, 0.0, 0.0);
      gl_Position = projectionMatrix * gl_Position;
    } else {
      vec3 cameraPos = vec3(cameraMatrix[3][0], cameraMatrix[3][1], cameraMatrix[3][2]);
      vec3 billboardPos = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
      mat4 lookAt = calcLookAtMatrix(billboardPos, cameraPos, 0.0);
      mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * lookAt;
      gl_Position = modelViewProjectionMatrix * vec4(pos.x * width * sc, (pos.y + 0.5) * height * sc, 0.0, 1.0);
    }
  }
  else{
    modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
    gl_Position = modelViewProjectionMatrix * vec4(pos.x * width, (pos.y + 0.5) * height, 0.0, 1.0);
  }

  // Use cross platform bit flags methods
  if(drawOnTop){
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, 0.5);
  }
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

<%include file="stack-gl/gamma.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="materialparams.glsl"/>
<%include file="utils/imageAtlas.glsl"/>

uniform sampler2D atlasBillboards;

/* VS Outputs */
varying vec2 v_texCoord;
varying float v_alpha;
varying vec4 v_tint;


#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = texture2D(atlasBillboards, v_texCoord) * v_tint;
  fragColor.a *= v_alpha;

  // fragColor.r = 1.0;
  // fragColor.a = 1.0;
  
#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }
}

export { BillboardShader }
