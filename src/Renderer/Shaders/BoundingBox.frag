
precision highp float;

uniform highp int occlusionCulling;

/* VS Outputs */
varying vec4 v_color;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  int drawItemId = int(v_color.g);
  
  if (occlusionCulling != 0) {
    // Calculate a simple stochastic transparency to ensure that bounding boxes don't completely occlude each other. 
    // see e2e-test: occlusion-culling2
    int x = drawItemId + int(gl_FragCoord.x * 1000.0);
    int y = drawItemId + int(gl_FragCoord.y * 1000.0);
    if (x % 3 != 0 || y % 7 != 0) discard;
  }

  fragColor = v_color;

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
