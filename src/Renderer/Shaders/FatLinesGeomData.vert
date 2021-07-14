
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
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying float v_drawItemID;
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData = getInstanceData(drawItemId);

  int vertexID = int(vertexIDs);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;

  vec3  viewNormal;
  vec2  texCoord;
  vec3  pos;
  v_viewPos       = calcFatLinesViewPos(vertexID, modelViewMatrix, viewNormal, texCoord, pos);
  gl_Position     = projectionMatrix * vec4(v_viewPos, 1.0);
  

  v_drawItemID = float(getDrawItemId());
  
  v_worldPos      = (modelMatrix * vec4(pos, 1.0)).xyz;

  if(Overlay > 0.0){
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, Overlay);
  }

}
