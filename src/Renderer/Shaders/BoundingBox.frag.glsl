
precision highp float;

/* VS Outputs */
varying vec4 v_color;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = v_color;

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
