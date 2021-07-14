
precision highp float;

attribute vec3 positions;
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif

import 'GLSLUtils.glsl'
import 'transpose.glsl'
import 'drawItemId.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif


void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);

  gl_Position = (modelMatrix * vec4(positions, 1.0));

  v_textureCoord = texCoords;
  v_textureCoord.y = 1.0 - v_textureCoord.y;// Flip y
}
