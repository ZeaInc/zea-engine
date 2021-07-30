 
precision highp float;

varying float v_drawItemId;


import 'GLSLUtils.glsl'
import 'drawItemTexture.glsl'

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else

uniform vec4 highlightColor;

vec4 getHighlightColor(int id) {
  return highlightColor;
}

#endif

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif
  int drawItemId = int(v_drawItemId + 0.5);
  fragColor = getHighlightColor(drawItemId);

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
