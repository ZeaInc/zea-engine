
precision highp float;

import 'gamma.glsl'
import 'GLSLUtils.glsl'
import 'materialparams.glsl'
import 'imageAtlas.glsl'

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
