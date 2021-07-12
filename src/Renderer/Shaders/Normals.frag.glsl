
precision highp float;

uniform color normalColor;

/* VS Outputs */
varying float v_weight;


void main(void) {
  gl_FragColor = normalColor;
  gl_FragColor.a = v_weight;
}
