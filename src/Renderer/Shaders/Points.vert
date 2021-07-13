
precision highp float;

attribute vec3 positions;

import 'GLSLUtils.glsl'
import 'transpose.glsl'
import 'inverse.glsl'
import 'drawItemId.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

#ifdef ENABLE_MULTI_DRAW
import 'materialparams.glsl'
#else
uniform float PointSize;
uniform float Overlay;
#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.);
  gl_Position = projectionMatrix * viewPos;
  

  //////////////////////////////////////////////
  // Material
#ifdef ENABLE_MULTI_DRAW
  vec2 materialCoords = v_geomItemData.zw;
  vec4 materialValue1 = getMaterialValue(materialCoords, 1);
  int maintainScreenSize = int(materialValue1.x + 0.5);
  float pointSize = materialValue1.x;
  float overlay = materialValue1.y;
#else
  float pointSize = PointSize;
  float overlay = Overlay;
#endif
  //////////////////////////////////////////////

  // Note: as of 22/01/2021 gl_PointSize has stopped working again...
  gl_PointSize = pointSize;

#if defined(DRAW_GEOMDATA)
  // Make the geom data point size at least 8 pixels across, else its impossible to hit.
  gl_PointSize = max(8.0, pointSize);
#endif
  gl_Position.z = mix(gl_Position.z, -gl_Position.w, overlay);

  
  v_viewPos = -viewPos.xyz;
}
