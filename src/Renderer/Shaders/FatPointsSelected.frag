
precision highp float;

uniform int floatGeomBuffer;
uniform int passId;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;


import 'GLSLUtils.glsl' 
import 'drawItemTexture.glsl'

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else

uniform vec4 highlightColor;

vec4 getHighlightColor() {
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

  float dist = length(v_texCoord - 0.5);
  if (dist > 0.5)
    discard;
  
  int drawItemId = int(v_drawItemId + 0.5);
  fragColor = getHighlightColor(drawItemId);

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
