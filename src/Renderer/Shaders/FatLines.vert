
precision highp float;

instancedattribute vec2 segmentIndices;
attribute float vertexIDs;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

import 'GLSLUtils.glsl'
import 'transpose.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

uniform int drawItemId;
int getDrawItemId() {
    return drawItemId;
}


uniform sampler2D positionsTexture;
uniform int positionsTextureSize;

uniform float LineThickness;
uniform float Overlay;

import 'calcFatLinesViewPos.glsl'

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
varying vec2 v_texCoord;

void main(void) {
  int drawItemId = getDrawItemId();
  int vertexID = int(vertexIDs);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;

  vec3 pos;
  v_viewPos       = calcFatLinesViewPos(vertexID, modelViewMatrix, v_viewNormal, v_texCoord, pos);
  gl_Position     = projectionMatrix * vec4(v_viewPos, 1.0);
  
  if(Overlay > 0.0){
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, Overlay);
  }
}
