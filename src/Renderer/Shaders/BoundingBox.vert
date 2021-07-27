
precision highp float;

attribute vec4 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 cameraMatrix;

uniform highp int occlusionCulling;
uniform sampler2D reductionDataTexture;

import 'transpose.glsl'
import 'GLSLUtils.glsl'
import 'stack-gl/transpose.glsl'
import 'stack-gl/inverse.glsl'
import 'drawItemId.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

/* VS Outputs */
varying vec4 v_color;

void main(void) {

  int drawItemId = getDrawItemId();

     
  if (occlusionCulling != 0) {
    // Check if in the reduction texture, this item is already flagged as visible. 
    // Note: we only draw bboxes for those that have been flagged as invisible, but might
    // be just off screen, or onscreen, but were culled in the previous update.
    int isVisible = int(fetchTexel(reductionDataTexture, textureSize(reductionDataTexture, 0), drawItemId).r);
    if (isVisible > 0) {
      return;
    }
  }
 
 
  // vec4 geomItemData  = getInstanceData(drawItemId);
  // mat4 modelMatrix = getModelMatrix(drawItemId);
  vec4 bboxMin = fetchTexel(instancesTexture, instancesTextureSize, (drawItemId * pixelsPerItem) + 6);
  vec4 bboxMax = fetchTexel(instancesTexture, instancesTextureSize, (drawItemId * pixelsPerItem) + 7);
 
  if (occlusionCulling != 0) {
    v_color = vec4(float(drawItemId) / 5.0, 1.0, float(drawItemId) / 5.0, 1.0);
    v_color.g = float(drawItemId);
  } else {
    v_color = fetchTexel(instancesTexture, instancesTextureSize, (drawItemId * pixelsPerItem) + 4);
  }
 
  vec4 pos = positions;
  if (pos.x < 0.0) pos.x = bboxMin.x;
  else if (pos.x > 0.0) pos.x = bboxMax.x;
  if (pos.y < 0.0) pos.y = bboxMin.y;
  else if (pos.y > 0.0) pos.y = bboxMax.y;
  if (pos.z < 0.0) pos.z = bboxMin.z;
  else if (pos.z > 0.0) pos.z = bboxMax.z;

  mat4 viewProjectionMatrix = projectionMatrix * viewMatrix;
  gl_Position = viewProjectionMatrix * pos;
}
