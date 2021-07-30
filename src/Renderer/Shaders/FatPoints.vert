
precision highp float;

instancedattribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

import 'GLSLUtils.glsl' 
import 'inverse.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'
import 'quadVertexFromID.glsl'

uniform int drawItemId;
int getDrawItemId() {
  return drawItemId;
}

uniform float PointSize;
uniform float Overlay;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;

void main(void) {
  int drawItemId = getDrawItemId();
  vec2 quadPointPos = getQuadVertexPositionFromID();
  v_texCoord = quadPointPos + 0.5;

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.);

  viewPos += vec4(vec3(quadPointPos, 0.0) * PointSize, 0.);

  // Generate a quad which is 0.5 * PointSize closer towards
  // us. This allows points to be visualized even if snug on 
  // a surface. (else they get fully clipped)
  viewPos.z += 0.5 * PointSize;

  v_drawItemId = float(getDrawItemId());
  v_viewPos = -viewPos.xyz;
  
  gl_Position = projectionMatrix * viewPos;
  if (Overlay > 0.0) {
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, Overlay);
  }
}
